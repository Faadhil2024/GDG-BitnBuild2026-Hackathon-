/**
 * Model adapters. Each speaks to a provider that offers a free tier, using plain
 * fetch (no SDK dependency). Swap providers with AI_PROVIDER + AI_API_KEY.
 */
export interface ModelAdapter {
  name: string;
  complete(system: string, user: string, signal: AbortSignal): Promise<string>;
}

const TIMEOUT_MS = 12_000;

function openAiCompatible(name: string, url: string, model: string, apiKey: string): ModelAdapter {
  return {
    name: `${name}/${model}`,
    async complete(system, user, signal) {
      const res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) throw new Error(`${name} HTTP ${res.status}`);
      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (typeof text !== "string") throw new Error(`${name} returned no content`);
      return text;
    },
  };
}

function gemini(model: string, apiKey: string): ModelAdapter {
  return {
    name: `gemini/${model}`,
    async complete(system, user, signal) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
          }),
        },
      );
      if (!res.ok) throw new Error(`gemini HTTP ${res.status}`);
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") throw new Error("gemini returned no content");
      return text;
    },
  };
}

/** Returns null when no provider is configured — the service then uses the deterministic fallback. */
export function resolveAdapter(env = process.env): ModelAdapter | null {
  const key = env.AI_API_KEY;
  if (!key) return null;
  const provider = (env.AI_PROVIDER ?? "groq").toLowerCase();
  switch (provider) {
    case "groq":
      return openAiCompatible("groq", "https://api.groq.com/openai/v1/chat/completions", env.AI_MODEL ?? "llama-3.3-70b-versatile", key);
    case "gemini":
      return gemini(env.AI_MODEL ?? "gemini-2.0-flash", key);
    case "openrouter":
      return openAiCompatible("openrouter", "https://openrouter.ai/api/v1/chat/completions", env.AI_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free", key);
    default:
      return null;
  }
}

export function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fn(ctrl.signal).finally(() => clearTimeout(t));
}
