'use client';

interface ImageSettings {
  imageSize: "1024x1024" | "1280x720" | "720x1280" | "1280x1280";
  steps: number;
  guidance: number;
}

interface ImageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ImageSettings;
  onSave: (settings: ImageSettings) => void;
}

export default function ImageSettingsModal({ isOpen, onClose, settings, onSave }: ImageSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Image Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image Size</label>
            <select
              value={settings.imageSize}
              onChange={(e) => onSave({ ...settings, imageSize: e.target.value as ImageSettings['imageSize'] })}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="1024x1024">Square (1024x1024)</option>
              <option value="1280x720">Landscape (1280x720)</option>
              <option value="720x1280">Portrait (720x1280)</option>
              <option value="1280x1280">Large Square (1280x1280)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Steps: {settings.steps}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={settings.steps}
              onChange={(e) => onSave({ ...settings, steps: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Guidance Scale: {settings.guidance}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={settings.guidance}
              onChange={(e) => onSave({ ...settings, guidance: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}