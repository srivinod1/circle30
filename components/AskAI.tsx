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
        console.log('Sending request to AI agent...');
        const payload = {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        };
        console.log('Request payload:', payload);

        const res = await fetch('https://7b10-2001-1c00-be00-d800-857-13fc-190d-f516.ngrok-free.app/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('AI agent error response:', {
            status: res.status,
            statusText: res.statusText,
            body: errorText
          });
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('AI agent response:', data);

        if (!data.response) {
          throw new Error('Invalid response format from AI agent');
        }

        const assistantMessage: Message = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        onQuery(input);
      } catch (error) {
        console.error('Detailed error:', error);
        let errorMessage = 'Sorry, there was an error processing your request.';
        
        if (error instanceof Error) {
          errorMessage += ` (${error.message})`;
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: errorMessage
        }]);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };

  return (
    <div className="fixed right-6 top-[20vh] bottom-[20vh] bg-white/10 backdrop-blur p-4 rounded-2xl shadow-xl w-[400px] max-w-[90%] z-50 flex flex-col">
      {/* Chat header */}
      <div className="mb-4 pb-3 border-b border-white/20">
        <h3 className="text-lg font-semibold">EV Assistant</h3>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm italic p-3">
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
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-auto border-t border-white/20 pt-4">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Ask about EV charging access..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white/5 text-white placeholder-gray-400 outline-none px-4 py-2 rounded-lg border border-white/10 focus:border-indigo-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`w-full bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Ask AI'}
          </button>
        </div>
      </form>
    </div>
  );
}
