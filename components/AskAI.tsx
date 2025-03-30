'use client';

import { useState } from 'react';

export default function AskAI({ onQuery }: { onQuery: (query: string) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log('AskAI input submitted:', input);
      onQuery(input);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur p-4 rounded-2xl shadow-xl w-[90%] max-w-xl z-50">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI: e.g. Best spot for a bookstore in New York"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white text-black placeholder-gray-500 outline-none px-4 py-2 rounded-lg"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-indigo-500"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
