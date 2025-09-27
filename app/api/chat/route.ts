import { NextResponse } from 'next/server';
import type { AIResponse } from '@/types/responses';

const BACKEND_URL = 'https://web-production-5f9ea.up.railway.app';

export async function POST(request: Request) {
  try {
    console.log('API route called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const message = body.message || 'Hello';
    const user_id = body.user_id || 'default';

    console.log('Making request to:', BACKEND_URL);
    const requestPayload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'orchestrator.chat',
      params: { message, user_id },
    };
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    if (data.error) {
      throw new Error(data.error.message || data.error);
    }

    // Transform the JSON-RPC response to match the expected format
    const transformedData: AIResponse = {
      text: data.result?.response || data.result?.text || '',
      geojson: data.result?.geojson || null,
    };

    console.log('Transformed data:', transformedData);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 