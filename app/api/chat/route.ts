import { NextResponse } from 'next/server';
import type { ChatResponse } from '@/types/responses';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    console.log('Received message:', message);

    // For testing, return a mock response first
    const mockResponse: ChatResponse = {
      message: "This is a test response. Your message was: " + message,
      visualization: {
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-97.7431, 30.2672] // Austin, TX
            },
            properties: {
              title: "Test Location",
              data: {
                "Info": "Test point in Austin"
              },
              style: {
                color: "#4F46E5"
              }
            }
          }
        ],
        config: {
          fitBounds: true
        }
      }
    };

    return NextResponse.json(mockResponse);

    /* Uncomment this when your backend is ready
    const response = await fetch('http://localhost:5002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    */

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        message: 'Sorry, there was an error processing your request.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 