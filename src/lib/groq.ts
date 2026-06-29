import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  groqClient = new Groq({ apiKey });
  return groqClient;
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
}

export const AZ_GRAMMAR_INSTRUCTION =
  "Standart ədəbi Azərbaycan dilindən istifadə et. Qrammatik qaydalara, ahəng qanununa və düzgün diakritiklərə (ə, ı, ö, ü, ç, ş, ğ) ciddi əməl et. Mümkün olduqda anglisizmlərdən çəkin və onların yerinə Azərbaycan dilindəki uyğun terminlərdən istifadə et.";

interface ChatCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function completeChat({
  systemPrompt,
  userPrompt,
  temperature = 0.4,
  maxTokens = 1024,
}: ChatCompletionParams): Promise<string> {
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: getGroqModel(),
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function streamChat({
  systemPrompt,
  messages,
  temperature = 0.4,
  maxTokens = 1024,
}: {
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
}) {
  const client = getGroqClient();
  return client.chat.completions.create({
    model: getGroqModel(),
    temperature,
    max_tokens: maxTokens,
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });
}
