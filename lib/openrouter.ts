
import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.YOUR_SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.YOUR_SITE_NAME || 'My Chatbot';

if (!API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not defined in .env file');
}

interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: string;
  content: MessageContent[] | string;
}

export async function getOpenRouterResponse(messages: Message[]): Promise<string> {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openai/gpt-4.1', // Загварыг OpenRouter-ийн баримтаас шалгана уу
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error('Failed to fetch response from OpenRouter API');
  }
}