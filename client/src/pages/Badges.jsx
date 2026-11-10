import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Compass,
  Trophy,
  Flame,
  Star,
  ExternalLink,
  ChevronRight,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const CATEGORIES = [
  { key: 'all', label: 'All Badges' },
  { key: 'learning', label: 'Learning Adventures', icon: '🗺️' },
  { key: 'challenges', label: 'Campus Challenges', icon: '📸' },
  { key: 'streaks', label: 'Streaks & Milestones', icon: '🔥' },
  { key: 'unlocked', label: 'Unlocked ✨' },
  { key: 'locked', label: 'In Progress 🔒' },
];

const Badges = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
    progressPercent: 0,
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersAPI.getBadges();
      if (res.data?.success) {
        setBadges(res.data.badges || []);
        setStats(
          res.data.stats || {
            total: res.data.badges?.length || 0,
            unlocked: res.data.badges?.filter((b) => b.isUnlocked).length || 0,
            locked: 0,
            progressPercent: 0,
          }
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load badges data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  // Filtered badges
  const filteredBadges = badges.filter((b) => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(q);
      const matchDesc = b.description?.toLowerCase().includes(q);
      const matchCriteria = b.criteria?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCriteria) return false;
    }

    // Category match
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unlocked') return b.isUnlocked;
    if (activeCategory === 'locked') return !b.isUnlocked;
    if (activeCategory === 'learning') return b.category === 'Learning Adventures';
    if (activeCategory === 'challenges') return b.category === 'Campus Challenges';
    if (activeCategory === 'streaks') {
      return b.category === 'Streaks & Consistency' || b.category === 'Milestones';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-cream flex">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Campus Accolades & Credentials
                </span>
                <span className="text-xs text-gray-500 font-medium">Verified Achievements</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                Sustainability Accolades Showcase
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Earn verified digital accolades by conquering learning destinations, completing real-world challenges, and maintaining active eco habits.
              </p>
            </div>

            <button
              onClick={fetchBadges}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-800 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Badges</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Gamified Hero Progress Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-1/4 w-60 h-60 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold rounded-full backdrop-blur-sm">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  Official Academic Distinction
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {stats.unlocked} of {stats.total} Accolades Unlocked
                </h2>
                <p className="text-sm text-emerald-100/90 max-w-xl">
                  Every badge is tied directly to your authentic MongoDB learning records and admin-verified campus evidence submissions.
                </p>

                {/* Progress bar */}
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between items-center text-xs text-emerald-200 mb-1.5 font-semibold">
                    <span>Overall Collection Progress</span>
                    <span>{stats.progressPercent}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Trophy Stat Medallion */}
              <div className="shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                  🏅
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Earned Badges</p>
                  <p className="text-3xl font-black text-white">{stats.unlocked}</p>
                  <p className="text-xs text-amber-300 font-semibold">{stats.locked} Remaining</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Navigation */}
          <div className="bg-white rounded-2xl p-3 border border-emerald-100/80 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accolade name, skill, or requirement..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                let count = 0;
                if (cat.key === 'all') count = badges.length;
                else if (cat.key === 'unlocked') count = stats.unlocked;
                else if (cat.key === 'locked') count = stats.locked;
                else if (cat.key === 'learning')
                  count = badges.filter((b) => b.category === 'Learning Adventures').length;
                else if (cat.key === 'challenges')
                  count = badges.filter((b) => b.category === 'Campus Challenges').length;
                else if (cat.key === 'streaks')
                  count = badges.filter(
                    (b) => b.category === 'Streaks & Consistency' || b.category === 'Milestones'
                  ).length;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && badges.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-56 bg-white/70 rounded-3xl border border-gray-100" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredBadges.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 shadow-sm max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto border border-amber-200">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Accolades Found</h3>
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? `No accolades matching "${searchQuery}". Try a different keyword.`
                  : 'No accolades available in this category yet.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Badges Grid */}
          {!loading && filteredBadges.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBadges.map((b) => {
                const isUnlocked = b.isUnlocked;

                return (
                  <motion.div
                    key={b._id}
                    layout
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedBadge(b)}
                    className={`cursor-pointer rounded-3xl p-5 border transition-all relative flex flex-col justify-between overflow-hidden ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-white via-white to-emerald-50/50 border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300'
                        : 'bg-white/80 border-gray-200/70 opacity-80 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    {/* Top status indicator badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {b.category}
                      </span>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Earned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          <Lock className="w-3 h-3 text-gray-400" />
                          Locked
                        </span>
                      )}
                    </div>

                    {/* Badge Icon & Content */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border shadow-sm transition-transform group-hover:scale-105 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-emerald-100 to-amber-100/60 border-emerald-200 text-emerald-950 shadow-emerald-500/10'
                            : 'bg-gray-100 border-gray-200 text-gray-400 grayscale'
                        }`}
                      >
                        {b.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className={`font-bold text-base leading-snug ${isUnlocked ? 'text-gray-900' : 'text-gray-700'}`}>
                          {b.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </div>

                    {/* Criteria & Action Footer */}
                    <div className="pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center justify-between text-gray-500">
                        <span className="truncate pr-2 font-medium text-[11px]">
                          {isUnlocked && b.earnedAt ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Unlocked on {new Date(b.earnedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-gray-400 line-clamp-1">Criteria: {b.criteria}</span>
                          )}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Prompt to engage in learning & challenges */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-emerald-600/20">
                🌱
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">Want to unlock more sustainability accolades?</h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Conquer uncompleted destinations on the Learning Map or participate in campus challenges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/learning-map"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Explore Learning Map
              </Link>
              <Link
                to="/challenges"
                className="px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                View Challenges
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Badge Detail Inspection Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-5 text-center relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>

              {/* Badge Icon Medallion */}
              <div
                className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl border-2 shadow-xl ${
                  selectedBadge.isUnlocked
                    ? 'bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-200 border-amber-300 text-emerald-900 shadow-amber-500/20'
                    : 'bg-gray-100 border-gray-300 text-gray-400 grayscale'
                }`}
              >
                {selectedBadge.icon}
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {selectedBadge.category}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">{selectedBadge.name}</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">{selectedBadge.description}</p>
              </div>

              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border text-xs text-left space-y-2 ${
                  selectedBadge.isUnlocked
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Status:</span>
                  <span className={selectedBadge.isUnlocked ? 'text-emerald-700' : 'text-gray-500'}>
                    {selectedBadge.isUnlocked ? '✨ Earned and Verified' : '🔒 Locked Milestone'}
                  </span>
                </div>

                {selectedBadge.isUnlocked && selectedBadge.earnedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Unlocked At:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedBadge.earnedAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-100">
                  <span className="font-semibold block text-gray-600 mb-1">Academic Requirement:</span>
                  <p className="text-gray-800 font-medium">{selectedBadge.criteria}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {!selectedBadge.isUnlocked && (
                  <Link
                    to={selectedBadge.criteriaType === 'challenge_complete' ? '/challenges' : '/learning-map'}
                    onClick={() => setSelectedBadge(null)}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Start Working on Milestone
                  </Link>
                )}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Badges;
