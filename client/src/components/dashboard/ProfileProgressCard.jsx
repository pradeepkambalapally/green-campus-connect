import { motion } from 'framer-motion';
import { Flame, Sparkles, Compass, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const getInitials = (name = '') => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ProfileProgressCard = ({ profile }) => {
  const name = profile?.name || 'Eco Explorer';
  const level = profile?.level ?? 1;
  const levelTitle = profile?.levelTitle || 'Eco Seedling';
  const xp = profile?.xp ?? 0;
  const xpInCurrentLevel = profile?.xpInCurrentLevel ?? (xp % 500);
  const xpForNextLevel = profile?.xpForNextLevel ?? 500;
  const progressToNextLevel = Math.min(
    100,
    Math.max(0, profile?.progressToNextLevel ?? Math.round((xpInCurrentLevel / xpForNextLevel) * 100))
  );
  const nextLevel = level + 1;
  const streak = profile?.streak ?? 0;
  const initials = getInitials(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40"
    >
      {/* Decorative ambient background */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Greetings */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-400/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl sm:text-2xl font-black ring-4 ring-emerald-400/30 shadow-lg">
                {initials}
              </div>
            )}
            <div
              className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black shadow-md flex items-center gap-0.5"
              title={`Level ${level}`}
            >
              <span>Lv.{level}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Sustainability Journey
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-200">Campus Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-sm sm:text-base text-emerald-200/90 font-medium mt-0.5 flex items-center gap-2">
              <span className="text-amber-300 font-bold">Level {level}</span>
              <span>—</span>
              <span className="inline-flex items-center gap-1">
                <Compass className="w-4 h-4 text-emerald-300" />
                {levelTitle}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action / Streak Pill */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">Active Streak</p>
              <p className="text-base font-black text-white">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
            </div>
          </div>

          <Link
            to="/learning-map"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950/20 hover:scale-[1.02]"
          >
            <span>Adventure Map</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* XP Progression Bar */}
      <div className="relative z-10 mt-6 pt-6 border-t border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm font-semibold mb-2 text-emerald-100 gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white text-base font-bold">{xp.toLocaleString()} XP</span>
            <span className="text-emerald-300">Total Experience</span>
          </div>
          <div>
            <span>Progress to Level {nextLevel}: </span>
            <span className="text-amber-300 font-bold">{xpInCurrentLevel}</span>
            <span className="text-emerald-300"> / {xpForNextLevel} XP</span>
            <span className="text-emerald-200 ml-1.5 font-bold">({progressToNextLevel}%)</span>
          </div>
        </div>

        <div className="w-full h-3.5 bg-emerald-950/70 rounded-full overflow-hidden p-0.5 border border-emerald-600/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileProgressCard;
