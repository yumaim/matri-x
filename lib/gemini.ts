/**
 * Gemini AI Utility
 * Shared helper for calling the Google Gemini API across all AI features.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

/**
 * Call the Gemini API with a prompt and return parsed JSON.
 * @param prompt - The prompt to send
 * @param model - Model name (default: gemini-2.0-flash)
 * @param temperature - Generation temperature (default: 0.7)
 * @returns Parsed JSON response, or null if the API key is missing
 */
export async function callGemini<T = Record<string, unknown>>(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<{ data: T; aiEnabled: true } | { data: null; aiEnabled: false; message: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      data: null,
      aiEnabled: false,
      message: "Gemini API キーが未設定です。.env に GEMINI_API_KEY を設定してください。",
    };
  }

  const model = options?.model ?? "gemini-2.0-flash";
  const temperature = options?.temperature ?? 0.7;
  const maxOutputTokens = options?.maxOutputTokens ?? 2048;

  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const geminiRes: GeminiResponse = await res.json();
  const text = geminiRes.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  // Parse JSON (handle markdown code fences if present)
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned) as T;

  return { data: parsed, aiEnabled: true };
}
