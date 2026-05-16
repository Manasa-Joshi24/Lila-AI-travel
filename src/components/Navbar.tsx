import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-container-padding-mobile md:px-container-padding-desktop py-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <div className="w-3 h-3 bg-background rounded-full" />
        </div>
        <span className="font-display font-bold text-xl tracking-wider text-on-surface">LILA</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:flex items-center gap-10 text-sm font-medium text-on-surface/70"
      >
        <a href="#" className="hover:text-primary transition-colors">Destinations</a>
        <a href="#" className="hover:text-primary transition-colors">Journeys</a>
        <a href="#" className="hover:text-primary transition-colors">Reviews</a>
        <a href="#" className="hover:text-primary transition-colors">Stories</a>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <button id="search-btn" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Search size={20} />
        </button>
        <button id="profile-btn" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <User size={20} />
        </button>
        <button id="menu-btn" className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
          <Menu size={20} />
        </button>
      </motion.div>
    </nav>
  );
};
