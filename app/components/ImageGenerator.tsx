'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Spinner from './Spinner';
import { defaultStylePresets, StylePreset } from '../constants/stylePresets';
import StyleEditor from './StyleEditor';
import PromptAssistant from './PromptAssistant';

interface ImageResponse {
  url: string;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  settings: {
    imageSize: string;
    steps: number;
    guidance: number;
  };
}

type ImageSize = "1024x1024" | "1280x720" | "720x1280" | "1280x1280";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<ImageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>("1024x1024");
  const [steps, setSteps] = useState(4);
  const [guidance, setGuidance] = useState(7.5);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editingStyle, setEditingStyle] = useState<StylePreset | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('imageHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const savedStyles = localStorage.getItem('customStyles');
    const customStyles = savedStyles ? JSON.parse(savedStyles) : [];
    setStyles([...defaultStylePresets, ...customStyles]);
  }, []);

  const generateImage = async () => {
    if (!prompt) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          imageSize,
          steps,
          guidance
        }),
      });

      const data = await response.json();
      if (data.images?.[0]) {
        const newImage = data.images[0];
        setImageUrl(newImage);

        const historyItem: GeneratedImage = {
          id: Date.now().toString(),
          prompt,
          imageUrl: newImage.url,
          timestamp: Date.now(),
          settings: {
            imageSize,
            steps,
            guidance
          }
        };

        setHistory(prev => [historyItem, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: GeneratedImage) => {
    setPrompt(item.prompt);
    setImageSize(item.settings.imageSize as ImageSize);
    setSteps(item.settings.steps);
    setGuidance(item.settings.guidance);
  };

  const handleSaveStyle = (style: StylePreset) => {
    const newStyles = editingStyle
      ? styles.map(s => s.id === style.id ? style : s)
      : [...styles, style];
    
    setStyles(newStyles);
    
    const customStyles = newStyles.filter(s => s.isCustom);
    localStorage.setItem('customStyles', JSON.stringify(customStyles));
    
    setShowStyleEditor(false);
    setEditingStyle(null);
  };

  const handleDeleteStyle = (style: StylePreset) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      const newStyles = styles.filter(s => s.id !== style.id);
      setStyles(newStyles);
      
      const customStyles = newStyles.filter(s => s.isCustom);
      localStorage.setItem('customStyles', JSON.stringify(customStyles));
      
      if (editingStyle?.id === style.id) {
        setEditingStyle(null);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-4">
      <PromptAssistant onSelectPrompt={setPrompt} />

      {/* Image and History Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Current Generation</h2>
          <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl.url}
                alt="Generated image"
                fill
                unoptimized
                className="object-contain rounded-lg transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Your image will appear here
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">History</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No history yet. Generate some images!
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={item.imageUrl}
                      alt={item.prompt}
                      fill
                      unoptimized
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-sm truncate">{item.prompt}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full space-y-4">
        {/* Prompt Input and Generate Button */}
        <div className="flex gap-4">
          <textarea
            className="flex-1 p-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your image prompt..."
          />
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || loading}
            className={`px-6 py-2 h-fit rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              !prompt.trim() || loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-foreground text-background hover:opacity-90'
            }`}
          >
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
            )}
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Generation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg dark:border-gray-700">
          <div className="space-y-2">
            <label className="text-sm block">Image Size:</label>
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="1024x1024">Square (1024x1024)</option>
              <option value="1280x720">Landscape (1280x720)</option>
              <option value="720x1280">Portrait (720x1280)</option>
              <option value="1280x1280">Large Square (1280x1280)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm block">Steps: {steps}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm block">Guidance Scale: {guidance}</label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={guidance}
              onChange={(e) => setGuidance(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Style Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {styles.map((style) => (
            <div key={style.id} className="flex items-center">
              <button
                onClick={() => setSelectedStyle(selectedStyle?.id === style.id ? null : style)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1.5 transition-all
                  ${selectedStyle?.id === style.id 
                    ? 'bg-foreground text-background' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {style.icon && <span>{style.icon}</span>}
                {style.name}
              </button>
              {style.isCustom && (
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => {
                      setEditingStyle(style);
                      setShowStyleEditor(true);
                    }}
                    className="p-1 text-xs hover:text-blue-500"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteStyle(style)}
                    className="p-1 text-xs hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowStyleEditor(true)}
            className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5"
          >
            ➕ Add Style
          </button>
        </div>

        {showStyleEditor && (
          <StyleEditor
            onSave={handleSaveStyle}
            onClose={() => {
              setShowStyleEditor(false);
              setEditingStyle(null);
            }}
            editingStyle={editingStyle || undefined}
          />
        )}
      </div>
    </div>
  );
}