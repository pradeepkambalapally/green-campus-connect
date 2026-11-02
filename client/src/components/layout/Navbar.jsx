import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Menu, X, LogIn, UserPlus, ChevronRight
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-emerald-900 leading-tight">
                Green Campus
              </h1>
              <p className="text-xs text-emerald-600 -mt-1">Connect</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-emerald-700 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-emerald-700 transition-colors text-sm font-medium">
              How It Works
            </a>
            <a href="#topics" className="text-gray-600 hover:text-emerald-700 transition-colors text-sm font-medium">
              Topics
            </a>
            <a href="#impact" className="text-gray-600 hover:text-emerald-700 transition-colors text-sm font-medium">
              Impact
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-emerald-200"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-gray-600 hover:text-emerald-700 font-medium">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-emerald-700 font-medium">How It Works</a>
              <a href="#topics" className="block py-2 text-gray-600 hover:text-emerald-700 font-medium">Topics</a>
              <a href="#impact" className="block py-2 text-gray-600 hover:text-emerald-700 font-medium">Impact</a>
              <hr className="border-gray-100" />
              <Link to="/login" className="block py-2 text-emerald-700 font-medium">Log In</Link>
              <Link
                to="/register"
                className="block py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-medium text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
