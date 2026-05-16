import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { EmotionPicker } from './components/EmotionPicker';
import { DestinationCard } from './components/DestinationCard';
import { OnboardingFlow } from './components/OnboardingFlow';
import { SuggestionPage } from './components/SuggestionPage';
import { DetailsPage } from './components/DetailsPage';
import { destinations, emotions } from './data';
import { EmotionType } from './types';
import { ChevronRight, ArrowRight, Search } from 'lucide-react';

type ViewType = 'landing' | 'onboarding' | 'suggestions' | 'details';

export default function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Peaceful');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredDestinations = destinations.filter(d => d.emotion === selectedEmotion);
  const currentEmotion = emotions.find(e => e.type === selectedEmotion);

  const handleOnboardingComplete = async (payload: any) => {
    console.log('Final Preference Payload:', payload);
    setIsLoading(true);
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname.startsWith('192.168.') || 
                   window.location.hostname.startsWith('10.');
    const API_BASE = import.meta.env.VITE_API_URL || (isLocal ? `http://${window.location.hostname}:8000` : '');
    try {
      const response = await fetch(`${API_BASE}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setRecommendations(data.recommendations);
      setView('suggestions');
    } catch (error: any) {
      console.error('API Error:', error);
      alert(`Backend connection failed: ${error.message || 'Unknown error'}. Ensure the FastAPI server is running on ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`);
      setView('landing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-8 shadow-[0_0_30px_rgba(210,187,255,0.3)]"
        />
        <h2 className="text-2xl font-display font-bold mb-2">Curating Your Narrative</h2>
        <p className="text-on-surface/50 font-bold uppercase tracking-[0.2em] text-[10px]">Analyzing coordinates & mood matrix</p>
      </div>
    );
  }

  if (view === 'onboarding') {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete} 
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'suggestions') {
    return (
      <SuggestionPage 
        recommendations={recommendations} 
        onBack={() => setView('onboarding')}
        onSelect={(place) => {
          setSelectedPlaceId(place.id);
          setView('details');
        }}
      />
    );
  }

  if (view === 'details' && selectedPlaceId) {
    return (
      <DetailsPage 
        placeId={selectedPlaceId} 
        onBack={() => setView('suggestions')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop">
          
          {/* Hero Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                   <h2 className="text-on-surface/50 text-sm font-bold uppercase tracking-[0.3em] mb-4">
                    The Lila Experience
                  </h2>
                  <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.1] mb-8">
                    How are you <br />
                    <span className="text-primary italic">feeling</span> today?
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <EmotionPicker 
                    selectedEmotion={selectedEmotion} 
                    onSelect={(type) => setSelectedEmotion(type as EmotionType)} 
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedEmotion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mt-12 max-w-md"
                  >
                    <p className="text-on-surface/70 text-lg leading-relaxed mb-6">
                      {currentEmotion?.description}. Discover destinations that resonate with your inner state.
                    </p>
                    <button 
                      onClick={() => setView('onboarding')}
                      className="flex items-center gap-3 bg-primary text-background px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(210,187,255,0.4)] transition-all"
                    >
                      Plan my voyage <ArrowRight size={18} />
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative hidden md:block">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedEmotion}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="aspect-[4/5] rounded-[3rem] overflow-hidden"
                  >
                    <img 
                      src={filteredDestinations[0]?.imageUrl} 
                      alt={filteredDestinations[0]?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </motion.div>
                </AnimatePresence>
                
                {/* Floating UI element */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-10 glass-panel p-6 rounded-2xl max-w-[240px]"
                >
                  <div className="flex gap-2 mb-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-on-surface/80">
                    Join 1,200+ other {selectedEmotion.toLowerCase()} travelers this month.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Featured Destinations */}
          <section id="featured-destinations">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest mb-2 block">Curation</span>
                <h2 className="font-display font-bold text-4xl">Featured Experiences</h2>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-on-surface/60 hover:text-primary transition-colors">
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest, idx) => (
                <DestinationCard key={dest.id} destination={dest} index={idx} />
              ))}
            </div>
          </section>

          {/* Social Proof / Quote */}
          <section className="mt-32 py-20 border-y border-white/5 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-3xl md:text-4xl font-display italic text-on-surface/80 leading-snug mb-8">
                "Travel is not just for the eyes, but for the soul. Lila helped me find exactly what I didn't know I was looking for."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container" />
                <div className="text-left">
                  <p className="font-bold">Elena Vance</p>
                  <p className="text-xs text-on-surface/50">Lila Voyager since 2023</p>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around md:hidden z-50">
          <button id="nav-home" className="flex flex-col items-center gap-1 text-primary">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </button>
          <button id="nav-explore" className="flex flex-col items-center gap-1 text-on-surface/40">
             <Search size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
          </button>
          <button id="nav-trips" className="flex flex-col items-center gap-1 text-on-surface/40">
             <ChevronRight size={20} className="rotate-90" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Trips</span>
          </button>
      </div>
    </div>
  );
}
