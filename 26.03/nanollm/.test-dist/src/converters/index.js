import { denormalizeToAnthropicRequest, denormalizeToOpenAIChatRequest, denormalizeToOpenAIResponsesRequest, normalizeAnthropicRequest, normalizeOpenAIChatRequest, normalizeOpenAIResponsesRequest, } from "./requests.js";
import { denormalizeToAnthropicResponse, denormalizeToOpenAIChatResponse, denormalizeToOpenAIResponsesResponse, normalizeAnthropicResponse, normalizeOpenAIChatResponse, normalizeOpenAIResponsesResponse, } from "./responses.js";
export function chatParamsToResponsesRequest(request) {
    return denormalizeToOpenAIResponsesRequest(normalizeOpenAIChatRequest(request));
}
export function responsesRequestToChatParams(request) {
    return denormalizeToOpenAIChatRequest(normalizeOpenAIResponsesRequest(request));
}
export function chatParamsToAnthropicMessageRequest(request) {
    return denormalizeToAnthropicRequest(normalizeOpenAIChatRequest(request));
}
export function anthropicMessageRequestToChatParams(request) {
    return denormalizeToOpenAIChatRequest(normalizeAnthropicRequest(request));
}
export function responsesRequestToAnthropicMessageRequest(request) {
    return denormalizeToAnthropicRequest(normalizeOpenAIResponsesRequest(request));
}
export function anthropicMessageRequestToResponsesRequest(request) {
    return denormalizeToOpenAIResponsesRequest(normalizeAnthropicRequest(request));
}
export function chatCompletionToResponsesResponse(response) {
    return denormalizeToOpenAIResponsesResponse(normalizeOpenAIChatResponse(response));
}
export function responsesResponseToChatCompletion(response) {
    return denormalizeToOpenAIChatResponse(normalizeOpenAIResponsesResponse(response));
}
export function chatCompletionToAnthropicMessage(response) {
    return denormalizeToAnthropicResponse(normalizeOpenAIChatResponse(response));
}
export function anthropicMessageToChatCompletion(response) {
    return denormalizeToOpenAIChatResponse(normalizeAnthropicResponse(response));
}
export function responsesResponseToAnthropicMessage(response) {
    return denormalizeToAnthropicResponse(normalizeOpenAIResponsesResponse(response));
}
export function anthropicMessageToResponsesResponse(response) {
    return denormalizeToOpenAIResponsesResponse(normalizeAnthropicResponse(response));
}
