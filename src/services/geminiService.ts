import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

export function getAI() {
  if (!ai) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function breakdownTask(taskText: string): Promise<string[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pecahkan tugas berikut menjadi 3-5 langkah praktis dan singkat yang siap dikerjakan: "${taskText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
        systemInstruction: "Anda adalah asisten produktivitas profesional. Berikan langkah-langkah dalam Bahasa Indonesia yang singkat, padat, dan jelas. Hanya kembalikan array JSON berisi string.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
}
