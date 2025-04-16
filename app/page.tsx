'use client';

import { useState, useEffect } from 'react';
import Circle30Map from '@/components/Circle30Map';
import AskAI from '@/components/AskAI';
import type { Visualization } from '../types/responses';

export default function Home() {
  const [currentVisualizations, setCurrentVisualizations] = useState<Visualization[]>([]);

  useEffect(() => {
    console.log('TomTom API Key status:', process.env.NEXT_PUBLIC_TOMTOM_API_KEY ? 'Present' : 'Missing');
  }, []);

  const handleVisualizationUpdate = (visualizations: Visualization[]) => {
    setCurrentVisualizations(visualizations);
  };

  return (
    <main className="min-h-screen bg-[#0F172A] text-[#E2E8F0] font-sans relative">
      <header className="p-4 border-b border-[#1E293B] text-xl font-bold z-50 relative bg-[#0F172A]">
        Circle30
      </header>

      {currentVisualizations.map((viz, index) => {
        if (viz.type === 'map') {
          return <Circle30Map key={index} visualization={viz.data} />;
        }
        return null;
      })}
      
      <AskAI onVisualizationUpdate={handleVisualizationUpdate} />
    </main>
  );
}
