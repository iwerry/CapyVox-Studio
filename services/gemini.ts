import { GoogleGenAI, Modality } from "@google/genai";
import { TargetLanguage, VoiceName, VoiceTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Improves or translates text using Gemini Flash, applying a specific tone/mood.
 */
export async function improveText(
  originalText: string,
  targetLanguage: TargetLanguage,
  tone: VoiceTone
): Promise<string> {
  // Map tones to specific instruction styles for the LLM
  const toneInstructions: Record<VoiceTone, string> = {
    [VoiceTone.Standard]: "Clear, professional, and well-structured.",
    [VoiceTone.Epic]: "Grand, cinematic, trailer-like, using dramatic pauses (commas/ellipses).",
    [VoiceTone.Joyful]: "Happy, enthusiastic, exclamation-heavy, and warm.",
    [VoiceTone.Serious]: "Formal, grave, slow-paced, and authoritative.",
    [VoiceTone.Melancholic]: "Soft, reflective, slightly sad, and poetic.",
    [VoiceTone.Mysterious]: "Enigmatic, whispering, suspenseful.",
  };

  const instruction = toneInstructions[tone];

  const prompt = `
    You are an expert scriptwriter for Text-to-Speech engines.
    
    Task: Rewrite the user's text to be in the language: "${targetLanguage}".
    
    Style/Tone Goal: ${tone}.
    Style Instructions: ${instruction}
    
    Rules:
    1. If the text is NOT in ${targetLanguage}, translate it first.
    2. Rewrite the text to strictly match the requested Tone/Style. 
       - Use punctuation (like ... or !) to guide the TTS engine's prosody.
       - Choose words that convey the emotion.
    3. Return ONLY the final text. No "Here is the text" or quotes.

    Original Text:
    "${originalText}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text?.trim() || originalText;
}

/**
 * Generates speech from text using Gemini TTS.
 */
export async function generateSpeech(
  text: string,
  voice: VoiceName
): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("Failed to generate audio data from Gemini.");
  }

  return base64Audio;
}