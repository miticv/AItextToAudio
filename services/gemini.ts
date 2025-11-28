import { GoogleGenAI } from "@google/genai";
import { VoiceName } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSpeech(
  text: string,
  voice: VoiceName
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        // Use string literal "AUDIO" to avoid enum resolution issues and ensure strict typing matches SDK
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("No candidates returned from the model.");
    }

    // Check if the generation was stopped due to safety or other reasons
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      throw new Error(`Generation stopped. Reason: ${candidate.finishReason}`);
    }

    const firstPart = candidate.content?.parts?.[0];

    if (!firstPart) {
      throw new Error("No content parts returned.");
    }

    // If the model returns text, it's likely a refusal, safety block, or error message
    if (firstPart.text && !firstPart.inlineData) {
      throw new Error(`Model returned text instead of audio: "${firstPart.text}". Try simplifying your script or removing unsupported tags.`);
    }

    const base64Audio = firstPart.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data found in the response.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Error generating speech:", error);
    throw error;
  }
}