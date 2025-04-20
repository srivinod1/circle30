'use client';

import Circle30Map from '@/components/Circle30Map';
import AskAI from '@/components/AskAI';
import { useState } from 'react';
import { ParsedAIResponse } from '@/types/responses';

export default function Home() {
  const [response, setResponse] = useState<ParsedAIResponse | undefined>();

  const handleResponse = (newResponse: ParsedAIResponse) => {
    console.log('Received response:', newResponse);
    setResponse(newResponse);
  };

  return (
    <main className="h-screen flex flex-col bg-[#0F172A] text-[#E2E8F0] font-sans relative overflow-hidden">
      <header className="p-4 border-b border-[#1E293B] text-xl font-bold z-50 bg-[#0F172A]">
        US EV CHARGING STATIONS
      </header>

      <div className="flex-1 relative">
        <Circle30Map geojsonData={response?.geojson} />
        <AskAI onResponse={handleResponse} />
      </div>
    </main>
  );
}
