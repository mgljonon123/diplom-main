// /app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getOpenRouterResponse } from '@/lib/openrouter';

interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: string;
  content: MessageContent[] | string;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const response = await getOpenRouterResponse(messages);
    return NextResponse.json({ message: response });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}