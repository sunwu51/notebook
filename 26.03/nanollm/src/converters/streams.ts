// @ts-nocheck
import type { ChatCompletionChunk } from "openai/resources/chat/completions/completions";
import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import type { RawMessageStreamEvent } from "@anthropic-ai/sdk/resources/messages/messages";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StreamFormat = "openai-chat" | "openai-responses" | "anthropic";

export type NormalizedStreamEvent =
  | { type: "start"; id: string; model: string; createdAt: number }
  | { type: "content_start"; index: number; contentType: "text" | "refusal" | "thinking" | "redacted_thinking" }
  | { type: "content_delta"; index: number; delta: string }
  | { type: "signature_delta"; index: number; delta: string }
  | { type: "content_done"; index: number }
  | { type: "tool_start"; index: number; id: string; name: string; kind: "function" | "custom" }
  | { type: "tool_delta"; index: number; delta: string }
  | { type: "tool_done"; index: number }
  | { type: "end"; finishReason: string | null; usage?: Record<string, unknown> };

type ParsedSSE = { event?: string; data: string };

// ─── SSE Utilities ───────────────────────────────────────────────────────────

export class SSEParser {
  private buffer = "";

  push(chunk: string): ParsedSSE[] {
    this.buffer += chunk;
    const results: ParsedSSE[] = [];
    const parts = this.buffer.split("\n\n");
    this.buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split("\n");
      let event: string | undefined;
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      const data = dataLines.join("\n");
      if (!data || data === "[DONE]") continue;
      if (event === "ping") continue;

      results.push({ event, data });
    }
    return results;
  }

  flush(): ParsedSSE[] {
    if (!this.buffer.trim()) return [];
    const result = this.push(this.buffer + "\n\n");
    this.buffer = "";
    return result;
  }
}

export function formatSSE(data: unknown, event?: string): string {
  const lines: string[] = [];
  if (event) lines.push(`event: ${event}`);
  lines.push(`data: ${JSON.stringify(data)}`);
  lines.push("", "");
  return lines.join("\n");
}

export function formatDone(): string {
  return "data: [DONE]\n\n";
}

// ─── Parser Interface ────────────────────────────────────────────────────────

interface StreamParser {
  parse(event: unknown): NormalizedStreamEvent[];
}

interface StreamEmitter {
  emit(event: NormalizedStreamEvent): unknown[];
  finish(): unknown[];
}

// ─── OpenAI Chat Parser ─────────────────────────────────────────────────────

export class OpenAIChatStreamParser implements StreamParser {
  private started = false;
  private textBlockIndex: number | null = null;
  private refusalBlockIndex: number | null = null;
  private toolCallMap = new Map<number, number>();
  private openContentBlocks = new Set<number>();
  private nextIndex = 0;

  parse(chunk: ChatCompletionChunk): NormalizedStreamEvent[] {
    const out: NormalizedStreamEvent[] = [];

    if (!this.started) {
      out.push({ type: "start", id: chunk.id, model: chunk.model, createdAt: chunk.created });
      this.started = true;
    }

    const choice = chunk.choices?.[0];
    if (!choice) {
      if (chunk.usage) {
        out.push({ type: "end", finishReason: "stop", usage: chunk.usage as Record<string, unknown> });
      }
      return out;
    }

    const { delta, finish_reason } = choice;

    if (delta?.content != null && delta.content !== "") {
      if (this.textBlockIndex == null) {
        this.textBlockIndex = this.nextIndex++;
        this.openContentBlocks.add(this.textBlockIndex);
        out.push({ type: "content_start", index: this.textBlockIndex, contentType: "text" });
      }
      out.push({ type: "content_delta", index: this.textBlockIndex, delta: delta.content });
    }

    if (delta?.refusal != null && delta.refusal !== "") {
      if (this.refusalBlockIndex == null) {
        this.refusalBlockIndex = this.nextIndex++;
        this.openContentBlocks.add(this.refusalBlockIndex);
        out.push({ type: "content_start", index: this.refusalBlockIndex, contentType: "refusal" });
      }
      out.push({ type: "content_delta", index: this.refusalBlockIndex, delta: delta.refusal });
    }

    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (!this.toolCallMap.has(tc.index)) {
          const idx = this.nextIndex++;
          this.toolCallMap.set(tc.index, idx);
          out.push({
            type: "tool_start",
            index: idx,
            id: tc.id || `call_${tc.index}`,
            name: tc.function?.name || "",
            kind: "function",
          });
        }
        const blockIdx = this.toolCallMap.get(tc.index)!;
        if (tc.function?.arguments) {
          out.push({ type: "tool_delta", index: blockIdx, delta: tc.function.arguments });
        }
      }
    }

    if (finish_reason != null) {
      for (const idx of this.openContentBlocks) {
        out.push({ type: "content_done", index: idx });
      }
      for (const [, idx] of this.toolCallMap) {
        out.push({ type: "tool_done", index: idx });
      }
      out.push({
        type: "end",
        finishReason: finish_reason,
        usage: chunk.usage as Record<string, unknown> | undefined,
      });
    }

    return out;
  }
}

// ─── OpenAI Responses Parser ────────────────────────────────────────────────

export class ResponsesStreamParser implements StreamParser {
  private blockMapping = new Map<string, number>();
  private blockTypes = new Map<string, "text" | "refusal" | "thinking">();
  private nextIndex = 0;

  parse(event: ResponseStreamEvent): NormalizedStreamEvent[] {
    const out: NormalizedStreamEvent[] = [];

    switch (event.type) {
      case "response.created": {
        const r = event.response;
        out.push({ type: "start", id: r.id, model: r.model, createdAt: r.created_at });
        break;
      }

      case "response.output_item.added": {
        const item = event.item;
        if (item.type === "function_call") {
          const idx = this.nextIndex++;
          const key = `tool_${event.output_index}`;
          this.blockMapping.set(key, idx);
          out.push({ type: "tool_start", index: idx, id: item.call_id, name: item.name, kind: "function" });
        }
        break;
      }

      case "response.content_part.added": {
        const key = `${event.output_index}_${event.content_index}`;
        const partType = event.part?.type;
        if (partType === "output_text") {
          const idx = this.nextIndex++;
          this.blockMapping.set(key, idx);
          this.blockTypes.set(key, "text");
          out.push({ type: "content_start", index: idx, contentType: "text" });
        } else if (partType === "refusal") {
          const idx = this.nextIndex++;
          this.blockMapping.set(key, idx);
          this.blockTypes.set(key, "refusal");
          out.push({ type: "content_start", index: idx, contentType: "refusal" });
        }
        break;
      }

      case "response.output_text.delta": {
        const key = `${event.output_index}_${event.content_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "content_delta", index: idx, delta: event.delta });
        break;
      }

      case "response.refusal.delta": {
        const key = `${event.output_index}_${event.content_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "content_delta", index: idx, delta: event.delta });
        break;
      }

      case "response.function_call_arguments.delta": {
        const key = `tool_${event.output_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "tool_delta", index: idx, delta: event.delta });
        break;
      }

      case "response.custom_tool_call_input.delta": {
        const key = `tool_${event.output_index}`;
        if (!this.blockMapping.has(key)) {
          const idx = this.nextIndex++;
          this.blockMapping.set(key, idx);
          out.push({ type: "tool_start", index: idx, id: event.item_id || "", name: "", kind: "custom" });
        }
        const idx = this.blockMapping.get(key)!;
        out.push({ type: "tool_delta", index: idx, delta: event.delta });
        break;
      }

      case "response.reasoning_summary_text.delta": {
        const key = `thinking_${event.output_index}_${event.summary_index}`;
        if (!this.blockMapping.has(key)) {
          const idx = this.nextIndex++;
          this.blockMapping.set(key, idx);
          this.blockTypes.set(key, "thinking");
          out.push({ type: "content_start", index: idx, contentType: "thinking" });
        }
        const idx = this.blockMapping.get(key)!;
        out.push({ type: "content_delta", index: idx, delta: event.delta });
        break;
      }

      case "response.reasoning_summary_part.done": {
        const key = `thinking_${event.output_index}_${event.summary_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "content_done", index: idx });
        break;
      }

      case "response.content_part.done": {
        const key = `${event.output_index}_${event.content_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "content_done", index: idx });
        break;
      }

      case "response.function_call_arguments.done":
      case "response.custom_tool_call_input.done": {
        const key = `tool_${event.output_index}`;
        const idx = this.blockMapping.get(key);
        if (idx != null) out.push({ type: "tool_done", index: idx });
        break;
      }

      case "response.completed": {
        const r = event.response;
        const hasToolCalls = r.output?.some((item: any) => item.type === "function_call" || item.type === "custom_tool_call");
        const finishReason = r.status === "incomplete" ? "length" : hasToolCalls ? "tool_calls" : "stop";
        out.push({ type: "end", finishReason, usage: r.usage as Record<string, unknown> | undefined });
        break;
      }

      case "response.failed": {
        out.push({ type: "end", finishReason: "error" });
        break;
      }
    }

    return out;
  }
}

// ─── Anthropic Parser ───────────────────────────────────────────────────────

export class AnthropicStreamParser implements StreamParser {
  private blockTypes = new Map<number, string>();

  parse(event: RawMessageStreamEvent): NormalizedStreamEvent[] {
    const out: NormalizedStreamEvent[] = [];

    switch (event.type) {
      case "message_start": {
        const msg = event.message;
        out.push({ type: "start", id: msg.id, model: msg.model, createdAt: 0 });
        break;
      }

      case "content_block_start": {
        const block = event.content_block;
        const idx = event.index;
        this.blockTypes.set(idx, block.type);

        if (block.type === "text") {
          out.push({ type: "content_start", index: idx, contentType: "text" });
        } else if (block.type === "thinking") {
          out.push({ type: "content_start", index: idx, contentType: "thinking" });
        } else if (block.type === "redacted_thinking") {
          out.push({ type: "content_start", index: idx, contentType: "redacted_thinking" });
          if (block.data) {
            out.push({ type: "content_delta", index: idx, delta: block.data });
          }
        } else if (block.type === "tool_use") {
          out.push({ type: "tool_start", index: idx, id: block.id, name: block.name, kind: "function" });
        }
        break;
      }

      case "content_block_delta": {
        const idx = event.index;
        const delta = event.delta;

        if (delta.type === "text_delta") {
          out.push({ type: "content_delta", index: idx, delta: delta.text });
        } else if (delta.type === "thinking_delta") {
          out.push({ type: "content_delta", index: idx, delta: delta.thinking });
        } else if (delta.type === "input_json_delta") {
          out.push({ type: "tool_delta", index: idx, delta: delta.partial_json });
        } else if (delta.type === "signature_delta") {
          out.push({ type: "signature_delta", index: idx, delta: delta.signature });
        }
        break;
      }

      case "content_block_stop": {
        const idx = event.index;
        const blockType = this.blockTypes.get(idx);
        if (blockType === "tool_use") {
          out.push({ type: "tool_done", index: idx });
        } else {
          out.push({ type: "content_done", index: idx });
        }
        break;
      }

      case "message_delta": {
        out.push({
          type: "end",
          finishReason: event.delta?.stop_reason ?? null,
          usage: event.usage as Record<string, unknown> | undefined,
        });
        break;
      }
    }

    return out;
  }
}

// ─── OpenAI Chat Emitter ────────────────────────────────────────────────────

export class OpenAIChatStreamEmitter implements StreamEmitter {
  private id = "";
  private model = "";
  private created = 0;
  private blockTypes = new Map<number, string>();
  private toolCallCounter = 0;
  private blockToToolIndex = new Map<number, number>();

  private chunk(delta: Record<string, unknown>, finishReason: string | null = null, usage?: Record<string, unknown>): ChatCompletionChunk {
    return {
      id: this.id,
      object: "chat.completion.chunk" as const,
      created: this.created,
      model: this.model,
      choices: [{ index: 0, delta, finish_reason: finishReason as any, logprobs: null }],
      ...(usage ? { usage } : {}),
    } as ChatCompletionChunk;
  }

  emit(event: NormalizedStreamEvent): ChatCompletionChunk[] {
    const out: ChatCompletionChunk[] = [];

    switch (event.type) {
      case "start":
        this.id = event.id;
        this.model = event.model;
        this.created = event.createdAt;
        out.push(this.chunk({ role: "assistant", content: "" }));
        break;

      case "content_start":
        this.blockTypes.set(event.index, event.contentType);
        break;

      case "content_delta": {
        const ct = this.blockTypes.get(event.index);
        if (ct === "text") {
          out.push(this.chunk({ content: event.delta }));
        } else if (ct === "refusal") {
          out.push(this.chunk({ refusal: event.delta }));
        }
        break;
      }

      case "tool_start": {
        const tcIdx = this.toolCallCounter++;
        this.blockToToolIndex.set(event.index, tcIdx);
        this.blockTypes.set(event.index, "tool_call");
        out.push(
          this.chunk({
            tool_calls: [{ index: tcIdx, id: event.id, type: "function", function: { name: event.name, arguments: "" } }],
          }),
        );
        break;
      }

      case "tool_delta": {
        const tcIdx = this.blockToToolIndex.get(event.index);
        if (tcIdx != null) {
          out.push(this.chunk({ tool_calls: [{ index: tcIdx, function: { arguments: event.delta } }] }));
        }
        break;
      }

      case "end":
        out.push(this.chunk({}, normalizeChatFinishReason(event.finishReason), event.usage));
        break;
    }

    return out;
  }

  finish(): ChatCompletionChunk[] {
    return [];
  }
}

// ─── OpenAI Responses Emitter ───────────────────────────────────────────────

export class ResponsesStreamEmitter implements StreamEmitter {
  private id = "";
  private model = "";
  private createdAt = 0;
  private seq = 0;
  private outputIndex = 0;
  private messageOutputIndex: number | null = null;
  private contentIndexes = new Map<number, number>();
  private blockToMapping = new Map<number, { outputIndex: number; contentIndex?: number; summaryIndex?: number }>();
  private blockTypes = new Map<number, string>();
  private accumulated = new Map<number, string>();
  private toolCallInfo = new Map<number, { id: string; name: string }>();
  private itemIds = new Map<number, string>();
  // Accumulate completed content parts and output items for done/completed events
  private messageContentParts: Record<string, unknown>[] = [];
  private completedOutputItems: Record<string, unknown>[] = [];
  private outputText = "";

  private nextSeq() {
    return this.seq++;
  }

  private makeItemId(outputIndex: number, prefix: string): string {
    const id = `${prefix}_${outputIndex}`;
    this.itemIds.set(outputIndex, id);
    return id;
  }

  private buildResponseShell(status: string, usage?: Record<string, unknown>): Record<string, unknown> {
    return {
      id: this.id,
      object: "response",
      created_at: this.createdAt,
      status,
      model: this.model,
      output: this.completedOutputItems,
      output_text: this.outputText,
      ...(usage ? { usage } : {}),
    };
  }

  emit(event: NormalizedStreamEvent): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];

    switch (event.type) {
      case "start": {
        this.id = event.id;
        this.model = event.model;
        this.createdAt = event.createdAt;
        out.push({ type: "response.created", response: this.buildResponseShell("in_progress"), sequence_number: this.nextSeq() });
        out.push({ type: "response.in_progress", response: this.buildResponseShell("in_progress"), sequence_number: this.nextSeq() });
        break;
      }

      case "content_start": {
        this.blockTypes.set(event.index, event.contentType);
        this.accumulated.set(event.index, "");

        if (event.contentType === "thinking") {
          const oi = this.outputIndex++;
          const itemId = this.makeItemId(oi, "rs");
          this.blockToMapping.set(event.index, { outputIndex: oi, summaryIndex: 0 });
          out.push({ type: "response.output_item.added", output_index: oi, item: { id: itemId, type: "reasoning", status: "in_progress", summary: [] }, sequence_number: this.nextSeq() });
          out.push({ type: "response.reasoning_summary_part.added", item_id: itemId, output_index: oi, summary_index: 0, part: { type: "summary_text", text: "" }, sequence_number: this.nextSeq() });
        } else if (event.contentType === "text" || event.contentType === "refusal") {
          if (this.messageOutputIndex == null) {
            this.messageOutputIndex = this.outputIndex++;
            const itemId = this.makeItemId(this.messageOutputIndex, "msg");
            out.push({ type: "response.output_item.added", output_index: this.messageOutputIndex, item: { id: itemId, type: "message", role: "assistant", status: "in_progress", content: [] }, sequence_number: this.nextSeq() });
          }
          const ci = this.contentIndexes.get(this.messageOutputIndex) ?? 0;
          this.contentIndexes.set(this.messageOutputIndex, ci + 1);
          this.blockToMapping.set(event.index, { outputIndex: this.messageOutputIndex, contentIndex: ci });
          const itemId = this.itemIds.get(this.messageOutputIndex)!;
          if (event.contentType === "text") {
            out.push({ type: "response.content_part.added", item_id: itemId, output_index: this.messageOutputIndex, content_index: ci, part: { type: "output_text", text: "", annotations: [] }, sequence_number: this.nextSeq() });
          } else {
            out.push({ type: "response.content_part.added", item_id: itemId, output_index: this.messageOutputIndex, content_index: ci, part: { type: "refusal", refusal: "" }, sequence_number: this.nextSeq() });
          }
        }
        break;
      }

      case "content_delta": {
        const ct = this.blockTypes.get(event.index);
        const mapping = this.blockToMapping.get(event.index);
        if (!mapping) break;
        const acc = (this.accumulated.get(event.index) ?? "") + event.delta;
        this.accumulated.set(event.index, acc);
        const itemId = this.itemIds.get(mapping.outputIndex) ?? "";

        if (ct === "text") {
          out.push({ type: "response.output_text.delta", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, delta: event.delta, sequence_number: this.nextSeq() });
        } else if (ct === "refusal") {
          out.push({ type: "response.refusal.delta", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, delta: event.delta, sequence_number: this.nextSeq() });
        } else if (ct === "thinking") {
          out.push({ type: "response.reasoning_summary_text.delta", item_id: itemId, output_index: mapping.outputIndex, summary_index: mapping.summaryIndex ?? 0, delta: event.delta, sequence_number: this.nextSeq() });
        }
        break;
      }

      case "content_done": {
        const ct = this.blockTypes.get(event.index);
        const mapping = this.blockToMapping.get(event.index);
        if (!mapping) break;
        const acc = this.accumulated.get(event.index) ?? "";
        const itemId = this.itemIds.get(mapping.outputIndex) ?? "";

        if (ct === "text") {
          const part = { type: "output_text", text: acc, annotations: [] };
          this.messageContentParts.push(part);
          this.outputText += acc;
          out.push({ type: "response.output_text.done", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, text: acc, sequence_number: this.nextSeq() });
          out.push({ type: "response.content_part.done", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, part, sequence_number: this.nextSeq() });
        } else if (ct === "refusal") {
          const part = { type: "refusal", refusal: acc };
          this.messageContentParts.push(part);
          out.push({ type: "response.refusal.done", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, refusal: acc, sequence_number: this.nextSeq() });
          out.push({ type: "response.content_part.done", item_id: itemId, output_index: mapping.outputIndex, content_index: mapping.contentIndex, part, sequence_number: this.nextSeq() });
        } else if (ct === "thinking") {
          const reasoningItem = { id: itemId, type: "reasoning", status: "completed", summary: [{ type: "summary_text", text: acc }] };
          this.completedOutputItems.push(reasoningItem);
          out.push({ type: "response.reasoning_summary_text.done", item_id: itemId, output_index: mapping.outputIndex, summary_index: mapping.summaryIndex ?? 0, text: acc, sequence_number: this.nextSeq() });
          out.push({ type: "response.reasoning_summary_part.done", item_id: itemId, output_index: mapping.outputIndex, summary_index: mapping.summaryIndex ?? 0, part: { type: "summary_text", text: acc }, sequence_number: this.nextSeq() });
          out.push({ type: "response.output_item.done", output_index: mapping.outputIndex, item: reasoningItem, sequence_number: this.nextSeq() });
        }
        break;
      }

      case "tool_start": {
        this.blockTypes.set(event.index, "tool_call");
        this.accumulated.set(event.index, "");
        this.toolCallInfo.set(event.index, { id: event.id, name: event.name });
        const oi = this.outputIndex++;
        const itemId = this.makeItemId(oi, event.id || "fc");
        this.blockToMapping.set(event.index, { outputIndex: oi });
        out.push({
          type: "response.output_item.added",
          output_index: oi,
          item: { id: itemId, type: "function_call", status: "in_progress", call_id: event.id, name: event.name, arguments: "" },
          sequence_number: this.nextSeq(),
        });
        break;
      }

      case "tool_delta": {
        const mapping = this.blockToMapping.get(event.index);
        if (!mapping) break;
        const acc = (this.accumulated.get(event.index) ?? "") + event.delta;
        this.accumulated.set(event.index, acc);
        const itemId = this.itemIds.get(mapping.outputIndex) ?? "";
        out.push({ type: "response.function_call_arguments.delta", item_id: itemId, output_index: mapping.outputIndex, delta: event.delta, sequence_number: this.nextSeq() });
        break;
      }

      case "tool_done": {
        const mapping = this.blockToMapping.get(event.index);
        if (!mapping) break;
        const acc = this.accumulated.get(event.index) ?? "";
        const itemId = this.itemIds.get(mapping.outputIndex) ?? "";
        const info = this.toolCallInfo.get(event.index);
        const fcItem = { id: itemId, type: "function_call", status: "completed", call_id: info?.id ?? "", name: info?.name ?? "", arguments: acc };
        this.completedOutputItems.push(fcItem);
        out.push({ type: "response.function_call_arguments.done", item_id: itemId, output_index: mapping.outputIndex, name: info?.name ?? "", arguments: acc, sequence_number: this.nextSeq() });
        out.push({ type: "response.output_item.done", output_index: mapping.outputIndex, item: fcItem, sequence_number: this.nextSeq() });
        break;
      }

      case "end": {
        if (this.messageOutputIndex != null) {
          const itemId = this.itemIds.get(this.messageOutputIndex) ?? "";
          const msgItem = { id: itemId, type: "message", role: "assistant", status: "completed", content: this.messageContentParts };
          this.completedOutputItems.push(msgItem);
          out.push({ type: "response.output_item.done", output_index: this.messageOutputIndex, item: msgItem, sequence_number: this.nextSeq() });
        }
        const status = event.finishReason === "error" ? "failed" : event.finishReason === "length" ? "incomplete" : "completed";
        out.push({ type: "response.completed", response: this.buildResponseShell(status, event.usage), sequence_number: this.nextSeq() });
        break;
      }
    }

    return out;
  }

  finish(): Record<string, unknown>[] {
    return [];
  }
}

// ─── Anthropic Emitter ──────────────────────────────────────────────────────

export class AnthropicStreamEmitter implements StreamEmitter {
  private id = "";
  private model = "";
  private blockTypes = new Map<number, string>();
  private blockIndex = 0;
  private normalizedToAnthropicIndex = new Map<number, number>();

  private getBlockIndex(normalizedIndex: number): number {
    if (!this.normalizedToAnthropicIndex.has(normalizedIndex)) {
      this.normalizedToAnthropicIndex.set(normalizedIndex, this.blockIndex++);
    }
    return this.normalizedToAnthropicIndex.get(normalizedIndex)!;
  }

  emit(event: NormalizedStreamEvent): Record<string, unknown>[] {
    const out: Record<string, unknown>[] = [];

    switch (event.type) {
      case "start": {
        this.id = event.id;
        this.model = event.model;
        out.push({
          type: "message_start",
          message: {
            id: event.id,
            type: "message",
            role: "assistant",
            model: event.model,
            content: [],
            stop_reason: null,
            stop_sequence: null,
            usage: { input_tokens: 0, output_tokens: 0 },
          },
        });
        break;
      }

      case "content_start": {
        const idx = this.getBlockIndex(event.index);
        this.blockTypes.set(event.index, event.contentType);

        if (event.contentType === "text") {
          out.push({ type: "content_block_start", index: idx, content_block: { type: "text", text: "", citations: null } });
        } else if (event.contentType === "thinking") {
          out.push({ type: "content_block_start", index: idx, content_block: { type: "thinking", thinking: "", signature: "" } });
        } else if (event.contentType === "redacted_thinking") {
          out.push({ type: "content_block_start", index: idx, content_block: { type: "redacted_thinking", data: "" } });
        } else if (event.contentType === "refusal") {
          out.push({ type: "content_block_start", index: idx, content_block: { type: "text", text: "", citations: null } });
        }
        break;
      }

      case "content_delta": {
        const idx = this.normalizedToAnthropicIndex.get(event.index);
        if (idx == null) break;
        const ct = this.blockTypes.get(event.index);

        if (ct === "thinking") {
          out.push({ type: "content_block_delta", index: idx, delta: { type: "thinking_delta", thinking: event.delta } });
        } else if (ct === "redacted_thinking") {
          // redacted_thinking data is set at block start, no incremental delta
        } else {
          out.push({ type: "content_block_delta", index: idx, delta: { type: "text_delta", text: event.delta } });
        }
        break;
      }

      case "signature_delta": {
        const idx = this.normalizedToAnthropicIndex.get(event.index);
        if (idx == null) break;
        out.push({ type: "content_block_delta", index: idx, delta: { type: "signature_delta", signature: event.delta } });
        break;
      }

      case "content_done": {
        const idx = this.normalizedToAnthropicIndex.get(event.index);
        if (idx == null) break;
        out.push({ type: "content_block_stop", index: idx });
        break;
      }

      case "tool_start": {
        const idx = this.getBlockIndex(event.index);
        this.blockTypes.set(event.index, "tool_use");
        out.push({ type: "content_block_start", index: idx, content_block: { type: "tool_use", id: event.id, name: event.name, input: {} } });
        break;
      }

      case "tool_delta": {
        const idx = this.normalizedToAnthropicIndex.get(event.index);
        if (idx == null) break;
        out.push({ type: "content_block_delta", index: idx, delta: { type: "input_json_delta", partial_json: event.delta } });
        break;
      }

      case "tool_done": {
        const idx = this.normalizedToAnthropicIndex.get(event.index);
        if (idx == null) break;
        out.push({ type: "content_block_stop", index: idx });
        break;
      }

      case "end": {
        const u = event.usage as Record<string, unknown> | undefined;
        out.push({
          type: "message_delta",
          delta: { stop_reason: normalizeAnthropicStopReason(event.finishReason), stop_sequence: null, container: null },
          usage: {
            output_tokens: (u?.output_tokens ?? u?.completion_tokens ?? 0) as number,
          },
        });
        out.push({ type: "message_stop" });
        break;
      }
    }

    return out;
  }

  finish(): Record<string, unknown>[] {
    return [];
  }
}

// ─── StreamConverter ────────────────────────────────────────────────────────

function createParser(format: StreamFormat): StreamParser {
  switch (format) {
    case "openai-chat":
      return new OpenAIChatStreamParser();
    case "openai-responses":
      return new ResponsesStreamParser();
    case "anthropic":
      return new AnthropicStreamParser();
    default:
      throw new Error(`Unknown stream format: ${format}`);
  }
}

function createEmitter(format: StreamFormat): StreamEmitter {
  switch (format) {
    case "openai-chat":
      return new OpenAIChatStreamEmitter();
    case "openai-responses":
      return new ResponsesStreamEmitter();
    case "anthropic":
      return new AnthropicStreamEmitter();
    default:
      throw new Error(`Unknown stream format: ${format}`);
  }
}

/**
 * Event-level stream converter.
 *
 * ```ts
 * const c = createStreamConverter("anthropic", "openai-chat");
 * for (const out of c.push(anthropicEvent)) { ... }
 * for (const out of c.flush()) { ... }
 * ```
 */
export class StreamConverter {
  private parser: StreamParser;
  private emitter: StreamEmitter;

  constructor(
    public readonly from: StreamFormat,
    public readonly to: StreamFormat,
  ) {
    this.parser = createParser(from);
    this.emitter = createEmitter(to);
  }

  push(event: unknown): unknown[] {
    const normalized = this.parser.parse(event);
    const output: unknown[] = [];
    for (const ne of normalized) {
      output.push(...this.emitter.emit(ne));
    }
    return output;
  }

  flush(): unknown[] {
    return this.emitter.finish();
  }
}

// ─── SSEStreamConverter ─────────────────────────────────────────────────────

/**
 * Raw SSE text converter.
 *
 * ```ts
 * const c = createSSEConverter("anthropic", "openai-chat");
 * res.write(c.push(incomingChunk).join(""));
 * res.write(c.flush().join(""));
 * ```
 */
export class SSEStreamConverter {
  private sseParser = new SSEParser();
  private converter: StreamConverter;
  private toFormat: StreamFormat;

  constructor(from: StreamFormat, to: StreamFormat) {
    this.toFormat = to;
    this.converter = new StreamConverter(from, to);
  }

  push(sseText: string): string[] {
    const parsed = this.sseParser.push(sseText);
    const output: string[] = [];
    for (const { data } of parsed) {
      let event: unknown;
      try {
        event = JSON.parse(data);
      } catch {
        continue;
      }
      for (const result of this.converter.push(event)) {
        output.push(formatSSE(result, this.getEventName(result)));
      }
    }
    return output;
  }

  flush(): string[] {
    const output: string[] = [];
    for (const { data } of this.sseParser.flush()) {
      let event: unknown;
      try {
        event = JSON.parse(data);
      } catch {
        continue;
      }
      for (const result of this.converter.push(event)) {
        output.push(formatSSE(result, this.getEventName(result)));
      }
    }
    for (const result of this.converter.flush()) {
      output.push(formatSSE(result, this.getEventName(result)));
    }
    if (this.toFormat === "openai-chat") {
      output.push(formatDone());
    }
    return output;
  }

  private getEventName(event: unknown): string | undefined {
    if (this.toFormat === "openai-chat") return undefined;
    return (event as Record<string, unknown>)?.type as string | undefined;
  }
}

// ─── TransformStream ────────────────────────────────────────────────────────

/**
 * Web TransformStream for SSE byte conversion.
 *
 * ```ts
 * const t = createSSETransformStream("anthropic", "openai-chat");
 * return new Response(upstream.body!.pipeThrough(t));
 * ```
 */
export function createSSETransformStream(from: StreamFormat, to: StreamFormat): TransformStream<Uint8Array, Uint8Array> {
  const converter = new SSEStreamConverter(from, to);
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      for (const line of converter.push(text)) {
        controller.enqueue(encoder.encode(line));
      }
    },
    flush(controller) {
      for (const line of converter.flush()) {
        controller.enqueue(encoder.encode(line));
      }
    },
  });
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createStreamConverter(from: StreamFormat, to: StreamFormat): StreamConverter {
  return new StreamConverter(from, to);
}

export function createSSEConverter(from: StreamFormat, to: StreamFormat): SSEStreamConverter {
  return new SSEStreamConverter(from, to);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeChatFinishReason(reason: string | null): "stop" | "length" | "tool_calls" | "content_filter" | null {
  if (reason === "tool_use" || reason === "tool_calls") return "tool_calls";
  if (reason === "max_tokens" || reason === "length") return "length";
  if (reason === "refusal" || reason === "content_filter") return "content_filter";
  if (reason === "end_turn" || reason === "stop") return "stop";
  if (reason === "error") return "stop";
  if (reason) return "stop";
  return null;
}

function normalizeAnthropicStopReason(reason: string | null): string | null {
  if (reason === "tool_calls" || reason === "tool_use") return "tool_use";
  if (reason === "length" || reason === "max_tokens") return "max_tokens";
  if (reason === "stop_sequence") return "stop_sequence";
  if (reason === "pause_turn") return "pause_turn";
  if (reason === "stop" || reason === "end_turn") return "end_turn";
  if (reason === "refusal" || reason === "content_filter") return "refusal";
  if (reason === "error") return "end_turn";
  return reason;
}
