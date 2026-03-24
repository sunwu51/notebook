# nanollm

Node.js / TypeScript project with:
- `express` server entry
- OpenAI Chat / Responses request-response converters
- Anthropic Messages request-response converters

## Install

```bash
npm install --cache .npm-cache
```

## Configure

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=3000
OPENAI_BASE_URL=https://your-api-base-url/v1
OPENAI_API_KEY=your-secret-key
OPENAI_MODEL=gpt-4o-mini
```

## Run

```bash
npm start
```

## Verify

```bash
npm run typecheck
npm test
```

## Server API

`POST /chat`

```json
{
  "baseURL": "https://your-api-base-url/v1",
  "apiKey": "your-secret-key",
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "你好" }
  ]
}
```

## Converter Entry

Re-export file:
- [converter.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/converter.ts)

Implementation files:
- [index.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/src/converters/index.ts)
- [requests.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/src/converters/requests.ts)
- [responses.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/src/converters/responses.ts)
- [shared.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/src/converters/shared.ts)

Supported request conversions:
- OpenAI Chat `ChatCompletionCreateParamsBase` <-> OpenAI Responses `ResponseCreateParamsBase`
- OpenAI Chat `ChatCompletionCreateParamsBase` <-> Anthropic Messages `MessageCreateParamsBase`
- OpenAI Responses `ResponseCreateParamsBase` <-> Anthropic Messages `MessageCreateParamsBase`

Supported response conversions:
- OpenAI Chat `ChatCompletion` <-> OpenAI Responses `Response`
- OpenAI Chat `ChatCompletion` <-> Anthropic `Message`
- OpenAI Responses `Response` <-> Anthropic `Message`

## Mapping Rules

### Request: Common fields

Same-name or near-same-name mappings:

| Normalized meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| model | `model` | `model` | `model` |
| max output tokens | `max_completion_tokens` or `max_tokens` | `max_output_tokens` | `max_tokens` |
| stream | `stream` | `stream` | `stream` |
| temperature | `temperature` | `temperature` | `temperature` |
| top-p | `top_p` | `top_p` | `top_p` |
| stop sequences | `stop` | unsupported in current request converter | `stop_sequences` |
| service tier | `service_tier` | `service_tier` | `service_tier` |

Different schema but same intent:

| Meaning | Source | Target |
| --- | --- | --- |
| system instructions | Chat `role: "system"` / `role: "developer"` messages | Responses `instructions` if they are leading instruction messages |
| system instructions | Anthropic top-level `system` | Chat `system` message |
| system instructions | Anthropic top-level `system` | Responses leading `developer` message via normalized model |
| structured output | Chat `response_format` | Responses `text.format` |
| structured output | Anthropic `output_config.format` | normalized `json_schema` form |

### Request: Message role mapping

| Semantic role | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| system | `role: "system"` | leading `instructions` or `message.role: "system"` | top-level `system` |
| developer | `role: "developer"` | `instructions` or `message.role: "developer"` | folded into top-level `system` |
| user | `role: "user"` | `message.role: "user"` | `message.role: "user"` |
| assistant | `role: "assistant"` | `message.role: "assistant"` or output `message` | `message.role: "assistant"` |
| tool result | `role: "tool"` | `function_call_output` or `custom_tool_call_output` | `role: "user"` with `content[].type = "tool_result"` |

### Request: Content mapping

String versus object cases are handled separately:

| Meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| plain text | `content: "..."` or text part array | `input_text` / `output_text` or string input | string or `text` block |
| refusal | assistant refusal part | `refusal` part | converted to plain text block on Anthropic side |
| image | `image_url` part | `input_image` | `image` block |
| audio input | `input_audio` part | `input_audio` | unsupported |
| file/document URL | unsupported in current chat request mapping | `input_file.file_url` | `document` with URL source |
| file/document base64 | unsupported in current chat request mapping | `input_file.file_data` | `document` with base64 source |

Rules:
- If a source API allows `content` as `string`, the converter preserves that semantic and only expands into object blocks when the target schema requires blocks.
- If the source API uses object blocks, text-only blocks may be collapsed back to `string` when the target schema allows `string`.
- Mixed rich content is preserved only where the target API has an equivalent schema.

## Tool Mapping

### Tool definitions

Function-like tools:

| Meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| name | `tool.function.name` | `tool.name` | `tool.name` |
| description | `tool.function.description` | `tool.description` | `tool.description` |
| input schema | `tool.function.parameters` | `tool.parameters` | `tool.input_schema` |
| strict | `tool.function.strict` | `tool.strict` | `tool.strict` |

Custom tools:
- OpenAI Chat custom tools map to normalized `custom`
- OpenAI Responses custom tools map to normalized `custom`
- Anthropic custom/server tool forms are not treated as lossless equivalents here

### Tool choice

| Meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| auto | `auto` | `auto` | `{ type: "auto" }` |
| none | `none` | `none` | `{ type: "none" }` |
| required / any tool | `required` | `required` | `{ type: "any" }` |
| specific function tool | `{ type: "function", function: { name } }` | `{ type: "function", name }` | `{ type: "tool", name }` |

## Tool Call And Tool Result Flow

Diagram:
- [tool-result-flow.svg](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/docs/tool-result-flow.svg)

Important distinction:
- OpenAI Chat uses a dedicated `tool` message role for tool results.
- OpenAI Responses uses dedicated `*_call_output` items instead of a message role.
- Anthropic sends tool results back inside the next `user` message as `tool_result` blocks.

Request-side mapping for tool invocation:

| Semantic event | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| model wants function call | `assistant.tool_calls[]` | `function_call` item | `assistant.content[].tool_use` |
| caller sends tool result | next `role: "tool"` message | next `function_call_output` item | next `role: "user"` message containing `tool_result` block |

Current converter behavior:
- Chat `assistant.tool_calls[]` -> Anthropic assistant `tool_use`
- Chat next `tool` message -> Anthropic next user `tool_result`
- Anthropic `tool_result` -> Chat `role: "tool"`
- Responses `function_call_output` -> Anthropic `tool_result`
- Anthropic `tool_result` -> Responses `function_call_output`

## Response Mapping

### Assistant text output

| Meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| assistant text | `choices[0].message.content` | `output[].message.content[].output_text` | `content[].text` |

### Assistant tool call output

| Meaning | OpenAI Chat | OpenAI Responses | Anthropic Messages |
| --- | --- | --- | --- |
| assistant tool invocation in response | `choices[0].message.tool_calls[]` | `output[].function_call` / `output[].custom_tool_call` | `content[].tool_use` |

Response-side conversion keeps:
- tool call id
- tool name
- tool JSON payload text
- finish reason shape when there is a tool call

## Current Limits

Explicitly unsupported or not-lossless areas:
- Anthropic audio input/output has no equivalent here
- OpenAI Chat `audio`, `prediction`, `logit_bias`, `presence_penalty`, `frequency_penalty`, `web_search_options`
- OpenAI Responses built-in tools such as MCP / file search / computer use
- Anthropic server tools are not treated as OpenAI-equivalent tools
- Anthropic metadata only supports `user_id`
- Anthropic reasoning conversion currently only supports `budget:<n>` normalized form

## Tests

Test runner:
- [run.ts](C:/Users/sunwu/Desktop/base/gateway/notebook/26.03/nanollm/tests/run.ts)

Covered scenarios:
- chat request tool call + next tool result -> anthropic request
- anthropic `tool_result` -> chat tool message
- responses `function_call_output` -> anthropic `tool_result`
- string content request round-trip
- object/block image content conversion
- chat response tool call -> anthropic response tool use
- responses response tool call -> chat response tool_calls
- anthropic response tool use -> chat response tool_calls
- anthropic `tool_result` block array -> chat tool text join
- tool call id round-trip checks
