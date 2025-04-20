import { NextResponse } from 'next/server';
import type { AIResponse } from '@/types/responses';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5002';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 