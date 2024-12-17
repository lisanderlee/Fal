'use client';

import { useState } from 'react';
import Spinner from './Spinner';

interface PromptAssistantProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function PromptAssistant({ onSelectPrompt }: PromptAssistantProps) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePrompt = async () => {
    if (!userInput.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/prompt-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await response.json();
      if (data.prompt) {
        onSelectPrompt(data.prompt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Describe what you want to create..."
        className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
      />
      <button
        onClick={generatePrompt}
        disabled={loading || !userInput.trim()}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
          loading || !userInput.trim() 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? <Spinner /> : '🤖'} Enhance
      </button>
    </div>
  );
}