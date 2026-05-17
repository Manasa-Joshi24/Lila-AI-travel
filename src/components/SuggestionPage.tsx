import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Wind, Sparkles, ArrowLeft, Thermometer, Droplets, ChevronRight } from 'lucide-react';

interface SuggestionPageProps {
  recommendations: any[];
  onBack: () => void;
  onSelect: (place: any) => void;
}

const ImageWithSkeleton = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  
  const fallbackSrc = "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=1600";

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 z-0 bg-white/5 animate-pulse" />
      )}
      <img 
        src={error ? fallbackSrc : src} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
          } else {
            setLoaded(true); // Even fallback failed, just show it and stop pulsing
          }
        }}
        className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
};

export const SuggestionPage: React.FC<SuggestionPageProps> = ({ recommendations, onBack, onSelect }) => {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-on-surface/60 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> Modify Preferences
          </button>
          <div className="text-left md:text-right">
            <h1 className="text-3xl md:text-5xl font-display font-bold">Your Curated Narrative</h1>
            <p className="text-sm md:text-base text-on-surface/50 mt-2">Discovering the scenes that resonate with your journey.</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <motion.button
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelect(rec)}
                className="group relative flex flex-col h-full bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(210,187,255,0.1)]"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithSkeleton src={rec.image_url} alt={rec.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  
                  {/* Score Badge */}
                  <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-background/80 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-primary font-bold text-lg">{rec.score}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Match</span>
                  </div>

                  {/* Weather Overlay */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-3 glass-panel px-3 py-1.5 rounded-full border-white/10">
                    <div className="flex items-center gap-1 text-xs font-bold">
                        <Thermometer size={12} className="text-orange-400" />
                        {rec.weather?.temp ?? '--'}°C
                    </div>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <div className="flex items-center gap-1 text-xs font-bold">
                        <Wind size={12} className="text-blue-400" />
                        {rec.weather?.condition ?? 'Loading...'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-8 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                      {rec.budget_level || 'Moderate'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star size={12} fill="currentColor" /> {rec.rating}
                    </div>
                  </div>

                  <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{rec.name}</h3>
                  <p className="text-on-surface/60 text-sm leading-relaxed mb-6 line-clamp-3">
                    {rec.summary}
                  </p>

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(rec.tags || []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-on-surface/40">#{tag}</span>
                        ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-on-surface/50">
                          <MapPin size={14} />
                          <span className="text-xs font-medium">
                            {rec.distance_km !== null && rec.distance_km !== undefined
                              ? `${rec.distance_km}km away`
                              : 'Distance unavailable'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary">
                          Details <ChevronRight size={14} />
                        </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Sparkles className="mx-auto mb-4 text-primary/20" size={48} />
              <p className="text-on-surface/50 font-bold uppercase tracking-widest text-sm">No scenes found matching your frequency.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
