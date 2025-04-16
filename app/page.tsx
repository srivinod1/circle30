'use client';

import { useState, useEffect } from 'react';
import Circle30Map from '@/components/Circle30Map';
import AskAI from '@/components/AskAI';
import type { Visualization } from '../types/responses';
import Chat from '@/components/Chat';

export default function Home() {
  const [currentVisualizations, setCurrentVisualizations] = useState<Visualization[]>([]);

  useEffect(() => {
    console.log('TomTom API Key status:', process.env.NEXT_PUBLIC_TOMTOM_API_KEY ? 'Present' : 'Missing');
  }, []);

  const handleVisualizationUpdate = (visualizations: Visualization[]) => {
    setCurrentVisualizations(visualizations);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full h-screen flex">
        {/* Left side: Map */}
        <div className="w-1/2 h-full">
          <Circle30Map />
        </div>
        
        {/* Right side: Chat */}
        <div className="w-1/2 h-full bg-gray-900">
          <Chat />
        </div>
      </div>
    </main>
  );
}
