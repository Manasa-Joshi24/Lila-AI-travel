export interface Destination {
  id: string;
  name: string;
  location: string;
  emotion: string;
  imageUrl: string;
  description: string;
  rating: number;
  tags: string[];
}

export type EmotionType = 'Peaceful' | 'Aventurous' | 'Romantic' | 'Solitary' | 'Spiritual';

export interface Emotion {
  type: EmotionType;
  label: string;
  description: string;
  color: string;
}
