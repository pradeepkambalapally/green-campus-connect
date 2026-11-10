import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Search,
  Filter,
  Flame,
  Sparkles,
  ArrowUp,
  RefreshCw,
  Users,
  Compass,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user: authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCampusXP: 0,
    averageXP: 0,
  });
  const [departments, setDepartments] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [viewScope, setViewScope] = useState('all'); // 'all', 'top10', 'top25'

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        limit: 100,
        search: searchQuery,
        department: selectedDept !== 'all' ? selectedDept : undefined,
      };
      const res = await leaderboardAPI.get(params);
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard || []);
        setCurrentUserRank(res.data.currentUserRank || null);
        setStats(
          res.data.stats || {
            totalStudents: 0,
            totalCampusXP: 0,
            averageXP: 0,
          }
        );
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  // Filter based on viewScope
  let displayedStudents = [...leaderboard];
  if (viewScope === 'top10') {
    displayedStudents = displayedStudents.slice(0, 10);
  } else if (viewScope === 'top25') {
    displayedStudents = displayedStudents.slice(0, 25);
  }

  // Top 3 Podium
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

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
          {/* Header Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  Campus-Wide Rankings
                </span>
                <span className="text-xs text-gray-500 font-medium">Updated in Real-Time</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                Sustainability Champions Leaderboard
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Compare verified green achievements across campus students. Rankings reflect approved actions, destination mastery, and quiz performance.
              </p>
            </div>

            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-800 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Leaderboard</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Campus Sustainability Aggregate Overview Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl border border-emerald-200 shrink-0">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Students</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl border border-amber-200 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Campus XP</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalCampusXP.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl border border-sky-200 shrink-0">
                <TrendingUp className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Average XP</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.averageXP.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl border border-purple-200 shrink-0">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Leader XP</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{top1 ? top1.xp.toLocaleString() : 0}</p>
              </div>
            </div>
          </div>

          {/* Logged-In Student's Personalized Ranking Banner */}
          {currentUserRank && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-forest-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex flex-col items-center justify-center shrink-0 backdrop-blur-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Rank</span>
                  <span className="text-2xl font-black text-white">#{currentUserRank.rank}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="font-bold text-white text-lg">Your Campus Standing</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-emerald-200">
                      Level {currentUserRank.level} • {currentUserRank.levelTitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                    You currently have <strong className="text-amber-300">{currentUserRank.xp.toLocaleString()} XP</strong> across verified sustainability activities.
                    {currentUserRank.rank === 1 ? (
                      <span className="text-amber-300 font-bold ml-1">👑 You are currently in 1st place! Keep inspiring the campus!</span>
                    ) : currentUserRank.xpToNextRank > 0 ? (
                      <span className="text-emerald-200 ml-1">
                        Only <strong className="text-amber-300 font-bold">{currentUserRank.xpToNextRank} XP</strong> needed to overtake rank #{currentUserRank.rank - 1}!
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/challenges"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Earn More XP</span>
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors"
                >
                  My Profile
                </Link>
              </div>
            </motion.div>
          )}

          {/* Top 3 Champions Gamified Podium */}
          {leaderboard.length >= 2 && !searchQuery && selectedDept === 'all' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-sm">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 mb-2">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  Top Environmental Champions
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">Honor Roll Podium</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-4">
                {/* 2nd Place Podium */}
                {top2 && (
                  <div className="order-2 md:order-1 flex flex-col items-center">
                    <div className="relative mb-3 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300 flex items-center justify-center text-3xl shadow-md mx-auto">
                        {top2.avatar && (top2.avatar.startsWith('http') || top2.avatar.startsWith('/uploads')) ? (
                          <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : top2.avatar ? (
                          <span>{top2.avatar}</span>
                        ) : (
                          <span className="font-bold text-slate-700 text-xl">{top2.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-600 text-white font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1">
                        🥈 2nd
                      </span>
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 text-center space-y-1 shadow-sm h-40 flex flex-col justify-center">
                      <p className="font-extrabold text-gray-900 text-sm truncate">{top2.name} {top2.isCurrentUser && '(You)'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{top2.department}</p>
                      <span className="inline-block px-2 py-0.5 bg-slate-200/80 text-slate-800 text-[10px] font-bold rounded-full">
                        Lvl {top2.level} • {top2.levelTitle}
                      </span>
                      <p className="text-base font-black text-emerald-800 mt-1">{top2.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                )}

                {/* 1st Place Champion (Elevated) */}
                {top1 && (
                  <div className="order-1 md:order-2 flex flex-col items-center -mt-6">
                    <div className="relative mb-3 text-center">
                      <div className="w-10 h-10 -top-6 left-1/2 -translate-x-1/2 absolute flex items-center justify-center">
                        <Crown className="w-8 h-8 text-amber-500 fill-amber-400 drop-shadow" />
                      </div>
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-xl mx-auto ring-4 ring-amber-400/20">
                        {top1.avatar && (top1.avatar.startsWith('http') || top1.avatar.startsWith('/uploads')) ? (
                          <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : top1.avatar ? (
                          <span>{top1.avatar}</span>
                        ) : (
                          <span className="font-bold text-amber-900 text-2xl">{top1.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-gray-900 font-black text-xs rounded-full shadow-md flex items-center gap-1">
                        🥇 1st Place
                      </span>
                    </div>

                    <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100/60 border border-amber-300 rounded-3xl p-5 text-center space-y-1 shadow-md h-48 flex flex-col justify-center">
                      <p className="font-black text-gray-900 text-base truncate">{top1.name} {top1.isCurrentUser && '(You)'}</p>
                      <p className="text-xs text-amber-800 truncate font-medium">{top1.department}</p>
                      <span className="inline-block px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[11px] font-extrabold rounded-full">
                        Lvl {top1.level} • {top1.levelTitle}
                      </span>
                      <p className="text-xl font-black text-emerald-900 mt-2">{top1.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                )}

                {/* 3rd Place Podium */}
                {top3 && (
                  <div className="order-3 flex flex-col items-center">
                    <div className="relative mb-3 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-600/40 flex items-center justify-center text-3xl shadow-md mx-auto">
                        {top3.avatar && (top3.avatar.startsWith('http') || top3.avatar.startsWith('/uploads')) ? (
                          <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : top3.avatar ? (
                          <span>{top3.avatar}</span>
                        ) : (
                          <span className="font-bold text-amber-800 text-xl">{top3.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-amber-700 text-white font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1">
                        🥉 3rd
                      </span>
                    </div>

                    <div className="w-full bg-orange-50/50 border border-orange-200/80 rounded-3xl p-4 text-center space-y-1 shadow-sm h-40 flex flex-col justify-center">
                      <p className="font-extrabold text-gray-900 text-sm truncate">{top3.name} {top3.isCurrentUser && '(You)'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{top3.department}</p>
                      <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-900 text-[10px] font-bold rounded-full">
                        Lvl {top3.level} • {top3.levelTitle}
                      </span>
                      <p className="text-base font-black text-emerald-800 mt-1">{top3.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-gray-900"
              />
            </form>

            {/* Department dropdown & View scope filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {departments.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View scope tabs */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                <button
                  onClick={() => setViewScope('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewScope === 'all' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  All ({leaderboard.length})
                </button>
                <button
                  onClick={() => setViewScope('top10')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewScope === 'top10' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setViewScope('top25')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    viewScope === 'top25' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-gray-900'
                  }`}
                >
                  Top 25
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-sm overflow-hidden">
            {loading && leaderboard.length === 0 ? (
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : displayedStudents.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                  🍃
                </div>
                <h4 className="font-bold text-gray-800 text-base">No Students Found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No students matching "${searchQuery}". Try clearing search filter.`
                    : 'Leaderboard is empty. Encourage students to register and complete sustainability tasks!'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      fetchLeaderboard();
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                      <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
                      <th className="py-3.5 px-4">Student Eco Champion</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">Academic Department</th>
                      <th className="py-3.5 px-4 hidden sm:table-cell">Level & Title</th>
                      <th className="py-3.5 px-4 hidden lg:table-cell text-center">Achievements</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Total XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {displayedStudents.map((student) => {
                      const isMe = student.isCurrentUser;

                      return (
                        <tr
                          key={student._id}
                          className={`transition-colors ${
                            isMe
                              ? 'bg-emerald-50/90 font-semibold border-l-4 border-l-emerald-600'
                              : 'hover:bg-gray-50/80'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            {student.rank === 1 ? (
                              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-black text-sm mx-auto shadow-sm">
                                🥇
                              </span>
                            ) : student.rank === 2 ? (
                              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center font-black text-sm mx-auto shadow-sm">
                                🥈
                              </span>
                            ) : student.rank === 3 ? (
                              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-900 border border-orange-300 flex items-center justify-center font-black text-sm mx-auto shadow-sm">
                                🥉
                              </span>
                            ) : (
                              <span className="font-extrabold text-gray-500 text-xs">
                                #{student.rank}
                              </span>
                            )}
                          </td>

                          {/* Student Info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0 overflow-hidden font-bold border border-emerald-200">
                                {student.avatar && (student.avatar.startsWith('http') || student.avatar.startsWith('/uploads')) ? (
                                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                ) : student.avatar ? (
                                  <span>{student.avatar}</span>
                                ) : (
                                  <span>{student.name.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 truncate">{student.name}</p>
                                  {isMe && (
                                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 md:hidden truncate">{student.department}</p>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 px-4 hidden md:table-cell text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{student.department}</span>
                            </div>
                          </td>

                          {/* Level & Title */}
                          <td className="py-4 px-4 hidden sm:table-cell">
                            <div className="flex flex-col">
                              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full self-start">
                                Level {student.level}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                                {student.levelTitle}
                              </span>
                            </div>
                          </td>

                          {/* Achievements */}
                          <td className="py-4 px-4 hidden lg:table-cell text-center">
                            <div className="inline-flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1" title="Completed destinations">
                                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                                {student.completedModulesCount}
                              </span>
                              <span className="flex items-center gap-1" title="Approved challenges">
                                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                                {student.approvedChallengesCount}
                              </span>
                              <span className="flex items-center gap-1" title="Daily streak">
                                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                {student.streak}
                              </span>
                            </div>
                          </td>

                          {/* XP */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <span className="font-black text-base text-emerald-800">
                              {student.xp.toLocaleString()}
                            </span>
                            <span className="text-xs text-emerald-600 font-bold ml-1">XP</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
