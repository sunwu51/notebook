// @ts-nocheck
import "dotenv/config";
import { resolve } from "node:path";
import express from "express";
import { loadConfig, resolveModel } from "./src/config.js";
import { forwardRequest, forwardStreamRequest, passthroughRequest, passthroughStreamRequest } from "./src/proxy.js";
import {
  normalizeOpenAIChatRequest,
  normalizeOpenAIResponsesRequest,
  normalizeAnthropicRequest,
} from "./src/converters/requests.js";
import {
  denormalizeToOpenAIChatResponse,
  denormalizeToOpenAIResponsesResponse,
  denormalizeToAnthropicResponse,
} from "./src/converters/responses.js";
import { createSSEConverter, formatDone, SSEParser } from "./src/converters/streams.js";
import { cacheResponseItems, resolveItemReferences } from "./src/response-cache.js";
import type { StreamFormat } from "./src/converters/streams.js";
import type { NormalizedRequest, NormalizedResponse } from "./src/converters/shared.js";

// ─── Config ─────────────────────────────────────────────────────────────────

const configPath = process.env.CONFIG_PATH || resolve(import.meta.dirname, "config.yaml");
const config = loadConfig(configPath);
const app = express();

app.use(express.json({ limit: "10mb" }));

// ─── Helpers ────────────────────────────────────────────────────────────────

type Normalizer = (body: unknown) => NormalizedRequest;
type Denormalizer = (normalized: NormalizedResponse) => unknown;

function getNormalizer(format: StreamFormat): Normalizer {
  switch (format) {
    case "openai-chat":
      return normalizeOpenAIChatRequest;
    case "openai-responses":
      return normalizeOpenAIResponsesRequest;
    case "anthropic":
      return normalizeAnthropicRequest;
  }
}

function getDenormalizer(format: StreamFormat): Denormalizer {
  switch (format) {
    case "openai-chat":
      return denormalizeToOpenAIChatResponse;
    case "openai-responses":
      return denormalizeToOpenAIResponsesResponse;
    case "anthropic":
      return denormalizeToAnthropicResponse;
  }
}

function extractModel(body: unknown, format: StreamFormat): string | undefined {
  const b = body as Record<string, unknown>;
  return (b.model as string) ?? undefined;
}

function isStreamRequest(body: unknown, format: StreamFormat): boolean {
  const b = body as Record<string, unknown>;
  return b.stream === true;
}

// ─── Route Factory ──────────────────────────────────────────────────────────

function createRoute(incomingFormat: StreamFormat) {
  return async (req: express.Request, res: express.Response) => {
    const modelName = extractModel(req.body, incomingFormat);
    if (!modelName) {
      return res.status(400).json({ error: "Missing 'model' in request body" });
    }

    const modelConfig = resolveModel(config, modelName);
    if (!modelConfig) {
      return res.status(404).json({
        error: `Model '${modelName}' not found in config`,
        available: config.models.map((m) => m.name),
      });
    }

    const sameFormat = incomingFormat === modelConfig.provider;
    const stream = isStreamRequest(req.body, incomingFormat);

    // Resolve item_reference for Responses API requests
    if (incomingFormat === "openai-responses" && Array.isArray(req.body.input)) {
      req.body.input = resolveItemReferences(req.body.input);
    }

    try {
      if (sameFormat) {
        // ── Same format: passthrough, no conversion ──
        if (stream) {
          const body = await passthroughStreamRequest(modelConfig, req.body);
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");
          res.flushHeaders();
          await pipeStreamAndCache(body, res);
        } else {
          const json = await passthroughRequest(modelConfig, req.body);
          cacheResponseItems((json as any)?.output);
          res.json(json);
        }
      } else {
        // ── Different format: normalize → denormalize ──
        const normalize = getNormalizer(incomingFormat);
        const denormalize = getDenormalizer(incomingFormat);
        const normalized = normalize(req.body);

        if (stream) {
          const { body, upstreamFormat } = await forwardStreamRequest(modelConfig, normalized);
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");
          res.setHeader("X-Accel-Buffering", "no");
          res.flushHeaders();

          if (incomingFormat === "openai-responses") {
            // Collect full response to cache output items
            await pipeStreamAndCache(body, res, upstreamFormat !== incomingFormat ? createSSEConverter(upstreamFormat, incomingFormat) : undefined);
          } else {
            const converter = createSSEConverter(upstreamFormat, incomingFormat);
            const reader = body.getReader();
            const decoder = new TextDecoder();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                for (const chunk of converter.push(decoder.decode(value, { stream: true }))) {
                  res.write(chunk);
                }
              }
              for (const chunk of converter.flush()) {
                res.write(chunk);
              }
            } finally {
              reader.releaseLock();
              res.end();
            }
          }
        } else {
          const normalizedResponse = await forwardRequest(modelConfig, normalized);
          const output = denormalize(normalizedResponse);
          cacheResponseItems((output as any)?.output);
          res.json(output);
        }
      }
    } catch (error) {
      const err = error as Error & { status?: number; upstream?: string; cause?: unknown };
      console.error("[proxy error]", err.message, err.cause ?? "");
      const status = err.status || 500;
      res.status(status).json({
        error: err.message || "Request failed",
        ...(err.upstream ? { upstream: tryParseJSON(err.upstream) } : {}),
      });
    }
  };
}

/**
 * Pipe upstream SSE stream to response.
 * Optionally convert format via SSEConverter.
 * Caches output items from response.output_item.done events for item_reference resolution.
 */
async function pipeStreamAndCache(
  body: ReadableStream<Uint8Array>,
  res: express.Response,
  converter?: ReturnType<typeof createSSEConverter>,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const collector = new SSEParser();
  const outputItems: unknown[] = [];

  function collectItems(sseText: string) {
    for (const { data } of collector.push(sseText)) {
      try {
        const event = JSON.parse(data);
        if (event.type === "response.output_item.done" && event.item) {
          outputItems.push(event.item);
        }
      } catch {}
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });

      if (converter) {
        for (const chunk of converter.push(text)) {
          collectItems(chunk);
          res.write(chunk);
        }
      } else {
        collectItems(text);
        res.write(text);
      }
    }
    if (converter) {
      for (const chunk of converter.flush()) {
        collectItems(chunk);
        res.write(chunk);
      }
    }
    // Flush SSE parser for any remaining buffered events
    for (const { data } of collector.flush()) {
      try {
        const event = JSON.parse(data);
        if (event.type === "response.output_item.done" && event.item) {
          outputItems.push(event.item);
        }
      } catch {}
    }
  } finally {
    reader.releaseLock();
    cacheResponseItems(outputItems);
    res.end();
  }
}

function tryParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "nanollm gateway",
    models: config.models.map((m) => ({ name: m.name, provider: m.provider, model: m.model })),
    endpoints: {
      health: "GET /health",
      chat: "POST /v1/chat/completions",
      responses: "POST /v1/responses",
      messages: "POST /v1/messages",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/v1/models", (_req, res) => {
  res.json({
    object: "list",
    data: config.models.map((m) => ({
      id: m.name,
      object: "model",
      owned_by: m.provider,
    })),
  });
});

app.post("/v1/chat/completions", createRoute("openai-chat"));
app.post("/v1/responses", createRoute("openai-responses"));
app.post("/v1/messages", createRoute("anthropic"));

// ─── Start ──────────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`nanollm gateway listening on http://localhost:${config.port}`);
  console.log(`Models: ${config.models.map((m) => m.name).join(", ") || "(none)"}`);
});
