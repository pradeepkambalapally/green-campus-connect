import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Clock, Star, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  waste: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  water: 'bg-sky-100 text-sky-800 border-sky-200',
  energy: 'bg-amber-100 text-amber-800 border-amber-200',
  mobility: 'bg-purple-100 text-purple-800 border-purple-200',
  lifestyle: 'bg-rose-100 text-rose-800 border-rose-200',
};

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  hard: 'text-red-700 bg-red-50 border-red-200',
};

const ActiveChallenges = ({ challenges = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Challenges</h3>
            <p className="text-xs text-gray-500">Real-world missions for campus sustainability</p>
          </div>
        </div>

        <Link
          to="/challenges"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Challenges List or Empty State */}
      {challenges.length === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-cream border border-dashed border-emerald-200/80 px-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 text-xl">
            🌱
          </div>
          <h4 className="text-sm font-bold text-gray-800">No active challenges available right now</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            New campus sustainability missions are being prepared by the administration. Check back soon!
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            <span>Explore Challenges Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.slice(0, 3).map((ch, idx) => {
            const categoryStyle = CATEGORY_COLORS[ch.category] || CATEGORY_COLORS.lifestyle;
            const diffStyle = DIFFICULTY_COLORS[ch.difficulty] || DIFFICULTY_COLORS.easy;

            // Participation status badge
            let statusBadge = null;
            if (ch.submissionStatus === 'approved') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Approved
                </span>
              );
            } else if (ch.submissionStatus === 'pending') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  In Review
                </span>
              );
            } else if (ch.submissionStatus === 'rejected') {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full border border-red-200">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Resubmit
                </span>
              );
            } else if (ch.hasJoined) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                  Joined
                </span>
              );
            }

            return (
              <motion.div
                key={ch._id || idx}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl bg-gray-50/70 hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {ch.icon || '🌱'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryStyle}`}>
                        {ch.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${diffStyle}`}>
                        {ch.difficulty}
                      </span>
                      {statusBadge}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                      {ch.title}
                    </h4>
                    {ch.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {ch.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      +{ch.rewardXP} XP
                    </span>
                  </div>

                  <Link
                    to={ch._id ? `/challenges/${ch._id}` : '/challenges'}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-gray-700 text-xs font-bold border border-gray-200 transition-colors shadow-sm"
                  >
                    <span>{ch.hasJoined ? 'Submit' : 'Join'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveChallenges;
