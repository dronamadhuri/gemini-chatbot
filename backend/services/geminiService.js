import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let ai;
try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
    console.log(`Gemini API Service initialized with model: ${modelName}`);
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. Gemini API calls will fail.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI client:", error);
}

/**
 * Sends a chat message to Gemini with conversation history.
 * @param {string} message - The latest prompt from the user.
 * @param {Array} history - Pre-existing conversation logs. Format: Array of { role: 'user'|'model', parts: [{ text: string }] }
 * @returns {Promise<string>} The generated reply from Gemini.
 */
export async function generateChatResponse(message, history = []) {
  if (!ai) {
    // Retry initialization in case env var was loaded after startup
    const currentKey = process.env.GEMINI_API_KEY || apiKey;
    if (!currentKey) {
      throw new Error("Gemini API Client is not initialized. Please verify GEMINI_API_KEY is set in your .env file.");
    }
    ai = new GoogleGenAI({ apiKey: currentKey });
  }

  try {
    // Validate message
    if (!message || typeof message !== 'string') {
      throw new Error("Invalid message format: Message must be a non-empty string.");
    }

    // Format history structure to match expected SDK types
    // Ensuring role is either 'user' or 'model' and parts has [{ text: ... }]
    const formattedHistory = history.map(item => {
      const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
      let parts = item.parts;
      if (!parts) {
        if (item.text) {
          parts = [{ text: item.text }];
        } else if (typeof item.content === 'string') {
          parts = [{ text: item.content }];
        } else {
          parts = [{ text: '' }];
        }
      }
      return { role, parts };
    });

    let retries = 3;
    let retryDelay = 2000;
    let response;

    while (retries > 0) {
      try {
        const chat = ai.chats.create({
          model: modelName,
          history: formattedHistory
        });
        response = await chat.sendMessage({
          message: message
        });
        break;
      } catch (error) {
        retries--;
        const errStr = error.message || '';
        const isRateOrBusy = error.status === 429 || error.status === 503 || 
                             errStr.includes('429') || errStr.includes('503') || 
                             errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('UNAVAILABLE');

        if (retries > 0 && isRateOrBusy) {
          console.warn(`Gemini API rate limited or overloaded. Retrying in ${retryDelay / 1000}s... (Retries left: ${retries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2.5; // Exponential increase
        } else {
          throw error;
        }
      }
    }

    if (!response || !response.text) {
      throw new Error("Empty response received from Gemini API.");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error details:", error.message || error);
    throw error;
  }
}
