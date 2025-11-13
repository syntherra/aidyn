const API_URL = "https://api.deepseek.com/v1/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: { model?: string; temperature?: number } = {}
) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_DEEPSEEK_API_KEY");

  const body = {
    model: options.model ?? "deepseek-chat",
    messages,
    stream: true,
    temperature: options.temperature ?? 0.2,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`DeepSeek error ${res.status}: ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content ?? "";
        if (delta) onChunk(delta);
      } catch {}
    }
  }
}

export async function chatOnce(messages: ChatMessage[], options: { model?: string; temperature?: number } = {}) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_DEEPSEEK_API_KEY");

  const body = {
    model: options.model ?? "deepseek-chat",
    messages,
    stream: false,
    temperature: options.temperature ?? 0.2,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DeepSeek error ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

