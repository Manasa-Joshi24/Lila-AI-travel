import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Star } from 'lucide-react';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, index }) => {
  return (
    <motion.div
      id={`destination-${destination.id}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-[2rem] aspect-[3/4] cursor-pointer"
    >
      <img
        src={destination.imageUrl}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <motion.div 
          className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
              {destination.emotion}
            </span>
          </div>
          
          <h3 className="font-display font-bold text-2xl text-on-surface mb-1 drop-shadow-lg">
            {destination.name}
          </h3>
          
          <div className="flex items-center gap-1 text-on-surface/60 text-sm mb-4">
            <MapPin size={14} />
            <span>{destination.location}</span>
          </div>

          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-1">
               <Star size={14} className="text-primary fill-primary" />
               <span className="text-sm font-medium">{destination.rating}</span>
             </div>
             <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
               Explore
             </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
