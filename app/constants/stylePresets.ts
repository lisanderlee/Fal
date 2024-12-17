export interface StylePreset {
    id: string;
    name: string;
    prompt: string;
    icon?: string;
    isCustom?: boolean;
  }
  
  export const defaultStylePresets: StylePreset[] = [
    {
      id: 'realistic',
      name: 'Realistic',
      prompt: 'highly detailed, realistic, 4k, high resolution, professional photography',
      icon: '📸'
    },
    {
      id: 'anime',
      name: 'Anime',
      prompt: 'anime style, vibrant colors, Studio Ghibli inspired, detailed illustration',
      icon: '🎨'
    },
    {
      id: 'digital-art',
      name: 'Digital Art',
      prompt: 'digital art, highly detailed, vibrant colors, professional illustration',
      icon: '🖼️'
    },
    {
      id: 'oil-painting',
      name: 'Oil Painting',
      prompt: 'oil painting, masterpiece, detailed brushstrokes, artistic, professional',
      icon: '🎨'
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      prompt: 'watercolor painting, soft colors, artistic, flowing, professional',
      icon: '💧'
    },
    {
      id: '3d-render',
      name: '3D Render',
      prompt: '3D render, octane render, highly detailed, professional 3D modeling',
      icon: '💫'
    }
  ];