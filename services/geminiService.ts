
import { Category, Difficulty, Word } from "../types";
import { generateText, generateStructured, Type } from "./aiCore";

// --- Business Logic Layer ---

export const generateFunSentence = async (word: Word): Promise<string> => {
  try {
    const systemInstruction = "You are a fun English teacher for an 8-year-old child.";
    const prompt = `Write a very short, simple, and funny sentence using the English word "${word.english}". 
    The sentence should be easy to understand for a 3rd grader.
    Only return the sentence.`;

    return await generateText(prompt, systemInstruction);

  } catch (error) {
    console.warn("Fallback used for sentence generation");
    return `I like ${word.english}!`; // Safe fallback
  }
};

export const generateQuizHint = async (word: Word): Promise<string> => {
  try {
    const prompt = `Describe the word "${word.english}" in one very simple English sentence without saying the word itself. 
    It is for a guessing game for an 8-year-old.`;

    return await generateText(prompt);

  } catch (error) {
    return "Guess the word!";
  }
}

export const generateWordList = async (topic: string, difficulty: Difficulty): Promise<Word[]> => {
  try {
    const prompt = `Generate a list of 20 English vocabulary words related to the topic: "${topic}". 
      Target audience: 8-year-old child (3rd Grade). 
      Difficulty: ${difficulty}.
      For each word, provide the Chinese translation, a relevant emoji, and the IPA phonetic transcription.
      
      Output strictly a JSON array of objects.`;

    // Define Schema using the Framework's exported Type
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          chinese: { type: Type.STRING },
          phonetic: { type: Type.STRING, description: "IPA phonetic symbol" },
          emoji: { type: Type.STRING },
        },
        required: ["english", "chinese", "phonetic", "emoji"],
      },
    };

    // Use 'any' type here to allow manual validation of the structure
    let rawData = await generateStructured<any>(prompt, schema);

    // Robustness: Some models (like DeepSeek in JSON mode) return an object wrapper 
    // instead of a root array (e.g. { "words": [...] }).
    if (!Array.isArray(rawData)) {
      if (typeof rawData === 'object' && rawData !== null) {
        // Try to find the first array property in the object
        const arrayProp = Object.values(rawData).find(val => Array.isArray(val));
        if (arrayProp) {
          rawData = arrayProp;
        }
      }
    }

    if (!Array.isArray(rawData)) {
      console.error("AI Response was not an array:", rawData);
      throw new Error("AI returned an invalid format (expected a list).");
    }

    // Map to internal Word type
    return rawData.map((item: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      english: item.english,
      chinese: item.chinese,
      phonetic: item.phonetic,
      emoji: item.emoji,
      category: Category.CUSTOM
    }));

  } catch (error) {
    console.error("Service Error generating word list:", error);
    // Return a fallback mock list if AI fails
    return [
      { id: 'err1', english: 'Error', chinese: '错误', emoji: '⚠️', category: Category.CUSTOM, phonetic: '/ˈer.ər/' },
      { id: 'err2', english: 'Try Again', chinese: '重试', emoji: '🔄', category: Category.CUSTOM, phonetic: '/traɪ əˈɡen/' },
    ];
  }
};
