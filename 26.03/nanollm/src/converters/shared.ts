import type { Message, MessageCreateParamsBase, MessageParam, ToolChoice, ToolUnion } from "@anthropic-ai/sdk/resources/messages/messages";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions/completions";
import type { Response, ResponseCreateParamsBase, ResponseInputItem, ResponseOutputItem } from "openai/resources/responses/responses";

export type OpenAIChatRequest = ChatCompletionCreateParamsBase;
export type OpenAIResponsesRequest = ResponseCreateParamsBase;
export type AnthropicMessagesRequest = MessageCreateParamsBase;

export type OpenAIChatResponse = ChatCompletion;
export type OpenAIResponsesResponse = Response;
export type AnthropicMessagesResponse = Message;

export type NormalizedRole = "system" | "developer" | "user" | "assistant" | "tool" | "function";

export type NormalizedPart =
  | { type: "text"; text: string }
  | { type: "refusal"; text: string }
  | { type: "image_url"; url: string; detail?: "auto" | "low" | "high" }
  | { type: "input_audio"; data: string; format: "mp3" | "wav" }
  | { type: "document_url"; url: string; title?: string | null }
  | { type: "document_base64"; data: string; mediaType?: string; title?: string | null };

export type NormalizedTool =
  | {
      kind: "function";
      name: string;
      description?: string | null;
      inputSchema: Record<string, unknown>;
      strict?: boolean | null;
    }
  | {
      kind: "custom";
      name: string;
      description?: string | null;
      format?: unknown;
    };

export type NormalizedToolChoice =
  | { type: "auto"; disableParallel?: boolean }
  | { type: "required"; disableParallel?: boolean }
  | { type: "none" }
  | { type: "tool"; name: string; kind: "function" | "custom"; disableParallel?: boolean };

export type NormalizedToolCall =
  | { kind: "function"; id: string; name: string; payload: string }
  | { kind: "custom"; id: string; name: string; payload: string };

export interface NormalizedMessage {
  role: NormalizedRole;
  parts: NormalizedPart[];
  toolCalls?: NormalizedToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface NormalizedRequest {
  model: string;
  maxOutputTokens?: number;
  messages: NormalizedMessage[];
  tools?: NormalizedTool[];
  toolChoice?: NormalizedToolChoice;
  metadata?: Record<string, unknown> | null;
  serviceTier?: string | null;
  stream?: boolean;
  temperature?: number | null;
  topP?: number | null;
  stopSequences?: string[];
  parallelToolCalls?: boolean;
  promptCacheKey?: string;
  promptCacheRetention?: "in-memory" | "24h" | null;
  safetyIdentifier?: string;
  reasoningEffort?: string | null;
  responseFormat?:
    | { type: "text" }
    | { type: "json_object" }
    | { type: "json_schema"; name: string; schema?: Record<string, unknown>; description?: string; strict?: boolean | null };
}

export interface NormalizedResponse {
  id: string;
  createdAt: number;
  model: string;
  finishReason: string | null;
  message: NormalizedMessage;
  usage?: Record<string, unknown>;
}

export function fail(message: string): never {
  throw new Error(message);
}

export function text(textValue: string): NormalizedPart {
  return { type: "text", text: textValue };
}

export function refusal(textValue: string): NormalizedPart {
  return { type: "refusal", text: textValue };
}

export function collapseText(parts: NormalizedPart[]): string {
  return parts
    .map((part) => {
      if (part.type === "text" || part.type === "refusal") {
        return part.text;
      }

      fail(`Cannot collapse "${part.type}" to text`);
    })
    .join("\n");
}

export function requireTextOnly(parts: NormalizedPart[], context: string): NormalizedPart[] {
  for (const part of parts) {
    if (part.type !== "text" && part.type !== "refusal") {
      fail(`${context} only supports text content`);
    }
  }
  return parts;
}

export function parseJson(textValue: string, context: string): unknown {
  try {
    return JSON.parse(textValue);
  } catch {
    fail(`${context} contains invalid JSON`);
  }
}

export function stringifyJson(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function makeDataUrl(mediaType: string, data: string): string {
  return `data:${mediaType};base64,${data}`;
}

export function parseDataUrl(url: string): { mediaType: string; data: string } | null {
  const match = url.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  return {
    mediaType: match[1],
    data: match[2],
  };
}

export type {
  Message,
  MessageCreateParamsBase,
  MessageParam,
  ToolChoice,
  ToolUnion,
  ChatCompletion,
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  Response,
  ResponseCreateParamsBase,
  ResponseInputItem,
  ResponseOutputItem,
};
