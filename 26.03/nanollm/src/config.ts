import { readFileSync } from "node:fs";
import { parse as parseYAML } from "yaml";
import type { StreamFormat } from "./converters/streams.js";

export interface ModelConfig {
  name: string;
  provider: StreamFormat;
  base_url: string;
  api_key: string;
  model: string;
}

export interface ServerConfig {
  port: number;
  models: ModelConfig[];
}

function resolveEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] ?? "");
}

function resolveDeep(obj: unknown): unknown {
  if (typeof obj === "string") return resolveEnvVars(obj);
  if (Array.isArray(obj)) return obj.map(resolveDeep);
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = resolveDeep(v);
    }
    return result;
  }
  return obj;
}

export function loadConfig(path: string): ServerConfig {
  const raw = readFileSync(path, "utf-8");
  const parsed = resolveDeep(parseYAML(raw)) as { server?: { port?: number }; models?: ModelConfig[] };

  const models = parsed.models ?? [];
  for (const m of models) {
    if (!m.name) throw new Error("Model config missing 'name'");
    if (!m.provider) throw new Error(`Model '${m.name}' missing 'provider'`);
    if (!m.base_url) throw new Error(`Model '${m.name}' missing 'base_url'`);
    if (!m.model) throw new Error(`Model '${m.name}' missing 'model'`);
    if (!["openai-chat", "openai-responses", "anthropic"].includes(m.provider)) {
      throw new Error(`Model '${m.name}' has invalid provider '${m.provider}'. Must be openai-chat, openai-responses, or anthropic`);
    }
  }

  return {
    port: Number(process.env.PORT) || (parsed.server?.port ?? 3000),
    models,
  };
}

export function resolveModel(config: ServerConfig, name: string): ModelConfig | undefined {
  return config.models.find((m) => m.name === name);
}
