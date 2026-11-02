import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  BookOpen,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const TYPE_CONFIG = {
  module_completed: {
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  quiz_passed: {
    icon: CheckCircle2,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  quiz_failed: {
    icon: XCircle,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  challenge_joined: {
    icon: Sparkles,
    color: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  challenge_submitted: {
    icon: Send,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  submission_approved: {
    icon: Trophy,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  submission_rejected: {
    icon: XCircle,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  badge_earned: {
    icon: Award,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  level_up: {
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

const ActivityFeed = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Activity</h3>
            <p className="text-xs text-gray-500">Live timeline of your sustainability actions</p>
          </div>
        </div>
      </div>

      {/* Timeline or Empty State */}
      {activities.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 px-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2 text-lg">
            📜
          </div>
          <h4 className="text-sm font-bold text-gray-700">No activity logged yet</h4>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
            Complete your first module or challenge to see your green timeline grow.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3.5 pl-2">
          {/* Vertical timeline connector */}
          <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-emerald-100 -z-0" />

          {activities.slice(0, 6).map((act, idx) => {
            const config = TYPE_CONFIG[act.type] || {
              icon: Activity,
              color: 'bg-gray-100 text-gray-600 border-gray-200',
            };
            const Icon = config.icon;
            const timeAgo = formatTimeAgo(act.createdAt);

            return (
              <motion.div
                key={act._id || idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="relative z-10 flex items-start gap-3.5 group"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${config.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-900 transition-colors leading-snug">
                    {act.description}
                  </p>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {timeAgo}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

