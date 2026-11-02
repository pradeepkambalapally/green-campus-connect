import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Compass,
  RefreshCw,
  AlertCircle,
  Map as MapIcon,
  ChevronRight,
  Star,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { modulesAPI } from '../services/api';
import DestinationDrawer from '../components/learning/DestinationDrawer';

// Coordinate positions on SVG canvas (viewBox 0 0 1000 680)
const DESTINATION_COORDS = {
  'Forest of Waste Wisdom': { x: 180, y: 530, color: '#059669', badgeColor: 'bg-emerald-600', icon: '🌲' },
  'Water World': { x: 380, y: 410, color: '#0284C7', badgeColor: 'bg-sky-600', icon: '💧' },
  'Energy Valley': { x: 620, y: 470, color: '#D97706', badgeColor: 'bg-amber-600', icon: '⚡' },
  'Green Mobility Trail': { x: 820, y: 310, color: '#7C3AED', badgeColor: 'bg-purple-600', icon: '🚲' },
  'Eco Living Island': { x: 500, y: 150, color: '#DB2777', badgeColor: 'bg-pink-600', icon: '🏡' },
};

const LearningMap = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hoveredDest, setHoveredDest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchModules = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await modulesAPI.getAll();
      if (res.data?.success) {
        setModules(res.data.modules || []);
      } else {
        setError('Failed to load learning destinations.');
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.response?.data?.message || 'Could not connect to the learning server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleDestinationClick = (mod) => {
    setSelectedDestination(mod);
    setIsDrawerOpen(true);
  };

  const completedCount = modules.filter(m => m.isCompleted).length;
  const totalCount = modules.length || 5;
  const totalLearningXP = modules.filter(m => m.isCompleted).reduce((sum, m) => sum + (m.xpReward || 100), 0);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-3xl mb-4 animate-bounce">
          🗺️
        </div>
        <h2 className="text-xl font-black text-emerald-950 mb-1">Mapping Sustainability Territory...</h2>
        <p className="text-sm text-gray-500">Preparing adventure trails and interactive destinations</p>
      </div>
    );
  }

  // Error State
  if (error && modules.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Map Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => fetchModules()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading Map</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Back link & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Return to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-emerald-950 flex items-center gap-2">
                <span>Learning Adventure Map</span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  5 Destinations
                </span>
              </h1>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Conquered counter */}
            <div className="hidden xs:flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <div className="text-right">
                <span className="text-xs font-black text-gray-800">
                  {completedCount} / {totalCount}
                </span>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Conquered</p>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>+{totalLearningXP} XP</span>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchModules(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 transition-colors"
              title="Refresh progression"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
            />
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner Announcement */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
              🧭
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Welcome to the Campus Sustainability Expedition!
              </h2>
              <p className="text-xs text-emerald-200">
                Click any unlocked destination along the trail to start reading lessons and complete quizzes.
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-300 shrink-0">
            {completedCount === totalCount ? '🎉 All Destinations Conquered!' : `Next Goal: Destination #${completedCount + 1}`}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CUSTOM ILLUSTRATED SVG ADVENTURE MAP                        */}
        {/* ============================================================ */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#e8f5e9] via-[#f1f8e9] to-[#fffde7] border-2 border-emerald-200/80 shadow-xl">
          <svg
            viewBox="0 0 1000 680"
            className="w-full h-auto select-none"
            style={{ minHeight: '440px' }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
              </linearGradient>

              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* BACKGROUND LANDSCAPE DETAILS */}
            {/* Rolling Background Hills */}
            <path
              d="M-50,220 Q200,100 450,200 T950,150 T1050,230 L1050,680 L-50,680 Z"
              fill="url(#hillsGrad)"
            />
            <path
              d="M-20,380 Q180,260 480,360 T980,300 L1020,680 L-20,680 Z"
              fill="#d1fae5"
              opacity="0.5"
            />

            {/* Winding Blue River */}
            <path
              d="M280,0 C320,120 420,180 370,290 C320,400 440,510 400,680"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="42"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* River Shimmer Line */}
            <path
              d="M280,0 C320,120 420,180 370,290 C320,400 440,510 400,680"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="18 14"
              opacity="0.7"
            />

            {/* Eco Living Island Water Halo (Destination 5) */}
            <ellipse cx="500" cy="150" rx="95" ry="60" fill="#bae6fd" opacity="0.6" />
            <ellipse cx="500" cy="150" rx="80" ry="48" fill="#dcfce7" stroke="#86efac" strokeWidth="3" />

            {/* Wooden Bridges across river */}
            <g transform="translate(365, 410) rotate(-20)">
              <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#b45309" opacity="0.8" />
              <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#fef3c7" strokeWidth="2" />
              <line x1="-16" y1="8" x2="16" y2="8" stroke="#fef3c7" strokeWidth="2" />
            </g>

            {/* Decorative Vegetation & Landmarks */}
            {/* Destination 1 Area: Forest clusters */}
            <g opacity="0.75">
              <text x="90" y="520" fontSize="28">🌲</text>
              <text x="130" y="580" fontSize="32">🌳</text>
              <text x="220" y="600" fontSize="26">🌲</text>
              <text x="70" y="610" fontSize="22">🌿</text>
              <text x="240" y="510" fontSize="20">🍄</text>
            </g>

            {/* Destination 2 Area: Water world waves & reeds */}
            <g opacity="0.75">
              <text x="320" y="470" fontSize="22">🌾</text>
              <text x="440" y="430" fontSize="20">💧</text>
              <text x="420" y="460" fontSize="18">🪷</text>
            </g>

            {/* Destination 3 Area: Energy valley solar rays & hills */}
            <g opacity="0.75">
              <text x="690" y="490" fontSize="26">☀️</text>
              <text x="570" y="540" fontSize="22">🌻</text>
              <text x="670" y="530" fontSize="20">⚡</text>
            </g>

            {/* Destination 4 Area: Green mobility trees & track */}
            <g opacity="0.75">
              <text x="760" y="360" fontSize="24">🌳</text>
              <text x="880" y="290" fontSize="22">🌲</text>
              <text x="860" y="370" fontSize="20">🚲</text>
            </g>

            {/* Destination 5 Area: Eco Living Island sanctuary */}
            <g opacity="0.8">
              <text x="450" y="145" fontSize="22">🌸</text>
              <text x="535" y="140" fontSize="22">🌺</text>
              <text x="500" y="110" fontSize="20">🦋</text>
            </g>

            {/* ======================================================= */}
            {/* WINDING ADVENTURE TRAIL CONNECTING DESTINATIONS          */}
            {/* 1(180,530) -> 2(380,410) -> 3(620,470) -> 4(820,310) -> 5(500,150) */}
            {/* ======================================================= */}
            {/* Trail shadow / base path */}
            <path
              d="M 180,530 C 260,540 280,450 380,410 C 470,380 520,520 620,470 C 710,430 740,360 820,310 C 890,260 700,160 500,150"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Active Golden Dotted Adventure Trail */}
            <path
              d="M 180,530 C 260,540 280,450 380,410 C 470,380 520,520 620,470 C 710,430 740,360 820,310 C 890,260 700,160 500,150"
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="14 10"
              className="animate-pulse"
            />

            {/* ======================================================= */}
            {/* DESTINATION NODES & INTERACTIVE PINS                    */}
            {/* ======================================================= */}
            {modules.map((mod, index) => {
              const coords = DESTINATION_COORDS[mod.destination] || { x: 200 + index * 150, y: 300, color: '#059669', icon: '🌿' };
              const { x, y, color, icon } = coords;
              const { isLocked, isCompleted, isAvailable } = mod;
              const isHovered = hoveredDest === mod._id;

              return (
                <g
                  key={mod._id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => handleDestinationClick(mod)}
                  onMouseEnter={() => setHoveredDest(mod._id)}
                  onMouseLeave={() => setHoveredDest(null)}
                  className="cursor-pointer group"
                  filter="url(#pinShadow)"
                >
                  {/* Floating Pulsating Ring for Currently Available Destination */}
                  {isAvailable && (
                    <circle
                      cx="0"
                      cy="0"
                      r="48"
                      fill={color}
                      opacity="0.25"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  {/* Completed Glow Effect */}
                  {isCompleted && (
                    <circle
                      cx="0"
                      cy="0"
                      r="44"
                      fill="#fef08a"
                      opacity="0.45"
                      filter="url(#glowEffect)"
                    />
                  )}

                  {/* Outer Ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered ? '40' : '36'}
                    fill={isLocked ? '#94a3b8' : isCompleted ? '#059669' : color}
                    stroke="#ffffff"
                    strokeWidth="5"
                    className="transition-all duration-300"
                  />

                  {/* Inner Node Background */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isHovered ? '32' : '28'}
                    fill={isLocked ? '#cbd5e1' : '#ffffff'}
                    className="transition-all duration-300"
                  />

                  {/* Icon */}
                  <text
                    x="0"
                    y="7"
                    textAnchor="middle"
                    fontSize={isHovered ? '28' : '24'}
                    className="select-none transition-all duration-200"
                    style={{ filter: isLocked ? 'grayscale(100%)' : 'none' }}
                  >
                    {icon}
                  </text>

                  {/* Status Indicator Badges */}
                  {isLocked && (
                    <g transform="translate(18, -18)">
                      <circle cx="0" cy="0" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">🔒</text>
                    </g>
                  )}

                  {isCompleted && (
                    <g transform="translate(18, -18)">
                      <circle cx="0" cy="0" r="13" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="13">⭐</text>
                    </g>
                  )}

                  {isAvailable && (
                    <g transform="translate(18, -18)">
                      <circle cx="0" cy="0" r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">▶</text>
                    </g>
                  )}

                  {/* Name Label Below Node */}
                  <g transform="translate(0, 52)">
                    <rect
                      x="-85"
                      y="-12"
                      width="170"
                      height="24"
                      rx="12"
                      fill={isLocked ? '#64748b' : '#064e3b'}
                      opacity={isHovered ? '1' : '0.9'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {mod.destination}
                    </text>
                  </g>

                  {/* XP Badge Pill */}
                  <g transform="translate(0, 78)">
                    <rect
                      x="-42"
                      y="-9"
                      width="84"
                      height="18"
                      rx="9"
                      fill={isCompleted ? '#dcfce7' : isAvailable ? '#fef3c7' : '#f1f5f9'}
                      stroke={isCompleted ? '#86efac' : isAvailable ? '#fde68a' : '#cbd5e1'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isCompleted ? '#166534' : isAvailable ? '#92400e' : '#64748b'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {isCompleted ? 'Completed' : `+${mod.xpReward || 100} XP`}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Quick Legend at bottom-right of map */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-emerald-100 shadow-md text-[11px] font-semibold text-gray-700 hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block animate-pulse" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* Quick Destination Cards (Accessible on mobile/tablet below the map) */}
        <div>
          <h3 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>Destinations Checklist ({completedCount} / {totalCount})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {modules.map((mod, idx) => {
              const { isLocked, isCompleted, isAvailable } = mod;
              const coords = DESTINATION_COORDS[mod.destination] || { icon: '🌿' };

              return (
                <motion.div
                  key={mod._id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleDestinationClick(mod)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                      : isAvailable
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/40 shadow-sm'
                      : 'bg-white border-gray-200/70 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{coords.icon}</span>
                      {isCompleted ? (
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : isLocked ? (
                        <span className="p-1 rounded-full bg-gray-100 text-gray-400">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Chapter {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
                      {mod.destination}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {mod.title}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100/80 flex items-center justify-between text-[11px] font-bold">
                    <span className={isCompleted ? 'text-emerald-700' : 'text-amber-700'}>
                      +{mod.xpReward || 100} XP
                    </span>
                    <span className="text-emerald-800 flex items-center">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Destination Details Drawer / Modal */}
      <DestinationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        destination={selectedDestination}
      />
    </div>
  );
};

export default LearningMap;
