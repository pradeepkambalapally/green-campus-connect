import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Medal, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const getInitials = (name = '') => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const RANK_BADGES = {
  1: { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Crown, label: '1st' },
  2: { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: Medal, label: '2nd' },
  3: { bg: 'bg-amber-50 text-amber-900 border-amber-200', icon: Medal, label: '3rd' },
};

const LeaderboardPreview = ({ leaderboardData, currentUserId }) => {
  const topStudents = leaderboardData?.topStudents || [];
  const userRank = leaderboardData?.userRank ?? '-';
  const totalStudents = leaderboardData?.totalStudents ?? 0;

  const isUserInTop5 = topStudents.some((s) => s._id?.toString() === currentUserId?.toString());

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Campus Leaderboard</h3>
            <p className="text-xs text-gray-500">Top sustainability champions</p>
          </div>
        </div>

        <Link
          to="/leaderboard"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <span>Full Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top 5 List */}
      {topStudents.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-cream border border-dashed border-emerald-200/80 px-4">
          <p className="text-xs text-gray-500">Be the first to join the leaderboard by taking a quiz!</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {topStudents.slice(0, 5).map((student, idx) => {
            const rank = idx + 1;
            const isCurrentUser = student._id?.toString() === currentUserId?.toString();
            const badge = RANK_BADGES[rank];
            const initials = getInitials(student.name);

            return (
              <motion.div
                key={student._id || idx}
                whileHover={{ x: 2 }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all ${
                  isCurrentUser
                    ? 'bg-emerald-100/70 border border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-gray-50/70 hover:bg-gray-100/60 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank indicator */}
                  <div className="w-6 text-center">
                    {badge ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black border ${badge.bg}`}>
                        {rank}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-forest text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                  )}

                  {/* Name */}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[110px] sm:max-w-[150px]">
                      {student.name} {isCurrentUser && <span className="text-emerald-700 font-extrabold">(You)</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Level {student.level || 1}
                    </p>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-emerald-800">
                    {(student.xp || 0).toLocaleString()} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* User's position footer if not in top 5 */}
      {!isUserInTop5 && (
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs font-semibold text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[11px]">
              Rank #{userRank}
            </span>
            <span>Your Campus Standing</span>
          </div>
          <span className="text-emerald-800 font-bold">
            Out of {totalStudents} students
          </span>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPreview;

