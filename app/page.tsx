'use client';
import { useState } from 'react';
import Chat from "./components/Chat";
import ImageGrid from "./components/ImageGrid";
import { ImageSettings } from './types/image';
import CreditUsage from './components/CreditUsage';

export default function Home() {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [settings, setSettings] = useState<ImageSettings>({
    imageSize: "1024x1024",
    steps: 4,
    guidance: 7.5
  });

  const handlePromptSelect = (prompt: string) => {
    // Extract the final prompt if it contains the marker
    const finalPrompt = prompt.includes('Final prompt:') 
      ? prompt.split('Final prompt:')[1].trim()
      : prompt;
    setSelectedPrompt(finalPrompt);
  };

  return (
    <div className="h-screen relative">
      <CreditUsage />
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        <div className="h-screen overflow-y-auto border-r dark:border-gray-700">
          <Chat 
            onPromptSelect={handlePromptSelect} 
            onSettingsChange={setSettings}
          />
        </div>
        <div className="h-screen overflow-y-auto">
          <ImageGrid 
            prompt={selectedPrompt} 
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}