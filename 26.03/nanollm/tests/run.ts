import assert from "node:assert/strict";

import {
  anthropicMessageRequestToChatParams,
  anthropicMessageRequestToResponsesRequest,
  anthropicMessageToChatCompletion,
  chatCompletionToAnthropicMessage,
  chatParamsToAnthropicMessageRequest,
  chatParamsToResponsesRequest,
  responsesRequestToAnthropicMessageRequest,
  responsesRequestToChatParams,
  responsesResponseToChatCompletion,
} from "../src/converters/index.js";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("chat tool result becomes anthropic tool_result block", () => {
  const result = chatParamsToAnthropicMessageRequest({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "weather?" },
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: { name: "get_weather", arguments: "{\"city\":\"Shanghai\"}" },
          },
        ],
      },
      { role: "tool", tool_call_id: "call_1", content: "Sunny" },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get weather",
          parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
        },
      },
    ],
  });

  assert.equal(result.messages[1].role, "assistant");
  assert.equal(result.messages[2].role, "user");
  assert.equal((result.messages[2].content as Array<{ type: string }>)[0].type, "tool_result");
});

run("anthropic tool_result becomes chat tool message", () => {
  const result = anthropicMessageRequestToChatParams({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      { role: "user", content: "weather?" },
      {
        role: "assistant",
        content: [{ type: "tool_use", id: "call_1", caller: { type: "direct" }, name: "get_weather", input: { city: "Shanghai" } }],
      },
      { role: "user", content: [{ type: "tool_result", tool_use_id: "call_1", content: "Sunny" }] },
    ],
  });

  assert.equal(result.messages[2].role, "tool");
  assert.equal((result.messages[2] as { tool_call_id: string }).tool_call_id, "call_1");
});

run("responses tool output becomes anthropic tool_result block", () => {
  const result = responsesRequestToAnthropicMessageRequest({
    model: "gpt-4o-mini",
    input: [{ type: "function_call_output", call_id: "call_1", output: "Sunny" }],
  });

  assert.equal(result.messages[0].role, "user");
  assert.equal((result.messages[0].content as Array<{ type: string }>)[0].type, "tool_result");
});

run("string content survives chat to responses to chat", () => {
  const responses = chatParamsToResponsesRequest({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "hello" }],
  });

  const chat = responsesRequestToChatParams(responses);
  assert.equal(chat.messages[0].role, "user");
  assert.equal(chat.messages[0].content, "hello");
});

run("object content survives anthropic to responses conversion for images", () => {
  const responses = anthropicMessageRequestToResponsesRequest({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [{ type: "image", source: { type: "url", url: "https://example.com/a.png" } }],
      },
    ],
  });

  const first = (responses.input as Array<{ content: Array<{ type: string; image_url?: string }> }>)[0];
  assert.equal(first.content[0].type, "input_image");
  assert.equal(first.content[0].image_url, "https://example.com/a.png");
});

run("chat completion response with tool_calls becomes anthropic tool_use response", () => {
  const result = chatCompletionToAnthropicMessage({
    id: "chat_1",
    object: "chat.completion",
    created: 1,
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        finish_reason: "tool_calls",
        logprobs: null,
        message: {
          role: "assistant",
          content: null,
          refusal: null,
          tool_calls: [{ id: "call_1", type: "function", function: { name: "get_weather", arguments: "{\"city\":\"Shanghai\"}" } }],
        },
      },
    ],
  } as any);

  assert.equal(result.content[0].type, "tool_use");
});

run("responses response with tool call becomes chat completion tool_calls", () => {
  const result = responsesResponseToChatCompletion({
    id: "resp_1",
    object: "response",
    created_at: 1,
    model: "gpt-4o-mini",
    output_text: "",
    error: null,
    incomplete_details: null,
    instructions: null,
    metadata: null,
    output: [{ id: "call_1", type: "function_call", call_id: "call_1", name: "get_weather", arguments: "{\"city\":\"Shanghai\"}", status: "completed" }],
    parallel_tool_calls: false,
    temperature: null,
    tool_choice: "auto",
    tools: [],
    top_p: null,
    status: "completed",
    text: { format: { type: "text" } },
  } as any);

  assert.equal(result.choices[0].message.tool_calls?.[0].type, "function");
});

run("anthropic response with tool_use becomes chat completion tool_calls", () => {
  const result = anthropicMessageToChatCompletion({
    id: "msg_1",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-5",
    container: null,
    stop_reason: "tool_use",
    stop_sequence: null,
    content: [{ type: "tool_use", id: "call_1", caller: { type: "direct" }, name: "get_weather", input: { city: "Shanghai" } }],
    usage: {
      input_tokens: 1,
      output_tokens: 1,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      cache_creation: null,
      inference_geo: null,
      service_tier: null,
      server_tool_use: null,
    },
  } as any);

  assert.equal(result.choices[0].message.tool_calls?.[0].type, "function");
});

run("anthropic tool_result block array becomes chat tool text", () => {
  const result = anthropicMessageRequestToChatParams({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "call_1",
            content: [{ type: "text", text: "Sunny" }, { type: "text", text: "25C" }],
          },
        ],
      },
    ],
  });

  assert.equal(result.messages[0].role, "tool");
  assert.equal((result.messages[0] as { content: string }).content, "Sunny\n25C");
});

run("chat tool result round-trip through anthropic preserves tool id", () => {
  const anthropic = chatParamsToAnthropicMessageRequest({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_roundtrip",
            type: "function",
            function: { name: "lookup", arguments: "{\"q\":\"weather\"}" },
          },
        ],
      },
      {
        role: "tool",
        tool_call_id: "call_roundtrip",
        content: "result text",
      },
    ],
  });

  const chat = anthropicMessageRequestToChatParams(anthropic);
  assert.equal((chat.messages[0] as { tool_calls: Array<{ id: string }> }).tool_calls[0].id, "call_roundtrip");
  assert.equal((chat.messages[1] as { tool_call_id: string }).tool_call_id, "call_roundtrip");
});

run("responses function call output round-trip through anthropic preserves call id", () => {
  const anthropic = responsesRequestToAnthropicMessageRequest({
    model: "gpt-4o-mini",
    input: [{ type: "function_call_output", call_id: "resp_call", output: "ok" }],
  });

  const responses = anthropicMessageRequestToResponsesRequest(anthropic);
  assert.equal((responses.input as Array<{ call_id: string }>)[0].call_id, "resp_call");
});

run("chat response round-trip through anthropic preserves tool call name", () => {
  const anthropic = chatCompletionToAnthropicMessage({
    id: "chat_rt",
    object: "chat.completion",
    created: 2,
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        finish_reason: "tool_calls",
        logprobs: null,
        message: {
          role: "assistant",
          content: [{ type: "text", text: "calling tool" }],
          refusal: null,
          tool_calls: [
            {
              id: "call_resp_rt",
              type: "function",
              function: { name: "lookup", arguments: "{\"q\":\"weather\"}" },
            },
          ],
        },
      },
    ],
  } as any);

  const chat = anthropicMessageToChatCompletion(anthropic);
  assert.equal((chat.choices[0].message.tool_calls?.[0] as any).function.name, "lookup");
});
