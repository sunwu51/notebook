// @ts-nocheck
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

function createClient({ apiKey, baseURL }: { apiKey?: string; baseURL?: string }) {
  const resolvedApiKey = apiKey || process.env.OPENAI_API_KEY;
  const resolvedBaseURL = baseURL || process.env.OPENAI_BASE_URL;

  if (!resolvedApiKey) {
    throw new Error("Missing apiKey in request body or OPENAI_API_KEY in environment");
  }

  if (!resolvedBaseURL) {
    throw new Error("Missing baseURL in request body or OPENAI_BASE_URL in environment");
  }

  return new OpenAI({
    apiKey: resolvedApiKey,
    baseURL: resolvedBaseURL,
  });
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Express chat server is running",
    endpoints: {
      health: "GET /health",
      chat: "POST /chat",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/chat", async (req, res) => {
  const {
    baseURL,
    apiKey,
    model = process.env.OPENAI_MODEL,
    messages,
    temperature,
    max_tokens,
  } = req.body;

  if (!model) {
    return res.status(400).json({
      error: "Missing model in request body or OPENAI_MODEL in environment",
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "messages must be a non-empty array",
    });
  }

  try {
    const client = createClient({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    return res.json({
      id: completion.id,
      model: completion.model,
      content: completion.choices?.[0]?.message?.content ?? "",
      raw: completion,
    });
  } catch (error) {
    const typedError = error as { status?: number; message?: string; error?: unknown };
    return res.status(typedError.status || 500).json({
      error: typedError.message || "Request failed",
      details: typedError.error || null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
