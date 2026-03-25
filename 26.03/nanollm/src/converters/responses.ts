// @ts-nocheck
import type {
  AnthropicMessagesResponse,
  NormalizedMessage,
  NormalizedResponse,
  OpenAIChatResponse,
  OpenAIResponsesResponse,
} from "./shared.js";
import { collapseText, fail, parseJson, refusal, text } from "./shared.js";

export function normalizeOpenAIChatResponse(response: OpenAIChatResponse): NormalizedResponse {
  const choice = response.choices[0];
  const message = choice?.message;

  return {
    id: response.id,
    createdAt: response.created,
    model: response.model,
    finishReason: choice?.finish_reason ?? null,
    message: {
      role: "assistant",
      parts: [
        ...(typeof message?.content === "string"
          ? [text(message.content)]
          : message?.content?.map((part) => (part.type === "text" ? text(part.text) : refusal(part.refusal))) ?? []),
        ...(message?.refusal ? [refusal(message.refusal)] : []),
      ],
      toolCalls:
        message?.tool_calls?.map((toolCall) =>
          toolCall.type === "function"
            ? { kind: "function" as const, id: toolCall.id, name: toolCall.function.name, payload: toolCall.function.arguments }
            : { kind: "custom" as const, id: toolCall.id, name: toolCall.custom.name, payload: toolCall.custom.input },
        ) ?? [],
    },
    usage: response.usage as Record<string, unknown> | undefined,
  };
}

export function normalizeOpenAIResponsesResponse(response: OpenAIResponsesResponse): NormalizedResponse {
  const parts: NormalizedMessage["parts"] = [];
  const toolCalls: NonNullable<NormalizedMessage["toolCalls"]> = [];

  for (const item of response.output) {
    if (item.type === "message") {
      for (const block of item.content) {
        if (block.type === "output_text") parts.push(text(block.text));
        else if (block.type === "refusal") parts.push(refusal(block.refusal));
      }
      continue;
    }

    if (item.type === "function_call") {
      toolCalls.push({ kind: "function", id: item.call_id, name: item.name, payload: item.arguments });
      continue;
    }

    if (item.type === "custom_tool_call") {
      toolCalls.push({ kind: "custom", id: item.call_id, name: item.name, payload: item.input });
      continue;
    }

    if (item.type === "reasoning") {
      for (const part of item.content ?? []) {
        parts.push({ type: "thinking", thinking: part.text });
      }
      for (const part of item.summary ?? []) {
        parts.push({ type: "thinking", thinking: part.text });
      }
      if (item.encrypted_content) {
        parts.push({ type: "redacted_thinking", data: item.encrypted_content });
      }
    }
  }

  return {
    id: response.id,
    createdAt: response.created_at,
    model: response.model,
    finishReason: toolCalls.length > 0 ? "tool_calls" : response.status === "incomplete" ? "length" : "stop",
    message: {
      role: "assistant",
      parts,
      toolCalls,
    },
    usage: response.usage as Record<string, unknown> | undefined,
  };
}

export function normalizeAnthropicResponse(response: AnthropicMessagesResponse): NormalizedResponse {
  const parts: NormalizedMessage["parts"] = [];
  const toolCalls: NonNullable<NormalizedMessage["toolCalls"]> = [];

  for (const block of response.content) {
    if (block.type === "text") {
      parts.push(text(block.text));
      continue;
    }

    if (block.type === "thinking") {
      parts.push({ type: "thinking", thinking: block.thinking, signature: block.signature });
      continue;
    }

    if (block.type === "redacted_thinking") {
      parts.push({ type: "redacted_thinking", data: block.data });
      continue;
    }

    if (block.type === "tool_use" || block.type === "server_tool_use") {
      toolCalls.push({
        kind: "function",
        id: block.id,
        name: block.name,
        payload: JSON.stringify(block.input),
      });
    }
  }

  return {
    id: response.id,
    createdAt: 0,
    model: response.model,
    finishReason: response.stop_reason,
    message: {
      role: "assistant",
      parts,
      toolCalls,
    },
    usage: response.usage as Record<string, unknown> | undefined,
  };
}

export function denormalizeToOpenAIChatResponse(response: NormalizedResponse): OpenAIChatResponse {
  return {
    id: response.id,
    object: "chat.completion",
    created: response.createdAt,
    model: response.model,
    choices: [
      {
        index: 0,
        finish_reason: normalizeChatFinishReason(response.finishReason),
        logprobs: null,
        message: {
          role: "assistant",
          content: response.message.parts.length === 0 ? null : response.message.parts.map((part) => (part.type === "text" ? { type: "text", text: part.text } : { type: "refusal", refusal: part.text })),
          refusal: response.message.parts.find((part) => part.type === "refusal")?.text ?? null,
          tool_calls: response.message.toolCalls?.map((toolCall) =>
            toolCall.kind === "function"
              ? { id: toolCall.id, type: "function", function: { name: toolCall.name, arguments: toolCall.payload } }
              : { id: toolCall.id, type: "custom", custom: { name: toolCall.name, input: toolCall.payload } },
          ),
        },
      },
    ],
    usage: response.usage as OpenAIChatResponse["usage"],
  };
}

export function denormalizeToOpenAIResponsesResponse(response: NormalizedResponse): OpenAIResponsesResponse {
  return {
    id: response.id,
    object: "response",
    created_at: response.createdAt,
    model: response.model,
    output_text: collapseText(response.message.parts.filter((part) => part.type === "text" || part.type === "refusal") as any),
    error: null,
    incomplete_details: null,
    instructions: null,
    metadata: null,
    output: [
      ...response.message.parts
        .filter((part) => part.type === "thinking" || part.type === "redacted_thinking")
        .map((part, index) =>
          part.type === "thinking"
            ? {
                id: `reasoning_${index}`,
                type: "reasoning",
                summary: [{ type: "summary_text", text: part.thinking }],
                content: [{ type: "reasoning_text", text: part.thinking }],
                encrypted_content: part.signature ?? null,
                status: "completed",
              }
            : {
                id: `reasoning_${index}`,
                type: "reasoning",
                summary: [],
                encrypted_content: part.data,
                status: "completed",
              },
        ),
      ...(response.message.parts.length > 0
        ? [
            {
              id: "msg_1",
              type: "message",
              role: "assistant",
              status: "completed",
              content: response.message.parts.filter((part) => part.type !== "thinking" && part.type !== "redacted_thinking").map((part) =>
                part.type === "text"
                  ? { type: "output_text", text: part.text, annotations: [] }
                  : { type: "refusal", refusal: part.text },
              ),
            },
          ]
        : []),
      ...(response.message.toolCalls?.map((toolCall) =>
        toolCall.kind === "function"
          ? { id: toolCall.id, type: "function_call", call_id: toolCall.id, name: toolCall.name, arguments: toolCall.payload, status: "completed" }
          : { type: "custom_tool_call", call_id: toolCall.id, name: toolCall.name, input: toolCall.payload },
      ) ?? []),
    ] as OpenAIResponsesResponse["output"],
    parallel_tool_calls: (response.message.toolCalls?.length ?? 0) > 1,
    temperature: null,
    tool_choice: "auto",
    tools: [],
    top_p: null,
    status: "completed",
    text: { format: { type: "text" } },
    usage: response.usage as OpenAIResponsesResponse["usage"],
  };
}

export function denormalizeToAnthropicResponse(response: NormalizedResponse): AnthropicMessagesResponse {
  return {
    id: response.id,
    type: "message",
    role: "assistant",
    model: response.model,
    container: null,
    stop_reason: normalizeAnthropicStopReason(response.finishReason),
    stop_sequence: null,
    content: [
      ...response.message.parts.map((part) => ({
        type: "text" as const,
        text: part.type === "text" || part.type === "refusal" ? part.text : collapseText([part]),
        citations: null,
      })),
      ...(response.message.toolCalls?.map((toolCall) => {
        if (toolCall.kind !== "function") fail("Anthropic response conversion only supports function-style tool calls");
        return {
          type: "tool_use" as const,
          id: toolCall.id,
          caller: { type: "direct" as const },
          name: toolCall.name,
          input: parseJson(toolCall.payload, `Anthropic tool call "${toolCall.name}"`),
        };
      }) ?? []),
    ],
    usage: (response.usage as AnthropicMessagesResponse["usage"]) ?? {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      server_tool_use: null,
    },
  };
}

function normalizeChatFinishReason(reason: string | null): OpenAIChatResponse["choices"][number]["finish_reason"] {
  if (reason === "tool_use" || reason === "tool_calls") return "tool_calls";
  if (reason === "max_tokens" || reason === "length") return "length";
  if (reason === "refusal") return "content_filter";
  return "stop";
}

function normalizeAnthropicStopReason(reason: string | null): AnthropicMessagesResponse["stop_reason"] {
  if (reason === "tool_calls" || reason === "tool_use") return "tool_use";
  if (reason === "length" || reason === "max_tokens") return "max_tokens";
  if (reason === "stop_sequence") return "stop_sequence";
  if (reason === "pause_turn") return "pause_turn";
  if (reason === "refusal" || reason === "content_filter") return "refusal";
  return "end_turn";
}
