'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Spinner from './Spinner';
import { ImageSettings } from '../types/image';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  liked: boolean;
}

interface ImageGridProps {
  prompt: string;
  settings?: ImageSettings;
}

const STORAGE_KEY = 'flux-image-history';

export default function ImageGrid({ prompt, settings = {
  imageSize: "1024x1024",
  steps: 4,
  guidance: 7.5
} }: ImageGridProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem(STORAGE_KEY);
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Failed to load saved images:', error);
      }
    }
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save images:', error);
    }
  }, [images]);

  useEffect(() => {
    if (prompt && typeof prompt === 'string' && prompt.trim()) {
      generateImage(prompt);
    }
  }, [prompt]); // Only depend on prompt changes

  const generateImage = async (promptText: string) => {
    if (!promptText) return;
    
    try {
      setLoading(true);
      const randomSeed = Math.floor(Math.random() * 2147483647);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText,
          seed: randomSeed,
          ...settings
        }),
      });

      const data = await response.json();
      if (data.images?.[0]) {
        const newImage: GeneratedImage = {
          url: data.images[0].url,
          prompt: promptText,
          timestamp: Date.now(),
          liked: false
        };
        setImages(prev => [newImage, ...prev]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, liked: !img.liked } : img
    ));
  };

  const handleVary = async (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const randomSeed = Math.floor(Math.random() * 2147483647);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: image.prompt,
          seed: randomSeed,
          ...settings
        }),
      });

      const data = await response.json();
      if (data.images?.[0]) {
        const newImage: GeneratedImage = {
          url: data.images[0].url,
          prompt: image.prompt,
          timestamp: Date.now(),
          liked: false
        };
        setImages(prev => [newImage, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flux-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Clear history function
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your image history?')) {
      setImages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="p-4">
      {/* Clear History Button */}
      {images.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            Clear History
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mb-4">
          <Spinner />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image
              src={image.url}
              alt={image.prompt}
              fill
              className="object-cover"
            />
            {/* Overlay Container */}
            <div className="absolute inset-0 transition-all duration-200">
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(index, e);
                  }}
                  className={`p-2 rounded-full ${
                    image.liked ? 'bg-red-500' : 'bg-white/20 hover:bg-white/40'
                  } transition-colors`}
                  title="Like"
                >
                  {image.liked ? '❤️' : '🤍'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVary(image, e);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  title="Create Variation"
                >
                  🎲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(image, e);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  title="Download"
                >
                  ⬇️
                </button>
              </div>

              {/* Hover Overlay */}
              <div 
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-opacity"
                onClick={() => setSelectedImage(image)}
              />

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="truncate">{image.prompt}</p>
                <p className="text-xs opacity-75">
                  {new Date(image.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-[80vw] h-[80vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.prompt}
                fill
                sizes="80vw"
                priority
                className="object-contain"
                quality={100}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
                <p className="text-lg">{selectedImage.prompt}</p>
                <p className="text-sm opacity-75">
                  {new Date(selectedImage.timestamp).toLocaleString()}
                </p>
              </div>
              <button 
                className="absolute top-4 right-4 text-white text-xl p-2 hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}