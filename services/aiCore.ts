
import { GoogleGenAI, Type } from "@google/genai";
import { AIModelConfig } from "../types";

/**
 * ==============================================================================
 * 🛠️ AI MODEL CONFIGURATION FRAMEWORK
 * ==============================================================================
 */

const STORAGE_KEY = 'wonderwords_ai_config';

// Default settings if nothing is saved
export const DEFAULT_CONFIG: AIModelConfig = {
  // Using gemini-3-flash-preview as recommended for basic text tasks
  model: 'gemini-3-flash-preview',
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
};

export const AVAILABLE_MODELS = [
  // Updated model names to follow @google/genai guidelines
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast & Smart)' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite (Efficient)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Most Intelligent)' },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1 (External)' },
];

/**
 * Retrieves the current AI configuration from LocalStorage or returns defaults.
 */
export const getAIConfig = (): AIModelConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Failed to load AI config", e);
  }
  return DEFAULT_CONFIG;
};

/**
 * Saves the new configuration to LocalStorage.
 */
export const saveAIConfig = (config: AIModelConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// ==============================================================================
// ⚙️ CORE ENGINE
// ==============================================================================

// Re-export Type for Schema definition
export { Type };

/**
 * Helper to get a fresh Google client instance.
 */
const getGoogleClient = (): GoogleGenAI => {
  // API key must be obtained exclusively from process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("AI_CONFIG: Google API Key is missing.");
  }
  // Initializing with named parameter as required
  return new GoogleGenAI({ apiKey });
};

/**
 * Call DeepSeek API directly via Fetch
 */
const callDeepSeek = async (config: AIModelConfig, prompt: string, systemInstruction?: string, isJson: boolean = false): Promise<string> => {
    if (!config.customApiKey) {
        throw new Error("DeepSeek API Key is missing. Please enter it in Settings.");
    }

    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.customApiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-reasoner', 
                messages: messages,
                temperature: config.temperature,
                stream: false,
                // Note: R1 might strictly output what is prompted. 'json_object' enforces valid JSON structure.
                response_format: isJson ? { type: 'json_object' } : undefined
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`DeepSeek API Error (${response.status}): ${err}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || "";

        // CLEANUP: DeepSeek R1 often includes <think>...</think> blocks. We must remove them.
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        return content;
    } catch (error) {
        console.error("DeepSeek Fetch Error:", error);
        throw error;
    }
}

/**
 * Standardized Text Generation
 */
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const config = getAIConfig();
  
  try {
    // 1. Check if using DeepSeek
    if (config.model.startsWith('deepseek')) {
        return await callDeepSeek(config, prompt, systemInstruction, false);
    }

    // 2. Default to Google GenAI
    const client = getGoogleClient();
    // Use ai.models.generateContent to query GenAI as required
    const response = await client.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        responseMimeType: "text/plain",
      },
    });

    // response.text is a property, not a method
    return response.text || "";
  } catch (error) {
    console.error(`AI Core Error [${config.model}]:`, error);
    throw error;
  }
};

/**
 * Standardized JSON/Structured Generation
 */
export const generateStructured = async <T>(prompt: string, schema: any): Promise<T> => {
  const config = getAIConfig();

  try {
    // 1. Check if using DeepSeek
    if (config.model.startsWith('deepseek')) {
        // DeepSeek JSON Mode handling
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Return valid JSON only. Do not wrap in markdown blocks if possible.`;
        const resultText = await callDeepSeek(config, jsonPrompt, "You are a helpful assistant that outputs JSON.", true);
        
        // Sanitize markdown code blocks if present (e.g. ```json ... ```)
        const cleanText = resultText.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText) as T;
    }

    // 2. Default to Google GenAI
    const client = getGoogleClient();
    // Use ai.models.generateContent with responseSchema for structured output
    const response = await client.models.generateContent({
      model: config.model,
      contents: prompt,
      config: {
        temperature: config.temperature, 
        topK: config.topK,
        topP: config.topP,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // response.text is a property, not a method
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`AI Core JSON Error [${config.model}]:`, error);
    throw error;
  }
};
