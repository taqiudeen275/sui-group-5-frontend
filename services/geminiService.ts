
import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateSuitContent = async (topic: string): Promise<string> => {
  if (!API_KEY) {
    return "AI is not configured. Please add an API key.";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a short, engaging social media post (like a tweet, max 280 chars) about the following topic: "${topic}". Be creative and concise.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating suit content:", error);
    return "Sorry, the AI is having trouble coming up with ideas right now.";
  }
};
