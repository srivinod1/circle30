'use client';

import { useState } from 'react';

export default function AskAI({ onQuery }: { onQuery: (query: string) => void }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      try {
        // Call the AI agent API
        const res = await fetch('https://7b10-2001-1c00-be00-d800-857-13fc-190d-f516.ngrok-free.app/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        });
        
        const data = await res.json();
        setResponse(data.response);
        onQuery(input); // Keep the original callback
      } catch (error) {
        console.error('Error calling AI agent:', error);
        setResponse('Sorry, there was an error processing your request.');
      } finally {
        setIsLoading(false);
      }
      setInput('');
    }
  };

  return (
    <div className="fixed right-6 bottom-6 bg-white/10 backdrop-blur p-4 rounded-2xl shadow-xl w-[400px] max-w-[90%] z-50">
      {response && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg text-sm">
          {response}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Ask about EV charging access..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white text-black placeholder-gray-500 outline-none px-4 py-2 rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Ask AI'}
        </button>
      </form>
    </div>
  );
}
