import { motion } from 'framer-motion';
import { Award, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const BadgeShowcase = ({ badges = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Earned Badges</h3>
            <p className="text-xs text-gray-500">Your sustainability accolades & achievements</p>
          </div>
        </div>

        <Link
          to="/badges"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <span>All Badges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Badges List or Empty State */}
      {badges.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-amber-50/50 border border-dashed border-amber-200 px-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5 text-xl">
            🏅
          </div>
          <h4 className="text-sm font-bold text-gray-800">No badges earned yet</h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-4">
            Pass your first sustainability quiz or complete a campus challenge to earn your first accolade!
          </p>
          <Link
            to="/learning-map"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Exploring</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.slice(0, 4).map((item, idx) => {
            const badge = item.badgeId || item;
            const earnedDate = item.earnedAt
              ? new Date(item.earnedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <motion.div
                key={badge._id || idx}
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-200/80 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {badge.icon || '🏅'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {badge.description}
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full mt-2">
                  {earnedDate}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BadgeShowcase;
