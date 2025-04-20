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
    <main className="min-h-screen bg-[#0F172A] text-[#E2E8F0] font-sans relative">
      <header className="p-4 border-b border-[#1E293B] text-xl font-bold z-50 relative bg-[#0F172A]">
        Circle30
      </header>

      <Circle30Map />
      <AskAI onQuery={handleQuery} />
    </main>
  );
}
