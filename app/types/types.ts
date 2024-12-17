export interface GeneratedImage {
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