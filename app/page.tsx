'use client';

import Circle30Map from '@/components/Circle30Map';
import AskAI from '@/components/AskAI';
import { useState } from 'react';
import { MapVisualization } from '@/types/responses';

export default function Home() {
  const [currentVisualization, setCurrentVisualization] = useState<MapVisualization | undefined>();

  const handleQuery = (query: string) => {
    console.log('User asked:', query);
  };

  const handleVisualizationUpdate = (visualization: MapVisualization) => {
    console.log('Received visualization data:', visualization);
    setCurrentVisualization(visualization);
  };

  return (
    <main className="h-screen flex flex-col bg-[#0F172A] text-[#E2E8F0] font-sans relative overflow-hidden">
      <header className="p-4 border-b border-[#1E293B] text-xl font-bold z-50 bg-[#0F172A]">
        Circle30
      </header>

      <div className="flex-1 relative">
        <Circle30Map visualization={currentVisualization} />
        <AskAI 
          onQuery={handleQuery} 
          onVisualizationUpdate={handleVisualizationUpdate}
        />
      </div>
    </main>
  );
}
