'use client';

import { useState } from 'react';
import { StylePreset } from '../constants/stylePresets';

interface StyleEditorProps {
  onSave: (style: StylePreset) => void;
  onClose: () => void;
  editingStyle?: StylePreset;
}

export default function StyleEditor({ onSave, onClose, editingStyle }: StyleEditorProps) {
  const [name, setName] = useState(editingStyle?.name || '');
  const [prompt, setPrompt] = useState(editingStyle?.prompt || '');
  const [icon, setIcon] = useState(editingStyle?.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingStyle?.id || `custom-${Date.now()}`,
      name,
      prompt,
      icon,
      isCustom: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
        <h2 className="text-xl font-bold mb-4">
          {editingStyle ? 'Edit Style' : 'Create Custom Style'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Style Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., My Custom Style"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Style Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter the style prompt modifiers..."
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., 🎨"
              maxLength={2}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90"
            >
              Save Style
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}