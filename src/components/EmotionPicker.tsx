import React from 'react';
import { motion } from 'motion/react';
import { Emotion } from '../types';
import { emotions } from '../data';

interface EmotionPickerProps {
  selectedEmotion: string;
  onSelect: (type: string) => void;
}

export const EmotionPicker: React.FC<EmotionPickerProps> = ({ selectedEmotion, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
      {emotions.map((emotion) => (
        <motion.button
          key={emotion.type}
          id={`emotion-${emotion.type.toLowerCase()}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(emotion.type)}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
            selectedEmotion === emotion.type
              ? 'bg-primary text-background border-primary shadow-[0_0_20px_rgba(210,187,255,0.4)]'
              : 'bg-white/5 text-on-surface/60 border-white/10 hover:border-white/30'
          }`}
        >
          {emotion.label}
        </motion.button>
      ))}
    </div>
  );
};
