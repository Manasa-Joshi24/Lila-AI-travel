import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Users, User, Heart, UserGroup, Clock, Calendar, Sun, Landmark, Compass, Wallet, MapPin, Sparkles, Coffee, CloudRain, Users2, Moon, Utensils } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const STEPS = [
  { id: 'who', title: 'Who are you traveling with?', subtitle: 'Select your companions to help us curate the perfect cinematic journey tailored to your dynamic.' },
  { id: 'time', title: 'How much time do you have?', subtitle: 'Define your temporal boundaries. Every moment is a scene waiting to unfold.' },
  { id: 'vibe', title: 'Design your narrative.', subtitle: 'Select the cinematic undertones that define your ideal journey. Mix and match to curate a uniquely personalized exploration matrix.' },
  { id: 'budget', title: 'What is your investment?', subtitle: 'Select the scale of your production. From indie adventures to blockbuster luxury.' },
  { id: 'range', title: 'How far do you want to go?', subtitle: 'Define your boundaries. Let us curate the perfect escape within your preferred radius.' },
];

const EXTRAS = [
  { id: 'night', label: 'Night Owl', icon: <Moon size={14} /> },
  { id: 'day', label: 'Day Time', icon: <Sun size={14} /> },
  { id: 'outdoor', label: 'Outdoor Focus', icon: <Compass size={14} /> },
  { id: 'indoor', label: 'Indoor Haven', icon: <Coffee size={14} /> },
  { id: 'food', label: 'Foodie Focused', icon: <Utensils size={14} /> },
  { id: 'rain', label: 'Rain-friendly', icon: <CloudRain size={14} /> },
  { id: 'crowd', label: 'Low Crowds', icon: <Users2 size={14} /> },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    who: '',
    time: '',
    vibes: [] as string[],
    budget: '',
    range: '',
    extras: [] as string[],
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(selections);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const toggleSelection = (key: keyof typeof selections, value: string, multi = false) => {
    setSelections(prev => {
      if (!multi) {
        return { ...prev, [key]: value };
      }
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Who
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'Solo', icon: <User />, img: '/assets/solo.png' },
              { id: 'Couple', icon: <Heart />, img: '/assets/couple.png' },
              { id: 'Friends', icon: <Users />, img: '/assets/friends.png' },
              { id: 'Family', icon: <Users />, img: '/assets/family.png' },
            ].map(item => (
              <SelectionCard
                key={item.id}
                label={item.id}
                icon={item.icon}
                image={item.img}
                selected={selections.who === item.id}
                onClick={() => toggleSelection('who', item.id)}
              />
            ))}
          </div>
        );
      case 1: // Time
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'Few Hours', desc: 'Quick layovers or a brief urban escape.', icon: <Clock />, img: '/assets/hours.png' },
              { id: 'One Day', desc: 'From sunrise to sunset, full immersion.', icon: <Sun />, img: '/assets/day.png' },
              { id: 'Few Days', desc: 'A perfect, unhurried weekend getaway.', icon: <Calendar />, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800' },
              { id: 'One Week', desc: 'A deep dive into the heart of a destination.', icon: <Compass />, img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800' },
            ].map(item => (
              <SelectionCard
                key={item.id}
                label={item.id}
                description={item.desc}
                icon={item.icon}
                image={item.img}
                selected={selections.time === item.id}
                onClick={() => toggleSelection('time', item.id)}
              />
            ))}
          </div>
        );
      case 2: // Vibe
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'Romantic', 'Adventure', 'Thriller', 'Chill', 'Relaxation', 
              'Educational', 'Nature', 'Fun', 'Luxury', 'Spiritual'
            ].map((vibe, idx) => (
              <VibeCard
                key={vibe}
                label={vibe}
                index={idx}
                selected={selections.vibes.includes(vibe)}
                onClick={() => toggleSelection('vibes', vibe, true)}
              />
            ))}
          </div>
        );
      case 3: // Budget
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'Budget', desc: 'Minimalist & authentic.', icon: <Wallet />, img: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&q=80&w=800' },
              { id: 'Moderate', desc: 'Balanced comfort & style.', icon: <Sparkles />, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
              { id: 'Premium', desc: 'Exquisite & high-end luxury.', icon: <Landmark />, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800' },
            ].map(item => (
              <SelectionCard
                key={item.id}
                label={item.id}
                description={item.desc}
                icon={item.icon}
                image={item.img}
                selected={selections.budget === item.id}
                onClick={() => toggleSelection('budget', item.id)}
              />
            ))}
          </div>
        );
      case 4: // Range
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'Local BLR', desc: 'Stay close. Discover hidden city sanctuaries.', icon: <MapPin />, img: 'https://images.unsplash.com/photo-1599939571322-792a326991f2?auto=format&fit=crop&q=80&w=800' },
              { id: 'Places in Karnataka', desc: 'A short drive away. Discover the heart of our state.', icon: <Compass />, img: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800' },
              { id: 'Anywhere India', desc: 'No limits. Board a flight and lose yourself.', icon: <Sparkles />, img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800' },
            ].map(item => (
              <SelectionCard
                key={item.id}
                label={item.id}
                description={item.desc}
                icon={item.icon}
                image={item.img}
                selected={selections.range === item.id}
                onClick={() => toggleSelection('range', item.id)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return !!selections.who;
      case 1: return !!selections.time;
      case 2: return selections.vibes.length > 0;
      case 3: return !!selections.budget;
      case 4: return !!selections.range;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Header with Progress */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={prevStep}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface/50">
              Step {currentStep + 1} of 5
            </span>
            <div className="flex gap-1.5">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentStep ? 'w-8 bg-primary' : idx < currentStep ? 'w-4 bg-primary/40' : 'w-4 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface/50">
            {STEPS[currentStep].id.charAt(0).toUpperCase() + STEPS[currentStep].id.slice(1)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-12">
                <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4">
                  {STEPS[currentStep].title}
                </h1>
                <p className="text-lg text-on-surface/60 max-w-2xl">
                  {STEPS[currentStep].subtitle}
                </p>
              </div>

              {renderStepContent()}

              {/* Optional Extras - Only show on relevant steps or all? */}
              <div className="mt-16 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Fine-tune the vibe <span className="text-on-surface/40 font-normal">(Optional)</span></h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {EXTRAS.map(extra => (
                    <button
                      key={extra.id}
                      onClick={() => toggleSelection('extras', extra.id, true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                        selections.extras.includes(extra.id)
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-white/10 text-on-surface/60 hover:border-white/30'
                      }`}
                    >
                      {extra.icon}
                      {extra.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors"
          >
            Cancel Journey
          </button>

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
              isStepValid()
                ? 'bg-primary text-background shadow-[0_0_30px_rgba(210,187,255,0.3)] hover:shadow-[0_0_40px_rgba(210,187,255,0.5)]'
                : 'bg-white/5 text-on-surface/20 cursor-not-allowed'
            }`}
          >
            {currentStep === STEPS.length - 1 ? 'Find My Escape' : `Continue to Step ${currentStep + 2}`}
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
};

const SelectionCard = ({ label, description, icon, image, selected, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative group overflow-hidden rounded-[2.5rem] aspect-[4/3] md:aspect-auto md:h-72 border transition-all duration-700 text-left backdrop-blur-sm ${
      selected ? 'border-primary/50 bg-primary/5 shadow-[0_0_50px_rgba(210,187,255,0.15)]' : 'border-white/10 bg-white/5 hover:border-white/30'
    }`}
  >
    <img src={image} alt={label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-50" />
    <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent transition-opacity duration-700 ${selected ? 'opacity-95' : 'opacity-80 group-hover:opacity-90'}`} />
    
    <div className="absolute inset-0 p-8 flex flex-col justify-end">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-display font-bold tracking-tight">{label}</h3>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-700 ${
          selected ? 'bg-primary border-primary text-background shadow-[0_0_20px_rgba(210,187,255,0.6)]' : 'bg-white/5 border-white/10 text-on-surface/40 group-hover:border-white/30'
        }`}>
          {selected ? <Check size={20} strokeWidth={3} /> : icon}
        </div>
      </div>
      {description && (
        <p className={`text-sm leading-relaxed transition-colors duration-500 max-w-[90%] ${selected ? 'text-on-surface/90' : 'text-on-surface/50'}`}>
          {description}
        </p>
      )}
    </div>

    {/* Glassmorphism Highlight */}
    <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${selected ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 border-2 border-primary/20 rounded-[2.5rem] blur-[2px]" />
       <div className="absolute inset-[1px] border border-white/20 rounded-[2.5rem]" />
    </div>
  </motion.button>
);

const VibeCard = ({ label, selected, onClick, index }: any) => {
  const vibeStyles: Record<string, string> = {
    'Romantic': 'from-rose-500/50 to-purple-600/50',
    'Adventure': 'from-orange-500/50 to-amber-600/50',
    'Thriller': 'from-slate-700/70 to-slate-900/70',
    'Chill': 'from-cyan-400/50 to-blue-600/50',
    'Relaxation': 'from-emerald-400/50 to-teal-600/50',
    'Educational': 'from-amber-400/50 to-yellow-600/50',
    'Nature': 'from-green-500/50 to-emerald-700/50',
    'Fun': 'from-pink-400/50 to-rose-600/50',
    'Luxury': 'from-indigo-500/50 to-violet-700/50',
    'Spiritual': 'from-violet-400/50 to-fuchsia-700/50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative h-44 rounded-[2rem] overflow-hidden border transition-all duration-700 group backdrop-blur-md ${
        selected ? 'border-primary ring-2 ring-primary/30 shadow-[0_0_30px_rgba(210,187,255,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/30'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${vibeStyles[label] || 'from-white/10 to-white/5'} opacity-40 group-hover:opacity-60 transition-opacity duration-700`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <span className={`text-sm font-bold uppercase tracking-[0.2em] transition-all duration-700 ${selected ? 'text-white scale-110' : 'text-on-surface/80 group-hover:text-on-surface'}`}>
          {label}
        </span>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="mt-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background shadow-lg"
          >
            <Check size={16} strokeWidth={3} />
          </motion.div>
        )}
      </div>
      
      {/* Selection Glow */}
      {selected && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
      )}
    </motion.button>
  );
};
