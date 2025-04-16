'use client';

import { useState } from 'react';
import Circle30Map from '../components/Circle30Map';
import Chat from '../components/Chat';
import type { MapVisualization } from '../types/responses';

export default function Home() {
  const [visualization, setVisualization] = useState<MapVisualization | undefined>(undefined);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full h-screen flex">
        {/* Left side: Map */}
        <div className="w-1/2 h-full">
          <Circle30Map visualization={visualization} />
        </div>
        
        {/* Right side: Chat */}
        <div className="w-1/2 h-full bg-gray-900">
          <Chat onVisualizationUpdate={setVisualization} />
        </div>
      </div>
    </main>
  );
}
