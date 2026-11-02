import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  HelpCircle,
  Trophy,
  ArrowRight,
  ShieldAlert,
  Star,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DestinationDrawer = ({ isOpen, onClose, destination }) => {
  const navigate = useNavigate();

  if (!destination) return null;

  const {
    _id,
    title,
    destination: destName,
    topic,
    description,
    learningObjectives = [],
    estimatedReadingTime = '5 mins',
    totalSections = 5,
    quizQuestionsCount = 3,
    xpReward = 100,
    isLocked = false,
    isCompleted = false,
    isAvailable = false,
    unlockRequirement,
    icon = '🌿',
    progress,
  } = destination;

  const handleStartLearning = () => {
    if (isLocked) return;
    onClose();
    navigate(`/modules/${_id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-950/50 backdrop-blur-xs z-40 transition-opacity"
          />

          {/* Drawer / Bottom sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] max-w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-hidden border-l border-emerald-100"
          >
            {/* Drawer Header Banner */}
            <div className="relative p-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-forest text-white">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Badge */}
              <div className="mb-3">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Conquered Quest
                  </span>
                ) : isLocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/90 text-amber-950 shadow-sm">
                    <Lock className="w-3.5 h-3.5" />
                    Locked Destination
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-300 text-emerald-950 shadow-sm animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Current Adventure
                  </span>
                )}
              </div>

              {/* Icon & Destination Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {icon}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {topic || 'Sustainability Topic'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {destName}
                  </h2>
                </div>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Lesson Title & Description */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Locked Notice Alert */}
              {isLocked && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Destination Locked
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {unlockRequirement || 'Complete the preceding learning destinations and pass their quizzes to unlock this chapter.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Notice */}
              {isCompleted && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Quest Conquered!</p>
                      <p className="text-[11px] text-emerald-700">+{xpReward} XP awarded to student profile</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    100% Mastered
                  </span>
                </div>
              )}

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-cream border border-emerald-100/80 text-center">
                  <Clock className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span className="block text-xs font-black text-gray-800">{estimatedReadingTime}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Read Time</span>
                </div>
                <div className="p-3 rounded-2xl bg-cream border border-emerald-100/80 text-center">
                  <BookOpen className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span className="block text-xs font-black text-gray-800">{totalSections} Sections</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Lesson Parts</span>
                </div>
                <div className="p-3 rounded-2xl bg-cream border border-emerald-100/80 text-center">
                  <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="block text-xs font-black text-amber-700">+{xpReward} XP</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Reward</span>
                </div>
              </div>

              {/* Learning Objectives */}
              {learningObjectives.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What You&apos;ll Learn</span>
                  </h4>
                  <ul className="space-y-2">
                    {learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-snug">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quiz Information */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">Knowledge Check Quiz</h5>
                    <p className="text-[11px] text-gray-500">
                      Score 70%+ to unlock the next destination
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {quizQuestionsCount} Questions
                </span>
              </div>
            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80">
              {isLocked ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>Destination Locked</span>
                </button>
              ) : isCompleted ? (
                <button
                  onClick={handleStartLearning}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-[1.01]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Review Lesson & Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleStartLearning}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Learning Destination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DestinationDrawer;
