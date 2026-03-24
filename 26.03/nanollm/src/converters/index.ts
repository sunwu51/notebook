import type {
  AnthropicMessagesRequest,
  AnthropicMessagesResponse,
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIResponsesRequest,
  OpenAIResponsesResponse,
} from "./shared.js";
import {
  denormalizeToAnthropicRequest,
  denormalizeToOpenAIChatRequest,
  denormalizeToOpenAIResponsesRequest,
  normalizeAnthropicRequest,
  normalizeOpenAIChatRequest,
  normalizeOpenAIResponsesRequest,
} from "./requests.js";
import {
  denormalizeToAnthropicResponse,
  denormalizeToOpenAIChatResponse,
  denormalizeToOpenAIResponsesResponse,
  normalizeAnthropicResponse,
  normalizeOpenAIChatResponse,
  normalizeOpenAIResponsesResponse,
} from "./responses.js";

export function chatParamsToResponsesRequest(request: OpenAIChatRequest): OpenAIResponsesRequest {
  return denormalizeToOpenAIResponsesRequest(normalizeOpenAIChatRequest(request));
}

export function responsesRequestToChatParams(request: OpenAIResponsesRequest): OpenAIChatRequest {
  return denormalizeToOpenAIChatRequest(normalizeOpenAIResponsesRequest(request));
}

export function chatParamsToAnthropicMessageRequest(request: OpenAIChatRequest): AnthropicMessagesRequest {
  return denormalizeToAnthropicRequest(normalizeOpenAIChatRequest(request));
}

export function anthropicMessageRequestToChatParams(request: AnthropicMessagesRequest): OpenAIChatRequest {
  return denormalizeToOpenAIChatRequest(normalizeAnthropicRequest(request));
}

export function responsesRequestToAnthropicMessageRequest(request: OpenAIResponsesRequest): AnthropicMessagesRequest {
  return denormalizeToAnthropicRequest(normalizeOpenAIResponsesRequest(request));
}

export function anthropicMessageRequestToResponsesRequest(request: AnthropicMessagesRequest): OpenAIResponsesRequest {
  return denormalizeToOpenAIResponsesRequest(normalizeAnthropicRequest(request));
}

export function chatCompletionToResponsesResponse(response: OpenAIChatResponse): OpenAIResponsesResponse {
  return denormalizeToOpenAIResponsesResponse(normalizeOpenAIChatResponse(response));
}

export function responsesResponseToChatCompletion(response: OpenAIResponsesResponse): OpenAIChatResponse {
  return denormalizeToOpenAIChatResponse(normalizeOpenAIResponsesResponse(response));
}

export function chatCompletionToAnthropicMessage(response: OpenAIChatResponse): AnthropicMessagesResponse {
  return denormalizeToAnthropicResponse(normalizeOpenAIChatResponse(response));
}

export function anthropicMessageToChatCompletion(response: AnthropicMessagesResponse): OpenAIChatResponse {
  return denormalizeToOpenAIChatResponse(normalizeAnthropicResponse(response));
}

export function responsesResponseToAnthropicMessage(response: OpenAIResponsesResponse): AnthropicMessagesResponse {
  return denormalizeToAnthropicResponse(normalizeOpenAIResponsesResponse(response));
}

export function anthropicMessageToResponsesResponse(response: AnthropicMessagesResponse): OpenAIResponsesResponse {
  return denormalizeToOpenAIResponsesResponse(normalizeAnthropicResponse(response));
}
