import { motion } from 'framer-motion';
import { Map, ArrowRight, CheckCircle2, Lock, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const DESTINATIONS = [
  { name: 'Forest of Waste Wisdom', icon: '🌲', key: 'waste' },
  { name: 'Water World', icon: '💧', key: 'water' },
  { name: 'Energy Valley', icon: '⚡', key: 'energy' },
  { name: 'Green Mobility Trail', icon: '🚲', key: 'mobility' },
  { name: 'Eco Living Island', icon: '🏡', key: 'lifestyle' },
];

const LearningProgressCard = ({ learningJourney }) => {
  const completedDestinations = learningJourney?.completedDestinations || [];
  const completedCount = learningJourney?.completedDestinationsCount ?? completedDestinations.length;
  const totalDestinations = learningJourney?.totalDestinationsCount ?? 5;
  const completedModules = learningJourney?.completedModulesCount ?? 0;
  const totalModules = learningJourney?.totalModulesCount ?? 5;
  const progressPercent = learningJourney?.overallProgressPercent ?? (
    totalDestinations > 0 ? Math.round((completedCount / totalDestinations) * 100) : 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <Map className="w-4 h-4 text-emerald-700" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Learning Journey
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Sustainability Quest
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700">{progressPercent}%</span>
            <p className="text-[11px] font-semibold text-gray-400 uppercase">Completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
            <span>{completedCount} of {totalDestinations} Destinations Conquered</span>
            <span>{completedModules} / {totalModules} Modules</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </div>

        {/* Destination Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-6">
          {DESTINATIONS.map((dest, idx) => {
            const isCompleted = completedDestinations.includes(dest.name);
            const isCurrent = !isCompleted && (idx === 0 || completedDestinations.includes(DESTINATIONS[idx - 1]?.name));

            return (
              <div
                key={dest.name}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold'
                    : isCurrent
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-bold ring-2 ring-amber-300/40'
                    : 'bg-gray-50/70 border-gray-100 text-gray-400'
                }`}
                title={dest.name}
              >
                <span className="text-base shrink-0">{dest.icon}</span>
                <span className="truncate flex-1">{dest.name}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
                ) : (
                  <Lock className="w-3 h-3 text-gray-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          Complete modules and quizzes to unlock the next destination on the map.
        </p>
        <Link
          to="/learning-map"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.02]"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default LearningProgressCard;

