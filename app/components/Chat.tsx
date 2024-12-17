'use client';

import { useState } from 'react';
import ImageSettingsModal from './ImageSettings';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ImageSettings {
  imageSize: "1024x1024" | "1280x720" | "720x1280" | "1280x1280";
  steps: number;
  guidance: number;
}

export default function Chat({ onPromptSelect, onSettingsChange }: { 
  onPromptSelect: (prompt: string) => void;
  onSettingsChange?: (settings: ImageSettings) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hi! I\'m FLUX Prompt Pro. I can help you create precise prompts for image generation. What would you like to create?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ImageSettings>({
    imageSize: "1024x1024",
    steps: 4,
    guidance: 7.5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/prompt-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant' as const, content: data.prompt };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: ImageSettings) => {
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">🤖</span>
          FLUX Prompt Pro
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {message.role === 'assistant' ? (
                <>
                  {message.content.split('Final prompt:').map((part, partIndex) => {
                    if (partIndex === 0 && !message.content.startsWith('Final prompt:')) {
                      return <p key={partIndex} className="whitespace-pre-wrap">{part}</p>;
                    }
                    if (part.trim()) {
                      return (
                        <div key={partIndex} className="mt-2">
                          <p className="font-bold">Final prompt:</p>
                          <p className="whitespace-pre-wrap">{part.trim()}</p>
                          <button
                            onClick={() => onPromptSelect(part.trim())}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
                          >
                            Use this prompt →
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="flex-1 p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            ⚙️
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-6 rounded-xl ${
              loading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </form>

      <ImageSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsChange}
      />
    </div>
  );
}