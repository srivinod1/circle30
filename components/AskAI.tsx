'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskAI({ onQuery }: { onQuery: (query: string) => void }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      // Add user message to the conversation
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // Call the AI agent API
        const res = await fetch('https://7b10-2001-1c00-be00-d800-857-13fc-190d-f516.ngrok-free.app/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to get response from AI');
        }

        const data = await res.json();
        const assistantMessage: Message = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        onQuery(input);
      } catch (error) {
        console.error('Error calling AI agent:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, there was an error processing your request.' 
        }]);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };

  return (
    <div className="fixed right-6 bottom-6 bg-white/10 backdrop-blur p-4 rounded-2xl shadow-xl w-[400px] max-w-[90%] z-50 max-h-[80vh] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm italic">
            Ask about EV charging access, underserved ZIP codes, and more...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-indigo-600/20 ml-4'
                  : 'bg-white/5 mr-4'
              }`}
            >
              {message.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-white/5 p-3 rounded-lg text-sm animate-pulse mr-4">
            Thinking...
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-auto">
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
