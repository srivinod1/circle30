import { NextResponse } from 'next/server';
import type { AIResponse } from '@/types/responses';

const BACKEND_URL = process.env.BACKEND_URL || 'https://web-production-5f9ea.up.railway.app';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, user_id = 'default' } = body;

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'orchestrator.chat',
        params: { message, user_id },
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || data.error);
    }

    // Transform the JSON-RPC response to match the expected format
    const transformedData: AIResponse = {
      text: data.result?.response || data.result?.text || '',
      geojson: data.result?.geojson || null,
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 