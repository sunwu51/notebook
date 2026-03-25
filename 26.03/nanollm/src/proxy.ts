// @ts-nocheck
import type { ModelConfig } from "./config.js";
import type { StreamFormat } from "./converters/streams.js";
import type { NormalizedRequest, NormalizedResponse } from "./converters/shared.js";
import {
  denormalizeToOpenAIChatRequest,
  denormalizeToOpenAIResponsesRequest,
  denormalizeToAnthropicRequest,
} from "./converters/requests.js";
import {
  normalizeOpenAIChatResponse,
  normalizeOpenAIResponsesResponse,
  normalizeAnthropicResponse,
} from "./converters/responses.js";

// ─── Upstream URL ───────────────────────────────────────────────────────────

function getUpstreamURL(config: ModelConfig): string {
  const base = config.base_url.replace(/\/+$/, "");
  switch (config.provider) {
    case "openai-chat":
      return `${base}/chat/completions`;
    case "openai-responses":
      return `${base}/responses`;
    case "anthropic":
      return `${base}/messages`;
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// ─── Auth Headers ───────────────────────────────────────────────────────────

function getAuthHeaders(config: ModelConfig): Record<string, string> {
  switch (config.provider) {
    case "openai-chat":
    case "openai-responses":
      return { Authorization: `Bearer ${config.api_key}` };
    case "anthropic":
      return {
        "x-api-key": config.api_key,
        "anthropic-version": "2023-06-01",
      };
    default:
      return {};
  }
}

// ─── Denormalize Request ────────────────────────────────────────────────────

function denormalizeRequest(provider: StreamFormat, normalized: NormalizedRequest): unknown {
  switch (provider) {
    case "openai-chat":
      return denormalizeToOpenAIChatRequest(normalized);
    case "openai-responses":
      return denormalizeToOpenAIResponsesRequest(normalized);
    case "anthropic":
      return denormalizeToAnthropicRequest(normalized);
  }
}

/** For non-passthrough OpenAI requests, disable server-side storage to prevent item_reference usage. */
function applyOpenAIDefaults(provider: StreamFormat, body: unknown): unknown {
  if (provider === "openai-chat" || provider === "openai-responses") {
    (body as Record<string, unknown>).store = false;
  }
  return body;
}

// ─── Normalize Response ─────────────────────────────────────────────────────

function normalizeUpstreamResponse(provider: StreamFormat, body: unknown): NormalizedResponse {
  switch (provider) {
    case "openai-chat":
      return normalizeOpenAIChatResponse(body as any);
    case "openai-responses":
      return normalizeOpenAIResponsesResponse(body as any);
    case "anthropic":
      return normalizeAnthropicResponse(body as any);
  }
}

// ─── Shared fetch ───────────────────────────────────────────────────────────

async function upstreamFetch(config: ModelConfig, body: string, stream: boolean): Promise<Response> {
  const url = getUpstreamURL(config);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(config),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Upstream ${res.status}: ${text}`) as Error & { status: number; upstream: string };
    err.status = res.status;
    err.upstream = text;
    throw err;
  }

  return res;
}

// ─── Passthrough (same format, no conversion) ───────────────────────────────

export async function passthroughRequest(
  config: ModelConfig,
  rawBody: Record<string, unknown>,
): Promise<unknown> {
  const body: Record<string, unknown> = { ...rawBody, model: config.model, stream: false };
  const res = await upstreamFetch(config, JSON.stringify(body), false);
  return res.json();
}

export async function passthroughStreamRequest(
  config: ModelConfig,
  rawBody: Record<string, unknown>,
): Promise<ReadableStream<Uint8Array>> {
  const body: Record<string, unknown> = { ...rawBody, model: config.model, stream: true };
  const res = await upstreamFetch(config, JSON.stringify(body), true);
  if (!res.body) throw new Error("Upstream returned no streaming body");
  return res.body;
}

// ─── Forward with conversion (different format) ────────────────────────────

export async function forwardRequest(
  config: ModelConfig,
  normalized: NormalizedRequest,
): Promise<NormalizedResponse> {
  normalized.stream = false;
  normalized.model = config.model;

  const body = applyOpenAIDefaults(config.provider, denormalizeRequest(config.provider, normalized));
  const res = await upstreamFetch(config, JSON.stringify(body), false);
  const json = await res.json();
  return normalizeUpstreamResponse(config.provider, json);
}

export async function forwardStreamRequest(
  config: ModelConfig,
  normalized: NormalizedRequest,
): Promise<{ body: ReadableStream<Uint8Array>; upstreamFormat: StreamFormat }> {
  normalized.stream = true;
  normalized.model = config.model;

  const body = applyOpenAIDefaults(config.provider, denormalizeRequest(config.provider, normalized));
  const res = await upstreamFetch(config, JSON.stringify(body), true);
  if (!res.body) throw new Error("Upstream returned no streaming body");
  return { body: res.body, upstreamFormat: config.provider };
}
