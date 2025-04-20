'use client';

import Circle30Map from '@/components/Circle30Map';
import AskAI from '@/components/AskAI';

export default function Home() {
  const handleQuery = (query: string) => {
    console.log('User asked:', query);
    // We don't need to do anything here anymore since the AskAI component
    // handles the API call directly
  };

  return (
    <main className="h-screen flex flex-col bg-[#0F172A] text-[#E2E8F0] font-sans relative overflow-hidden">
      <header className="p-4 border-b border-[#1E293B] text-xl font-bold z-50 bg-[#0F172A]">
        Circle30
      </header>

      <div className="flex-1 relative">
        <Circle30Map />
        <AskAI onQuery={handleQuery} />
      </div>
    </main>
  );
}
