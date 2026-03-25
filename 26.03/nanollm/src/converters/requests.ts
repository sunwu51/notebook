// @ts-nocheck
import type {
  AnthropicMessagesRequest,
  MessageCreateParamsBase,
  MessageParam,
  NormalizedMessage,
  NormalizedRequest,
  NormalizedTool,
  NormalizedToolChoice,
  OpenAIChatRequest,
  OpenAIResponsesRequest,
  ToolChoice,
  ToolUnion,
} from "./shared.js";
import {
  collapseText,
  fail,
  makeDataUrl,
  parseDataUrl,
  parseJson,
  refusal,
  requireTextOnly,
  text,
} from "./shared.js";

const UNSUPPORTED_OPENAI_CHAT_FIELDS = ["audio", "frequency_penalty", "logit_bias", "logprobs", "modalities", "n", "prediction", "presence_penalty", "seed", "top_logprobs", "web_search_options"] as const;
const UNSUPPORTED_OPENAI_RESPONSES_FIELDS = ["background", "context_management", "conversation", "previous_response_id", "prompt", "truncation"] as const;
const UNSUPPORTED_ANTHROPIC_FIELDS = ["container", "inference_geo", "top_k"] as const;

export function normalizeOpenAIChatRequest(request: OpenAIChatRequest): NormalizedRequest {
  for (const key of UNSUPPORTED_OPENAI_CHAT_FIELDS) {
    if (request[key] !== undefined && request[key] !== null) fail(`Chat field "${key}" is not supported`);
  }

  return {
    model: request.model,
    maxOutputTokens: request.max_completion_tokens ?? request.max_tokens ?? undefined,
    messages: request.messages.flatMap((message) => normalizeOpenAIChatMessage(message as any)),
    tools: [
      ...(request.tools?.map((tool) => normalizeOpenAIChatTool(tool as any)) ?? []),
      ...(request.functions?.map((tool) => ({
        kind: "function" as const,
        name: tool.name,
        description: tool.description,
        inputSchema: (tool.parameters as Record<string, unknown> | undefined) ?? { type: "object" },
      })) ?? []),
    ],
    toolChoice:
      request.tool_choice !== undefined
        ? normalizeOpenAIChatToolChoice(request.tool_choice as any)
        : request.function_call !== undefined
          ? normalizeOpenAIChatLegacyFunctionChoice(request.function_call as any)
          : undefined,
    metadata: request.metadata ?? null,
    serviceTier: request.service_tier ?? null,
    stream: request.stream ?? false,
    temperature: request.temperature ?? null,
    topP: request.top_p ?? null,
    stopSequences: request.stop === undefined || request.stop === null ? undefined : Array.isArray(request.stop) ? request.stop : [request.stop],
    parallelToolCalls: request.parallel_tool_calls,
    promptCacheKey: request.prompt_cache_key,
    promptCacheRetention: request.prompt_cache_retention ?? null,
    safetyIdentifier: request.safety_identifier,
    reasoningEffort: request.reasoning_effort ?? null,
    responseFormat: normalizeOpenAIChatResponseFormat(request.response_format as any),
  };
}

export function normalizeOpenAIResponsesRequest(request: OpenAIResponsesRequest): NormalizedRequest {
  for (const key of UNSUPPORTED_OPENAI_RESPONSES_FIELDS) {
    if (request[key] !== undefined && request[key] !== null) fail(`Responses field "${key}" is not supported`);
  }

  const messages: NormalizedMessage[] = [];
  if (request.instructions) {
    if (typeof request.instructions === "string") messages.push({ role: "developer", parts: [text(request.instructions)] });
    else messages.push(...normalizeOpenAIResponsesInput(request.instructions as any[]));
  }
  if (request.input !== undefined) messages.push(...normalizeOpenAIResponsesInput(typeof request.input === "string" ? request.input : (request.input as any[])));

  return {
    model: request.model ?? "",
    maxOutputTokens: request.max_output_tokens ?? undefined,
    messages,
    tools: request.tools?.map((tool) => normalizeOpenAIResponsesTool(tool as any)),
    toolChoice: request.tool_choice ? normalizeOpenAIResponsesToolChoice(request.tool_choice as any) : undefined,
    metadata: request.metadata ?? null,
    serviceTier: request.service_tier ?? null,
    stream: request.stream ?? false,
    temperature: request.temperature ?? null,
    topP: request.top_p ?? null,
    parallelToolCalls: request.parallel_tool_calls,
    promptCacheKey: request.prompt_cache_key,
    promptCacheRetention: request.prompt_cache_retention ?? null,
    safetyIdentifier: request.safety_identifier,
    reasoningEffort: request.reasoning?.effort ?? null,
    responseFormat: normalizeOpenAIResponsesFormat(request.text?.format as any),
  };
}

export function normalizeAnthropicRequest(request: AnthropicMessagesRequest): NormalizedRequest {
  for (const key of UNSUPPORTED_ANTHROPIC_FIELDS) {
    if (request[key] !== undefined && request[key] !== null) fail(`Anthropic field "${key}" is not supported`);
  }

  const messages: NormalizedMessage[] = [];
  if (request.system) messages.push(normalizeAnthropicSystem(request.system as any));
  for (const message of request.messages) messages.push(...normalizeAnthropicMessage(message));

  return {
    model: request.model,
    maxOutputTokens: request.max_tokens,
    messages,
    tools: request.tools?.map((tool) => normalizeAnthropicTool(tool)),
    toolChoice: request.tool_choice ? normalizeAnthropicToolChoice(request.tool_choice) : undefined,
    metadata: request.metadata ? { user_id: request.metadata.user_id ?? null } : null,
    serviceTier: request.service_tier ?? null,
    stream: request.stream ?? false,
    temperature: request.temperature ?? null,
    topP: request.top_p ?? null,
    stopSequences: request.stop_sequences,
    reasoningEffort: request.thinking?.type === "enabled" ? `budget:${request.thinking.budget_tokens}` : null,
    responseFormat: request.output_config?.format ? { type: "json_schema", name: "anthropic_output", schema: request.output_config.format.schema } : undefined,
  };
}

export function denormalizeToOpenAIChatRequest(request: NormalizedRequest): OpenAIChatRequest {
  return {
    model: request.model,
    messages: request.messages.flatMap((message) => denormalizeOpenAIChatMessage(message)),
    max_completion_tokens: request.maxOutputTokens,
    metadata: request.metadata ?? undefined,
    service_tier: normalizeOpenAIServiceTier(request.serviceTier),
    stream: request.stream,
    temperature: request.temperature ?? undefined,
    top_p: request.topP ?? undefined,
    stop: request.stopSequences,
    parallel_tool_calls: request.parallelToolCalls,
    prompt_cache_key: request.promptCacheKey,
    prompt_cache_retention: request.promptCacheRetention ?? undefined,
    safety_identifier: request.safetyIdentifier,
    reasoning_effort: request.reasoningEffort as OpenAIChatRequest["reasoning_effort"],
    response_format: denormalizeOpenAIChatResponseFormat(request.responseFormat),
    tools: request.tools?.map((tool) =>
      tool.kind === "function"
        ? { type: "function", function: { name: tool.name, description: tool.description ?? undefined, parameters: tool.inputSchema, strict: tool.strict ?? undefined } }
        : { type: "custom", custom: { name: tool.name, description: tool.description ?? undefined, format: tool.format as never } },
    ) as OpenAIChatRequest["tools"],
    tool_choice: denormalizeOpenAIChatToolChoice(request.toolChoice),
  };
}

export function denormalizeToOpenAIResponsesRequest(request: NormalizedRequest): OpenAIResponsesRequest {
  const instructionLines: string[] = [];
  let index = 0;
  while (index < request.messages.length) {
    const message = request.messages[index];
    if (message.role === "system" || message.role === "developer") {
      instructionLines.push(collapseText(requireTextOnly(message.parts, "Responses instructions")));
      index += 1;
      continue;
    }
    break;
  }

  return {
    model: request.model,
    instructions: instructionLines.length > 0 ? instructionLines.join("\n") : undefined,
    input: request.messages.slice(index).flatMap((message) => denormalizeOpenAIResponsesMessage(message)) as any,
    max_output_tokens: request.maxOutputTokens,
    metadata: request.metadata ?? undefined,
    service_tier: normalizeOpenAIResponsesServiceTier(request.serviceTier),
    stream: request.stream,
    temperature: request.temperature ?? undefined,
    top_p: request.topP ?? undefined,
    parallel_tool_calls: request.parallelToolCalls,
    prompt_cache_key: request.promptCacheKey,
    prompt_cache_retention: request.promptCacheRetention ?? undefined,
    safety_identifier: request.safetyIdentifier,
    reasoning: request.reasoningEffort ? { effort: request.reasoningEffort as never } : undefined,
    text: request.responseFormat ? { format: denormalizeOpenAIResponsesFormat(request.responseFormat) } : undefined,
    tools: request.tools?.map((tool) =>
      tool.kind === "function"
        ? { type: "function", name: tool.name, description: tool.description ?? undefined, parameters: tool.inputSchema, strict: tool.strict ?? undefined }
        : { type: "custom", name: tool.name, description: tool.description ?? undefined, format: tool.format as never },
    ) as OpenAIResponsesRequest["tools"],
    tool_choice: denormalizeOpenAIResponsesToolChoice(request.toolChoice),
  };
}

export function denormalizeToAnthropicRequest(request: NormalizedRequest): MessageCreateParamsBase {
  const systemBlocks: { type: "text"; text: string }[] = [];
  const filteredMessages: NormalizedMessage[] = [];
  
  for (const message of request.messages) {
    if (message.role === "system" || message.role === "developer") {
      for (const part of requireTextOnly(message.parts, "Anthropic [REDACTED]")) systemBlocks.push({ type: "text", text: part.text });
    } else {
      filteredMessages.push(message);
    }
  }

  return {
    model: request.model,
    max_tokens: request.maxOutputTokens ?? 1024,
    system: systemBlocks.length > 0 ? systemBlocks : undefined,
    messages: mergeAnthropicMessages(filteredMessages.flatMap((message) => denormalizeAnthropicMessage(message))),
    metadata: denormalizeAnthropicMetadata(request.metadata),
    service_tier: normalizeAnthropicServiceTier(request.serviceTier),
    stream: request.stream,
    stop_sequences: request.stopSequences,
    temperature: request.temperature ?? undefined,
    top_p: request.topP ?? undefined,
    tools: request.tools?.filter(tool => tool.kind === "function").map((tool) => denormalizeAnthropicTool(tool)),
    tool_choice: denormalizeAnthropicToolChoice(request.toolChoice),
    output_config: request.responseFormat?.type === "json_schema" ? { format: { type: "json_schema", schema: request.responseFormat.schema ?? {} } } : undefined,
    thinking: denormalizeAnthropicThinking(request.reasoningEffort, request.maxOutputTokens),
  };
}

function normalizeOpenAIChatMessage(message: any): NormalizedMessage[] {
  switch (message.role) {
    case "system":
    case "developer":
      return [{ role: message.role, parts: [text(typeof message.content === "string" ? message.content : message.content.map((part: any) => part.text).join("\n"))] }];
    case "user":
      return [{ role: "user", parts: normalizeOpenAIChatUserParts(message.content) }];
    case "assistant":
      return [{ role: "assistant", parts: normalizeOpenAIChatAssistantParts(message), toolCalls: [...(message.tool_calls?.map((toolCall: any) => normalizeOpenAIChatToolCall(toolCall)) ?? []), ...(message.function_call ? [{ kind: "function", id: `${message.function_call.name}:legacy`, name: message.function_call.name, payload: message.function_call.arguments }] : [])] }];
    case "tool":
      return [{ role: "tool", toolCallId: message.tool_call_id, parts: [text(typeof message.content === "string" ? message.content : message.content.map((part: any) => part.text).join("\n"))] }];
    case "function":
      return [{ role: "function", name: message.name, parts: message.content ? [text(message.content)] : [] }];
    default:
      fail(`Unsupported chat role "${message.role}"`);
  }
}

function normalizeOpenAIChatUserParts(content: any): NormalizedMessage["parts"] {
  if (typeof content === "string") return [text(content)];
  return content.map((part: any) => {
    if (part.type === "text") return text(part.text);
    if (part.type === "image_url") return { type: "image_url", url: part.image_url.url, detail: part.image_url.detail };
    if (part.type === "input_audio") return { type: "input_audio", data: part.input_audio.data, format: part.input_audio.format };
    fail(`Unsupported chat user content part "${part.type}"`);
  });
}

function normalizeOpenAIChatAssistantParts(message: any): NormalizedMessage["parts"] {
  const parts: NormalizedMessage["parts"] = [];
  if (typeof message.content === "string") parts.push(text(message.content));
  else for (const part of message.content ?? []) parts.push(part.type === "text" ? text(part.text) : refusal(part.refusal));
  if (message.refusal) parts.push(refusal(message.refusal));
  return parts;
}

function normalizeOpenAIChatToolCall(toolCall: any) {
  return toolCall.type === "function" ? { kind: "function" as const, id: toolCall.id, name: toolCall.function.name, payload: toolCall.function.arguments } : { kind: "custom" as const, id: toolCall.id, name: toolCall.custom.name, payload: toolCall.custom.input };
}

function normalizeOpenAIChatTool(tool: any): NormalizedTool {
  return tool.type === "function"
    ? { kind: "function", name: tool.function.name, description: tool.function.description, inputSchema: tool.function.parameters ?? { type: "object" }, strict: tool.function.strict ?? null }
    : { kind: "custom", name: tool.custom.name, description: tool.custom.description, format: tool.custom.format };
}

function normalizeOpenAIChatToolChoice(choice: any): NormalizedToolChoice {
  if (typeof choice === "string") return choice === "required" ? { type: "required" } : { type: choice };
  if (choice.type === "function") return { type: "tool", kind: "function", name: choice.function.name };
  if (choice.type === "custom") return { type: "tool", kind: "custom", name: choice.custom.name };
  return { type: choice.allowed_tools.mode === "required" ? "required" : "auto" };
}

function normalizeOpenAIChatLegacyFunctionChoice(choice: any): NormalizedToolChoice {
  if (choice === "auto") return { type: "auto" };
  if (choice === "none") return { type: "none" };
  return { type: "tool", kind: "function", name: choice.name };
}

function normalizeOpenAIChatResponseFormat(format: any): NormalizedRequest["responseFormat"] {
  if (!format) return undefined;
  if (format.type === "text" || format.type === "json_object") return { type: format.type };
  return { type: "json_schema", name: format.json_schema.name, schema: format.json_schema.schema, description: format.json_schema.description, strict: format.json_schema.strict ?? null };
}

function normalizeOpenAIResponsesInput(input: string | any[]): NormalizedMessage[] {
  if (typeof input === "string") return [{ role: "user", parts: [text(input)] }];
  return input.flatMap((item) => {
    const itemType = item.type ?? "message";
    if (itemType === "message") return [normalizeOpenAIResponsesMessage(item)];
    if (itemType === "reasoning") {
      const thinkingFromSummary = item.summary?.map((part: any) => ({ type: "thinking" as const, thinking: part.text, signature: item.encrypted_content || undefined })) ?? [];
      const thinkingFromContent = item.content?.map((part: any) => ({ type: "thinking" as const, thinking: part.text })) ?? [];
      const redactedThinking = item.encrypted_content && !item.summary?.length && !item.content?.length ? [{ type: "redacted_thinking" as const, data: item.encrypted_content }] : [];
      return [{
        role: "assistant",
        parts: [...thinkingFromSummary, ...thinkingFromContent, ...redactedThinking],
      }];
    }
    if (itemType === "function_call") return [{ role: "assistant", parts: [], toolCalls: [{ kind: "function", id: item.call_id, name: item.name, payload: item.arguments }] }];
    if (itemType === "custom_tool_call") return [{ role: "assistant", parts: [], toolCalls: [{ kind: "custom", id: item.call_id, name: item.name, payload: item.input }] }];
    if (itemType === "function_call_output" || itemType === "custom_tool_call_output") return [{ role: "tool", toolCallId: item.call_id, parts: normalizeOpenAIResponsesToolOutput(item.output) }];
    fail(`Responses input item type "${itemType}" is not supported`);
  });
}

function normalizeOpenAIResponsesMessage(item: any): NormalizedMessage {
  if (typeof item.content === "string") return { role: item.role, parts: [text(item.content)] };
  return {
    role: item.role,
    parts: item.content.map((part: any) => {
      if (part.type === "input_text" || part.type === "output_text") return text(part.text);
      if (part.type === "refusal") return refusal(part.refusal);
      if (part.type === "input_image") {
        if (!part.image_url) fail("Responses input_image without image_url is not supported");
        return { type: "image_url", url: part.image_url, detail: part.detail === "original" ? "auto" : part.detail ?? undefined };
      }
      if (part.type === "input_audio") return { type: "input_audio", data: part.input_audio.data, format: part.input_audio.format };
      if (part.type === "input_file") {
        if (part.file_url) return { type: "document_url", url: part.file_url, title: part.filename ?? null };
        if (part.file_data) return { type: "document_base64", data: part.file_data, title: part.filename ?? null };
        fail("Responses input_file without file_url or file_data is not supported");
      }
      fail(`Unsupported Responses content part "${part.type}"`);
    }),
  };
}

function normalizeOpenAIResponsesToolOutput(output: any): NormalizedMessage["parts"] {
  if (typeof output === "string") return [text(output)];
  return output.map((part: any) => {
    if (part.type === "input_text") return text(String(part.text));
    fail(`Unsupported Responses tool output part "${part.type}"`);
  });
}

function normalizeOpenAIResponsesTool(tool: any): NormalizedTool {
  if (tool.type === "function") return { kind: "function", name: tool.name, description: tool.description, inputSchema: tool.parameters ?? { type: "object" }, strict: tool.strict ?? null };
  if (tool.type === "custom") return { kind: "custom", name: tool.name, description: tool.description, format: tool.format };
  fail(`Responses tool type "${tool.type}" is not supported`);
}

function normalizeOpenAIResponsesToolChoice(choice: any): NormalizedToolChoice {
  if (typeof choice === "string") return choice === "required" ? { type: "required" } : { type: choice };
  if (choice.type === "function") return { type: "tool", kind: "function", name: choice.name };
  if (choice.type === "custom") return { type: "tool", kind: "custom", name: choice.name };
  if (choice.type === "allowed_tools") return { type: choice.mode === "required" ? "required" : "auto" };
  fail(`Responses tool_choice "${choice.type}" is not supported`);
}

function normalizeOpenAIResponsesFormat(format: any): NormalizedRequest["responseFormat"] {
  if (!format) return undefined;
  if (format.type === "text" || format.type === "json_object") return { type: format.type };
  return { type: "json_schema", name: format.name, schema: format.schema, description: format.description, strict: format.strict ?? null };
}

function normalizeAnthropicSystem(system: any): NormalizedMessage {
  return typeof system === "string" ? { role: "system", parts: [text(system)] } : { role: "system", parts: system.map((block: any) => text(block.text)) };
}

function normalizeAnthropicMessage(message: MessageParam): NormalizedMessage[] {
  if (typeof message.content === "string") return [{ role: message.role, parts: [text(message.content)] }];
  if (message.role === "assistant") {
    const parts: NormalizedMessage["parts"] = [];
    const toolCalls: NonNullable<NormalizedMessage["toolCalls"]> = [];
    for (const block of message.content as any[]) {
      if (block.type === "text") parts.push(text(block.text));
      else if (block.type === "thinking") parts.push({ type: "thinking", thinking: block.thinking, signature: block.signature });
      else if (block.type === "redacted_thinking") parts.push({ type: "redacted_thinking", data: block.data });
      else if (block.type === "tool_use" || block.type === "server_tool_use") toolCalls.push({ kind: "function", id: block.id, name: block.name, payload: JSON.stringify(block.input) });
    }
    return [{ role: "assistant", parts, toolCalls }];
  }
  const normalized: NormalizedMessage[] = [];
  for (const block of message.content as any[]) {
    if (block.type === "text") {
      normalized.push({ role: "user", parts: [{ type: "text", text: block.text, cacheControl: block.cache_control }] });
      continue;
    }
    if (block.type === "image") {
      normalized.push({ role: "user", parts: [{ type: "image_url", url: block.source.type === "url" ? block.source.url : makeDataUrl(block.source.media_type, block.source.data), cacheControl: block.cache_control }] });
      continue;
    }
    if (block.type === "document") {
      if (block.source.type === "url") normalized.push({ role: "user", parts: [{ type: "document_url", url: block.source.url, title: block.title ?? null, cacheControl: block.cache_control }] });
      else if (block.source.type === "base64") normalized.push({ role: "user", parts: [{ type: "document_base64", data: block.source.data, mediaType: block.source.media_type, title: block.title ?? null, cacheControl: block.cache_control }] });
      else if (block.source.type === "text") normalized.push({ role: "user", parts: [{ type: "text", text: block.source.data, cacheControl: block.cache_control }] });
      else if (block.source.type === "content") {
        const textParts: NormalizedMessage["parts"] = [];
        for (const child of block.source.content) {
          if (child.type !== "text") fail(`Anthropic document content block "${child.type}" is not supported`);
          textParts.push({ type: "text", text: child.text, cacheControl: block.cache_control });
        }
        if (textParts.length > 0) normalized.push({ role: "user", parts: textParts });
      }
      continue;
    }
    if (block.type === "tool_result") {
      normalized.push({ role: "tool", toolCallId: block.tool_use_id, isError: block.is_error, parts: normalizeAnthropicToolResultParts(block.content) });
      continue;
    }
    fail(`Anthropic block "${block.type}" is not supported`);
  }
  return normalized;
}

function normalizeAnthropicToolResultParts(content: any): NormalizedMessage["parts"] {
  if (!content) return [];
  if (typeof content === "string") return [text(content)];
  return content.map((block: any) => {
    if (block.type === "text") return text(block.text);
    if (block.type === "image") return { type: "image_url", url: block.source.type === "url" ? block.source.url : makeDataUrl(block.source.media_type, block.source.data) };
    if (block.type === "document") {
      if (block.source.type === "url") return { type: "document_url", url: block.source.url, title: block.title ?? null };
      if (block.source.type === "base64") return { type: "document_base64", data: block.source.data, mediaType: block.source.media_type, title: block.title ?? null };
      if (block.source.type === "text") return text(block.source.data);
    }
    fail(`Anthropic tool_result block "${block.type}" is not supported`);
  });
}

function normalizeAnthropicTool(tool: ToolUnion): NormalizedTool {
  if (!("input_schema" in tool)) fail(`Anthropic server tool "${tool.type}" is not supported`);
  return {
    kind: tool.type === "custom" ? "custom" : "function",
    name: tool.name,
    description: "description" in tool ? tool.description : undefined,
    inputSchema: tool.input_schema ?? { type: "object" },
    strict: "strict" in tool ? tool.strict ?? null : null,
  } as NormalizedTool;
}

function normalizeAnthropicToolChoice(choice: ToolChoice): NormalizedToolChoice {
  switch (choice.type) {
    case "auto":
      return { type: "auto", disableParallel: choice.disable_parallel_tool_use };
    case "any":
      return { type: "required", disableParallel: choice.disable_parallel_tool_use };
    case "none":
      return { type: "none" };
    case "tool":
      return { type: "tool", kind: "function", name: choice.name, disableParallel: choice.disable_parallel_tool_use };
  }
}

function denormalizeOpenAIChatMessage(message: NormalizedMessage): OpenAIChatRequest["messages"] {
  switch (message.role) {
    case "system":
    case "developer":
      return [{ role: message.role, content: collapseText(requireTextOnly(message.parts, `Chat ${message.role} message`)) }];
    case "user":
      return [{ role: "user", content: denormalizeOpenAIChatUserParts(message.parts) }];
    case "assistant":
      return [{ role: "assistant", content: denormalizeOpenAIChatAssistantParts(message.parts), refusal: message.parts.find((part) => part.type === "refusal")?.text ?? null, tool_calls: message.toolCalls?.map((toolCall) => denormalizeOpenAIChatToolCall(toolCall)) as any }];
    case "tool":
      return [{ role: "tool", tool_call_id: message.toolCallId ?? "", content: collapseText(requireTextOnly(message.parts, "Chat tool result")) }];
    case "function":
      return [{ role: "function", name: message.name ?? "function", content: collapseText(requireTextOnly(message.parts, "Chat function result")) }];
  }
}

function denormalizeOpenAIChatUserParts(parts: NormalizedMessage["parts"]): any {
  if (parts.every((part) => part.type === "text")) return collapseText(parts);
  return parts.map((part) => {
    if (part.type === "text") return { type: "text", text: part.text };
    if (part.type === "image_url") return { type: "image_url", image_url: { url: part.url, detail: part.detail } };
    if (part.type === "input_audio") return { type: "input_audio", input_audio: { data: part.data, format: part.format } };
    fail(`OpenAI Chat does not support user part "${part.type}"`);
  });
}

function denormalizeOpenAIChatAssistantParts(parts: NormalizedMessage["parts"]): any {
  if (parts.length === 0) return null;
  const chatParts = parts.filter(part => part.type === "text" || part.type === "refusal");
  if (chatParts.length === 0) return null;
  return chatParts.map((part) => (part.type === "text" ? { type: "text", text: part.text } : { type: "refusal", refusal: part.text }));
}

function denormalizeOpenAIChatToolCall(toolCall: NonNullable<NormalizedMessage["toolCalls"]>[number]): any {
  return toolCall.kind === "function" ? { id: toolCall.id, type: "function", function: { name: toolCall.name, arguments: toolCall.payload } } : { id: toolCall.id, type: "custom", custom: { name: toolCall.name, input: toolCall.payload } };
}

function denormalizeOpenAIResponsesMessage(message: NormalizedMessage): any[] {
  switch (message.role) {
    case "system":
    case "developer":
    case "user":
    case "assistant":
      return [
        ...(
          message.role === "assistant"
            ? message.parts
                .filter((part) => part.type === "thinking" || part.type === "redacted_thinking")
                .map((part, index) =>
                  part.type === "thinking"
                    ? {
                        id: `reasoning_${index}`,
                        type: "reasoning",
                        summary: [{ type: "summary_text", text: part.thinking }],
                        content: [],
                        encrypted_content: part.signature || null,
                        status: "completed",
                      }
                    : {
                        id: `reasoning_${index}`,
                        type: "reasoning",
                        summary: [],
                        content: [],
                        encrypted_content: part.data,
                        status: "completed",
                      },
                )
            : []
        ),
        {
          type: "message",
          role: message.role,
          content: message.parts
            .filter((part) => part.type !== "thinking" && part.type !== "redacted_thinking")
            .map((part) => {
              if (part.type === "text") return message.role === "assistant" ? { type: "output_text", text: part.text, annotations: [] } : { type: "input_text", text: part.text };
              if (part.type === "refusal") return { type: "refusal", refusal: part.text };
              if (part.type === "image_url") return { type: "input_image", image_url: part.url, detail: part.detail };
              if (part.type === "input_audio") return { type: "input_audio", input_audio: { data: part.data, format: part.format } };
              if (part.type === "document_url") return { type: "input_file", file_url: part.url, filename: part.title ?? undefined };
              return { type: "input_file", file_data: part.data, filename: part.title ?? undefined };
            }),
        },
        ...(message.toolCalls?.map((toolCall) => toolCall.kind === "function" ? { type: "function_call", call_id: toolCall.id, name: toolCall.name, arguments: toolCall.payload } : { type: "custom_tool_call", call_id: toolCall.id, name: toolCall.name, input: toolCall.payload }) ?? []),
      ];
    case "tool":
      return [{ type: "function_call_output", call_id: message.toolCallId ?? "", output: collapseText(requireTextOnly(message.parts, "Responses tool result")) }];
    case "function":
      return [{ type: "function_call_output", call_id: message.name ?? "function", output: collapseText(requireTextOnly(message.parts, "Responses function result")) }];
  }
}

function denormalizeAnthropicMessage(message: NormalizedMessage): MessageParam[] {
  switch (message.role) {
    case "user":
      return [{ role: "user", content: denormalizeAnthropicUserParts(message.parts) }];
    case "assistant":
      return [{ role: "assistant", content: denormalizeAnthropicAssistantParts(message) }];
    case "tool":
      return [{ role: "user", content: [{ type: "tool_result", tool_use_id: message.toolCallId ?? "", is_error: message.isError ?? false, content: denormalizeAnthropicToolResultParts(message.parts) }] as any }];
    case "function":
      return [{ role: "user", content: [{ type: "tool_result", tool_use_id: message.name ?? "function", is_error: message.isError ?? false, content: collapseText(requireTextOnly(message.parts, "Anthropic function result")) }] as any }];
    default:
      fail(`Anthropic Messages does not support role "${message.role}" in message array`);
  }
}

function denormalizeAnthropicUserParts(parts: NormalizedMessage["parts"]): any {
  if (parts.length === 1 && parts[0].type === "text") return parts[0].text;
  return parts.map((part) => {
    if (part.type === "text") return { type: "text", text: part.text, cache_control: part.cacheControl };
    if (part.type === "image_url") {
      const dataUrl = parseDataUrl(part.url);
      return dataUrl ? { type: "image", source: { type: "base64", media_type: dataUrl.mediaType, data: dataUrl.data }, cache_control: part.cacheControl } : { type: "image", source: { type: "url", url: part.url }, cache_control: part.cacheControl };
    }
    if (part.type === "document_url") return { type: "document", title: part.title ?? undefined, source: { type: "url", url: part.url }, cache_control: part.cacheControl };
    if (part.type === "document_base64") return { type: "document", title: part.title ?? undefined, source: { type: "base64", media_type: part.mediaType ?? "application/pdf", data: part.data }, cache_control: part.cacheControl };
    fail(`Anthropic does not support user part "${part.type}"`);
  });
}

function denormalizeAnthropicAssistantParts(message: NormalizedMessage): any[] {
  const blocks: any[] = message.parts.map((part) => {
    if (part.type === "text" || part.type === "refusal") return { type: "text", text: part.text, citations: null };
    if (part.type === "thinking") return { type: "thinking", thinking: part.thinking, signature: part.signature ?? "" };
    if (part.type === "redacted_thinking") return { type: "redacted_thinking", data: part.data };
    return { type: "text", text: collapseText([part]), citations: null };
  });
  for (const toolCall of message.toolCalls ?? []) {
    if (toolCall.kind !== "function") fail("Anthropic assistant output only supports function-style tool calls");
    blocks.push({ type: "tool_use", id: toolCall.id, caller: { type: "direct" }, name: toolCall.name, input: parseJson(toolCall.payload, `Anthropic tool call "${toolCall.name}"`) });
  }
  return blocks;
}

function denormalizeAnthropicToolResultParts(parts: NormalizedMessage["parts"]): any {
  if (parts.every((part) => part.type === "text")) return collapseText(parts);
  return parts.map((part) => {
    if (part.type === "text") return { type: "text", text: part.text };
    if (part.type === "image_url") {
      const dataUrl = parseDataUrl(part.url);
      return dataUrl ? { type: "image", source: { type: "base64", media_type: dataUrl.mediaType, data: dataUrl.data } } : { type: "image", source: { type: "url", url: part.url } };
    }
    if (part.type === "document_url") return { type: "document", title: part.title ?? undefined, source: { type: "url", url: part.url } };
    if (part.type === "document_base64") return { type: "document", title: part.title ?? undefined, source: { type: "base64", media_type: part.mediaType ?? "application/pdf", data: part.data } };
    fail(`Anthropic tool_result does not support part "${part.type}"`);
  });
}

function denormalizeAnthropicTool(tool: NormalizedTool): ToolUnion {
  if (tool.kind !== "function") fail("Anthropic request conversion only supports function-style tools");
  return { name: tool.name, description: tool.description ?? undefined, input_schema: tool.inputSchema as any, strict: tool.strict ?? undefined };
}

function denormalizeAnthropicToolChoice(choice: NormalizedToolChoice | undefined): MessageCreateParamsBase["tool_choice"] {
  if (!choice) return undefined;
  if (choice.type === "auto") return { type: "auto", disable_parallel_tool_use: choice.disableParallel };
  if (choice.type === "required") return { type: "any", disable_parallel_tool_use: choice.disableParallel };
  if (choice.type === "none") return { type: "none" };
  if (choice.kind !== "function") fail("Anthropic tool_choice only supports function-style tools");
  return { type: "tool", name: choice.name, disable_parallel_tool_use: choice.disableParallel };
}

function mergeAnthropicMessages(messages: MessageParam[]): MessageParam[] {
  const merged: MessageParam[] = [];
  for (const message of messages) {
    const last = merged.at(-1);
    if (last && last.role === message.role) {
      const previous = typeof last.content === "string" ? [{ type: "text", text: last.content }] : last.content;
      const next = typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content;
      last.content = [...previous, ...next] as any;
    } else {
      merged.push(message);
    }
  }
  return merged;
}

function denormalizeAnthropicMetadata(metadata: NormalizedRequest["metadata"]) {
  if (!metadata) return undefined;
  const keys = Object.keys(metadata).filter((key) => metadata[key] !== undefined && metadata[key] !== null);
  if (keys.length === 0) return undefined;
  if (keys.length === 1 && keys[0] === "user_id" && typeof metadata.user_id === "string") return { user_id: metadata.user_id };
  fail("Anthropic metadata only supports user_id");
}

function denormalizeAnthropicThinking(reasoningEffort: string | null | undefined, maxOutputTokens: number | undefined) {
  if (!reasoningEffort) return undefined;
  const match = reasoningEffort.match(/^budget:(\d+)$/);
  if (match) {
    const budgetTokens = Number(match[1]);
    if (maxOutputTokens !== undefined && budgetTokens >= maxOutputTokens) fail("Anthropic thinking budget must be less than max_tokens");
    return { type: "enabled" as const, budget_tokens: budgetTokens };
  }
  const effortMap: Record<string, number> = { low: 1000, medium: 5000, high: 10000 };
  const budgetTokens = effortMap[reasoningEffort] ?? 5000;
  if (maxOutputTokens !== undefined && budgetTokens >= maxOutputTokens) return undefined;
  return { type: "enabled" as const, budget_tokens: budgetTokens };
}

function normalizeOpenAIServiceTier(tier: string | null | undefined): OpenAIChatRequest["service_tier"] | undefined {
  if (!tier) return undefined;
  if (["auto", "default", "flex", "scale", "priority"].includes(tier)) return tier as OpenAIChatRequest["service_tier"];
  fail(`OpenAI Chat does not support service tier "${tier}"`);
}

function normalizeOpenAIResponsesServiceTier(tier: string | null | undefined): OpenAIResponsesRequest["service_tier"] | undefined {
  if (!tier) return undefined;
  if (["auto", "default", "flex", "scale", "priority"].includes(tier)) return tier as OpenAIResponsesRequest["service_tier"];
  fail(`OpenAI Responses does not support service tier "${tier}"`);
}

function normalizeAnthropicServiceTier(tier: string | null | undefined): MessageCreateParamsBase["service_tier"] | undefined {
  if (!tier) return undefined;
  if (tier === "auto") return "auto";
  if (tier === "default" || tier === "standard_only") return "standard_only";
  fail(`Anthropic does not support service tier "${tier}"`);
}

function denormalizeOpenAIChatResponseFormat(format: NormalizedRequest["responseFormat"]): OpenAIChatRequest["response_format"] {
  if (!format) return undefined;
  if (format.type === "text" || format.type === "json_object") return { type: format.type };
  return { type: "json_schema", json_schema: { name: format.name, description: format.description, schema: format.schema, strict: format.strict ?? undefined } };
}

function denormalizeOpenAIResponsesFormat(format: NonNullable<NormalizedRequest["responseFormat"]>) {
  if (format.type === "text" || format.type === "json_object") return { type: format.type };
  return { type: "json_schema" as const, name: format.name, description: format.description, schema: format.schema, strict: format.strict ?? undefined };
}

function denormalizeOpenAIChatToolChoice(choice: NormalizedToolChoice | undefined): OpenAIChatRequest["tool_choice"] {
  if (!choice) return undefined;
  if (choice.type === "auto" || choice.type === "none" || choice.type === "required") return choice.type;
  return choice.kind === "function" ? { type: "function", function: { name: choice.name } } : { type: "custom", custom: { name: choice.name } };
}

function denormalizeOpenAIResponsesToolChoice(choice: NormalizedToolChoice | undefined): OpenAIResponsesRequest["tool_choice"] {
  if (!choice) return undefined;
  if (choice.type === "auto" || choice.type === "none" || choice.type === "required") return choice.type;
  return choice.kind === "function" ? { type: "function", name: choice.name } : { type: "custom", name: choice.name };
}
