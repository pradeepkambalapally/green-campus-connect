import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Search,
  Filter,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  FolderCheck,
  Send,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { challengesAPI } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ChallengeDetails from '../components/challenges/ChallengeDetails';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { key: 'all', label: 'All Categories' },
  { key: 'waste', label: 'Waste Management', icon: '♻️' },
  { key: 'water', label: 'Water Conservation', icon: '💧' },
  { key: 'energy', label: 'Energy Conservation', icon: '⚡' },
  { key: 'mobility', label: 'Sustainable Transit', icon: '🚲' },
  { key: 'lifestyle', label: 'Responsible Living', icon: '🌱' },
];

const DIFFICULTIES = [
  { key: 'all', label: 'All Levels' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

const STATUSES = [
  { key: 'all', label: 'All Missions' },
  { key: 'joined', label: 'Joined' },
  { key: 'pending', label: 'In Review' },
  { key: 'approved', label: 'Completed' },
  { key: 'not_joined', label: 'Not Joined' },
];

const CATEGORY_STYLES = {
  waste: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  water: 'bg-sky-100 text-sky-800 border-sky-200',
  energy: 'bg-amber-100 text-amber-800 border-amber-200',
  mobility: 'bg-purple-100 text-purple-800 border-purple-200',
  lifestyle: 'bg-rose-100 text-rose-800 border-rose-200',
};

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer modal state
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchChallenges = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await challengesAPI.getAll({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        status: selectedStatus,
        search: searchTerm,
      });

      if (res.data?.success) {
        setChallenges(res.data.challenges || []);
      } else {
        setError('Failed to retrieve challenges.');
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err.response?.data?.message || 'Could not connect to challenges service.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchTerm]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleOpenDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setIsDetailsOpen(true);
  };

  const handleJoinChallenge = async (id) => {
    try {
      const res = await challengesAPI.join(id);
      if (res.data?.success) {
        // Refresh local challenge state
        fetchChallenges(true);
        if (selectedChallenge && selectedChallenge._id === id) {
          setSelectedChallenge(prev => ({
            ...prev,
            hasJoined: true,
            participantsCount: (prev.participantsCount || 0) + 1,
          }));
        }
      }
    } catch (err) {
      console.error('Join error:', err);
      alert(err.response?.data?.message || 'Error joining challenge.');
    }
  };

  const handleSubmissionSuccess = (newSubmission) => {
    fetchChallenges(true);
    if (selectedChallenge) {
      setSelectedChallenge(prev => ({
        ...prev,
        submissionStatus: newSubmission.status,
        submission: newSubmission,
      }));
    }
  };

  // Stats calculation
  const joinedCount = challenges.filter(c => c.hasJoined).length;
  const approvedCount = challenges.filter(c => c.submissionStatus === 'approved').length;
  const inReviewCount = challenges.filter(c => c.submissionStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-cream bg-nature-pattern flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          profile={{ name: user?.name, xp: user?.xp, level: user?.level }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Hero Banner */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-emerald-800 to-forest text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-World Campus Action</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Sustainability Challenges Hub
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 leading-relaxed">
                Take practical eco-action across campus. Complete missions, upload photo proof, and earn verified XP after administrative verification.
              </p>
            </div>

            {/* Quick Stats & Action Link */}
            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                <span className="text-xl sm:text-2xl font-black text-white">{joinedCount}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">Joined</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                <span className="text-xl sm:text-2xl font-black text-amber-300">{inReviewCount}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">In Review</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[90px]">
                <span className="text-xl sm:text-2xl font-black text-emerald-300">{approvedCount}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">Approved</span>
              </div>

              <Link
                to="/my-submissions"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <FolderCheck className="w-4 h-4" />
                <span>My Submissions</span>
              </Link>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-4">
            {/* Search Input & Status Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search challenges by keyword..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {STATUSES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setSelectedStatus(st.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedStatus === st.key
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills & Difficulty Selector */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-3 border-t border-gray-100">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-emerald-900 text-white shadow-2xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Difficulty Dropdown */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Difficulty:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff.key} value={diff.key}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/70 border border-emerald-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-8 rounded-3xl bg-white border border-red-100 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Failed to Load Challenges</h3>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={() => fetchChallenges()}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && challenges.length === 0 && (
            <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-emerald-200 p-8 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-base font-bold text-gray-800">No matching challenges found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Try selecting a different category or clearing search filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Challenges Grid */}
          {!loading && !error && challenges.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((ch) => {
                const categoryStyle = CATEGORY_STYLES[ch.category] || CATEGORY_STYLES.waste;
                const diffStyle = DIFFICULTY_STYLES[ch.difficulty] || DIFFICULTY_STYLES.easy;

                const formattedDate = ch.endDate
                  ? new Date(ch.endDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Open';

                return (
                  <motion.div
                    key={ch._id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl p-6 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Header: Icon & Category Badges */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          {ch.icon || '🌱'}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${categoryStyle}`}>
                            {ch.category}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffStyle}`}>
                            {ch.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1.5">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {ch.description}
                      </p>

                      {/* Info Badges (Deadline & Reward) */}
                      <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs mb-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Deadline: <strong>{formattedDate}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-700 font-extrabold">
                          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>+{ch.rewardXP} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Status & Action Button */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        {ch.submissionStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        ) : ch.submissionStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            In Review
                          </span>
                        ) : ch.submissionStatus === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Resubmit
                          </span>
                        ) : ch.hasJoined ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            Ready to Submit
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {ch.participantsCount} enrolled
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenDetails(ch)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          ch.hasJoined
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span>
                          {ch.submissionStatus === 'rejected'
                            ? 'Resubmit'
                            : ch.hasJoined
                            ? 'Submit Evidence'
                            : 'View & Join'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Challenge Details & Evidence Submission Drawer */}
      <ChallengeDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        challenge={selectedChallenge}
        onJoin={handleJoinChallenge}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    </div>
  );
};

export default Challenges;
