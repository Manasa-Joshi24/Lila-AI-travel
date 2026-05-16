import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, Star, Clock, Sparkles, Navigation, Globe, Phone, ExternalLink, Thermometer, Droplets, Wind, Hotel, Info } from 'lucide-react';

interface DetailsPageProps {
  placeId: string;
  onBack: () => void;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({ placeId, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/place/${placeId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-on-surface/50 font-bold uppercase tracking-widest text-xs">Developing the Scene...</p>
      </div>
    );
  }

  if (!data || !data.name) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface/50 uppercase tracking-widest font-bold">Error loading scene...</div>;

  const place = data;
  const { nearby_hotels: hotels, weather, nearby_places: places, things_to_carry, travel_tips, ai_summary } = data;

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      {/* Hero Header */}
      <div className="relative h-[65vh] overflow-hidden">
        <img 
          src={place.image_url || 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07'} 
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 z-50 pt-12 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-background/80 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.location?.lat ?? 0},${place.location?.lng ?? 0}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-primary text-background px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              <Navigation size={16} /> Get Directions
            </a>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-12 left-6 right-6">
          <div className="max-w-7xl mx-auto">
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
             >
                <div className="flex items-center gap-3 mb-4">
                   <span className="px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest">
                     {place.budget?.level || 'Moderate'}
                   </span>
                   <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400 glass-panel px-3 py-1 rounded-full border-white/10">
                     <Star size={16} fill="currentColor" /> {place.rating}
                   </div>
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-bold leading-tight mb-4">{place.name}</h1>
                <div className="flex items-center gap-6 text-on-surface/70">
                   <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      <span className="text-lg">{place.location?.address ?? 'Bengaluru, India'}</span>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">The Narrative</h2>
              <p className="text-xl md:text-3xl text-on-surface/90 leading-relaxed font-light italic mb-8">
                "{ai_summary || place.description}"
              </p>
              <p className="text-on-surface/60 leading-relaxed">
                {place.long_description || place.description}
              </p>
            </section>

            <section>
               <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-8">Atmosphere & Highlights</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {place.highlights?.map((hl: string) => (
                    <div key={hl} className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col gap-4">
                       <Sparkles size={20} className="text-primary" />
                       <span className="text-sm font-bold leading-snug">{hl}</span>
                    </div>
                  ))}
               </div>
            </section>

            <section>
               <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-8">Essentials to Carry</h2>
               <div className="flex flex-wrap gap-4">
                  {things_to_carry?.map((item: string) => (
                    <div key={item} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       {item}
                    </div>
                  ))}
               </div>
            </section>

            {hotels && hotels.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-8">Nearby Stays</h2>
                <div className="space-y-4">
                    {hotels.map((hotel: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                              <Hotel size={24} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold">{hotel.name}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                                  <Star size={12} fill="currentColor" /> {hotel.rating}
                                </div>
                                <span className="text-[10px] text-on-surface/40">• {hotel.distance}</span>
                              </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary mb-1">{hotel.price || 'Check Rates'}</p>
                            <a href={hotel.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 hover:text-on-surface">View Details</a>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <section>
               <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-8">Nearby Explorations</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {places?.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-on-surface/40">{p.type}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Weather Widget */}
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-white/10 to-transparent">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Wind size={14} className="text-primary" /> Local Climate
               </h3>
               <div className="flex items-center justify-between mb-8">
                  <div className="text-5xl font-display font-bold">{weather?.temp ?? '--'}°C</div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{weather?.condition ?? 'Loading...'}</div>
                    <div className="text-xs text-on-surface/50">{(weather?.rain_probability ?? 0) > 30 ? 'High' : 'Low'} Rain Chance</div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl text-center">
                     <Droplets size={16} className="mx-auto mb-2 text-blue-400" />
                     <div className="text-xs font-bold">{weather?.humidity ?? '--'}%</div>
                     <div className="text-[8px] uppercase tracking-tighter opacity-40">Humidity</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl text-center">
                     <Thermometer size={16} className="mx-auto mb-2 text-orange-400" />
                     <div className="text-xs font-bold">{weather?.feels_like ?? '--'}°C</div>
                     <div className="text-[8px] uppercase tracking-tighter opacity-40">Feels Like</div>
                  </div>
               </div>
            </div>

            {/* Practical Info */}
            <div className="space-y-8 glass-panel p-8 rounded-[2.5rem] border-white/10">
               <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Traveler's Intel</h4>
                  <div className="space-y-4">
                     {travel_tips?.map((tip: string, idx: number) => (
                       <div key={idx} className="flex gap-3">
                          <Info size={14} className="text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-on-surface/70 leading-relaxed">{tip}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5">
                 <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">Opening Hours</p>
                      <p className="text-sm font-medium">{place.timings?.hours ?? '9:00 AM - 6:00 PM'}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface/40 mb-1">Best Visit Time</p>
                      <p className="text-sm font-medium">{place.best_time_to_visit}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Map Placeholder */}
            <div className="aspect-square rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden relative group">
               <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD3o2dvWk3IFZlFsx8yPJvBPTstMhK2y5E&q=${place.location?.lat ?? 0},${place.location?.lng ?? 0}&zoom=15`}
               ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
