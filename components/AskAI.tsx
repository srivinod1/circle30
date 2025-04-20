'use client';

import { useState, useEffect, useRef } from 'react';
import { AIResponse, ParsedAIResponse } from '@/types/responses';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

interface AskAIProps {
  onResponse: (response: ParsedAIResponse) => void;
}

export default function AskAI({ onResponse }: AskAIProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages or typingMessage changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      try {
        const res = await fetch(`${BACKEND_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input })
        });
        const data = await res.json();
        console.log('Raw backend response:', {
          hasGeojson: !!data.geojson,
          geojsonType: typeof data.geojson,
          hasText: !!data.text,
          textStructure: data.text
        });
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Parse GeoJSON string into object if it's a string
        const parsedData: ParsedAIResponse = {
          text: data.text,
          geojson: typeof data.geojson === 'string' ? JSON.parse(data.geojson) : data.geojson
        };

        console.log('Parsed response:', {
          text: parsedData.text,
          geojson: {
            type: parsedData.geojson?.type,
            featureCount: parsedData.geojson?.features?.length,
            firstFeature: parsedData.geojson?.features?.[0]
          }
        });

        onResponse(parsedData);
        
        setIsTyping(true);
        setTypingMessage('');
        
        // Format the text for display
        const formattedText = formatAnalysisText(parsedData.text);
        typeAssistantMessage(formattedText, () => {
          setIsTyping(false);
          setTypingMessage(null);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: formattedText }
          ]);
        });
      } catch (error) {
        let errorMessage = 'Sorry, there was an error processing your request.';
        if (error instanceof Error) {
          errorMessage += ` (${error.message})`;
        }
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: errorMessage }
        ]);
        setIsTyping(false);
        setTypingMessage(null);
      } finally {
        setIsLoading(false);
        setInput('');
      }
    }
  };

  // Typewriter effect function
  function typeAssistantMessage(fullText: string, onDone: () => void) {
    let i = 0;
    function type() {
      setTypingMessage(fullText.slice(0, i + 1));
      if (i < fullText.length - 1) {
        i++;
        setTimeout(type, 15); // Adjust speed here (ms per character)
      } else {
        onDone();
      }
    }
    type();
  }

  return (
    <div className="fixed right-6 top-[10vh] bottom-[10vh] bg-gray-800 p-4 rounded-2xl shadow-xl w-[400px] max-w-[90%] z-50 flex flex-col text-white">
      {/* Chat header */}
      <div className="mb-4 pb-3 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-white">EV Analyst Powered by TomTom Orbis</h3>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && !typingMessage ? (
          <div className="text-gray-400 text-sm italic p-3">
            Ask about EV charging access, underserved ZIP codes, and more...
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-gray-700 ml-4'
                    : 'bg-gray-600 mr-4'
                }`}
                style={message.role === 'assistant' ? { whiteSpace: 'pre-line' } : {}}
              >
                {message.content}
              </div>
            ))}
            {isTyping && typingMessage !== null && (
              <div
                className="p-3 rounded-lg text-sm bg-gray-600 mr-4"
                style={{ whiteSpace: 'pre-line' }}
              >
                {typingMessage}
                <span className="animate-pulse">|</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-auto border-t border-gray-600 pt-4">
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Ask about EV charging access..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 outline-none px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 transition-colors resize-none"
            disabled={isLoading || isTyping}
            rows={2}
            style={{ minHeight: '40px', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
          />
          <button
            type="submit"
            className={`w-full bg-[#FF0000] text-white font-medium px-4 py-2 rounded-xl hover:bg-[#CC0000] transition-colors ${
              isLoading || isTyping ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || isTyping}
          >
            {isLoading || isTyping ? 'Processing...' : 'Ask AI'}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatAnalysisText(textData: ParsedAIResponse['text']): string {
  if (!textData) {
    return 'No analysis data available.';
  }

  let formattedText = `${textData.title}\n\n`;

  if (!textData.zipCodes || !Array.isArray(textData.zipCodes)) {
    return 'No ZIP code data available.';
  }

  textData.zipCodes.forEach((zipData, index) => {
    formattedText += `${index + 1}. ZIP code ${zipData.zipCode}\n`;
    formattedText += `   - Population: ${zipData.population}\n`;
    formattedText += `   - EV Charging Stations: ${zipData.evCount}\n`;
    formattedText += `   - EV Count per Capita: ${zipData.evCountPerCapita}\n\n`;
  });

  formattedText += 'Analysis:\n';
  formattedText += textData.analysis || 'No analysis available.';

  return formattedText;
}
