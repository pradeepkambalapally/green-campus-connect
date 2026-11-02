import { motion } from 'framer-motion';
import { Star, BookOpen, Trophy, Award, TrendingUp } from 'lucide-react';

const ICONS = {
  xp: Star,
  modules: BookOpen,
  challenges: Trophy,
  badges: Award,
};

const COLOR_VARIANTS = {
  emerald: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    valueText: 'text-emerald-950',
    accentText: 'text-emerald-700',
  },
  blue: {
    bg: 'bg-sky-50/70',
    border: 'border-sky-100',
    iconBg: 'bg-sky-600',
    iconText: 'text-white',
    valueText: 'text-sky-950',
    accentText: 'text-sky-700',
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500',
    iconText: 'text-white',
    valueText: 'text-amber-950',
    accentText: 'text-amber-700',
  },
  purple: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-100',
    iconBg: 'bg-purple-600',
    iconText: 'text-white',
    valueText: 'text-purple-950',
    accentText: 'text-purple-700',
  },
};

const StatCard = ({
  type = 'xp',
  label,
  value,
  subtitle,
  color = 'emerald',
  delay = 0,
}) => {
  const Icon = ICONS[type] || TrendingUp;
  const styling = COLOR_VARIANTS[color] || COLOR_VARIANTS.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`rounded-2xl p-5 sm:p-6 bg-white border ${styling.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <div className={`w-11 h-11 rounded-xl ${styling.iconBg} ${styling.iconText} flex items-center justify-center shadow-md shadow-gray-200/60`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-black ${styling.valueText} tracking-tight`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
            <span className={styling.accentText}>●</span>
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
