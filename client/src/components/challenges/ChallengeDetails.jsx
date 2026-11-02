import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Send,
  ArrowRight,
  RotateCcw,
  Star,
} from 'lucide-react';
import EvidenceSubmission from './EvidenceSubmission';

const CATEGORY_NAMES = {
  waste: 'Waste Management',
  water: 'Water Conservation',
  energy: 'Energy Conservation',
  mobility: 'Sustainable Transportation',
  lifestyle: 'Responsible Consumption',
};

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

const ChallengeDetails = ({
  isOpen,
  onClose,
  challenge,
  onJoin,
  onSubmissionSuccess,
}) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  if (!challenge) return null;

  const {
    _id,
    title,
    description,
    whyItMatters,
    category,
    difficulty,
    rewardXP = 50,
    startDate,
    endDate,
    instructions,
    evidenceRequirements,
    submissionRules,
    participantsCount = 0,
    hasJoined = false,
    submissionStatus = null,
    submission = null,
    icon = '🌱',
  } = challenge;

  const categoryName = CATEGORY_NAMES[category] || category;
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.waste;
  const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.easy;

  const formattedDeadline = endDate
    ? new Date(endDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing';

  const isExpired = endDate && new Date() > new Date(endDate);

  const handleJoinClick = async () => {
    setIsJoining(true);
    try {
      if (onJoin) {
        await onJoin(_id);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleEvidenceSuccess = (newSubmission) => {
    setShowSubmissionForm(false);
    if (onSubmissionSuccess) {
      onSubmissionSuccess(newSubmission);
    }
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

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[540px] max-w-full bg-white shadow-2xl z-50 flex flex-col justify-between overflow-hidden border-l border-emerald-100"
          >
            {/* Drawer Header */}
            <div className="relative p-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-forest text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status / Category Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-white/15 text-white border-white/20`}>
                  {categoryName}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-amber-950">
                  {difficulty}
                </span>

                {submissionStatus === 'approved' ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved (+{rewardXP} XP)
                  </span>
                ) : submissionStatus === 'pending' ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-300 text-amber-950 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Review
                  </span>
                ) : submissionStatus === 'rejected' ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-400 text-rose-950 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Revision Requested
                  </span>
                ) : hasJoined ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/80 text-white">
                    Joined
                  </span>
                ) : null}
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  {icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-emerald-200 mt-2">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <strong className="text-white">+{rewardXP} XP</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {formattedDeadline}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Submission Form View (When activated) */}
              {showSubmissionForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-600" />
                      <span>Submit Photo Evidence</span>
                    </h3>
                    <button
                      onClick={() => setShowSubmissionForm(false)}
                      className="text-xs text-gray-400 hover:text-gray-700 font-semibold"
                    >
                      Back to details
                    </button>
                  </div>

                  <EvidenceSubmission
                    challenge={challenge}
                    onSubmissionSuccess={handleEvidenceSuccess}
                    onCancel={() => setShowSubmissionForm(false)}
                  />
                </div>
              ) : (
                <>
                  {/* Status Callout Banner */}
                  {submissionStatus === 'approved' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-200/80 flex items-center justify-center text-emerald-800 text-xl shrink-0">
                          🌟
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                            Challenge Completed & Verified!
                          </h4>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            You earned {rewardXP} XP for this sustainability achievement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submissionStatus === 'pending' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Evidence Under Verification
                        </h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Your photo submission is currently queued for administrator review. XP will be awarded upon approval.
                        </p>
                        {submission?.description && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 border border-amber-200/70 text-[11px] text-gray-700">
                            <strong>Your note:</strong> &ldquo;{submission.description}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {submissionStatus === 'rejected' && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                            Revision Requested by Admin
                          </h4>
                          <p className="text-xs text-rose-800 mt-0.5">
                            {submission?.rejectReason || 'Evidence photo was unclear or did not satisfy the instructions.'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSubmissionForm(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resubmit Evidence</span>
                      </button>
                    </div>
                  )}

                  {/* Challenge Description */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                      About This Challenge
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Why It Matters Callout */}
                  {whyItMatters && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-0.5">
                          Why It Matters
                        </h4>
                        <p className="text-xs text-emerald-900/90 leading-relaxed">
                          {whyItMatters}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step by Step Instructions */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Step-by-Step Instructions
                    </h3>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed">
                      {instructions}
                    </div>
                  </div>

                  {/* Evidence Requirements */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                      Evidence Requirements
                    </h3>
                    <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-xs sm:text-sm text-sky-950 leading-relaxed">
                      {evidenceRequirements}
                    </div>
                  </div>

                  {/* Submission Rules */}
                  {submissionRules && (
                    <div className="text-[11px] text-gray-500 p-3 rounded-xl bg-gray-50 border border-gray-100 leading-relaxed">
                      <strong className="text-gray-700">Rules:</strong> {submissionRules}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Action Bar */}
            {!showSubmissionForm && (
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80">
                {!hasJoined ? (
                  <button
                    onClick={handleJoinClick}
                    disabled={isJoining || isExpired}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isJoining ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Join Challenge (+{rewardXP} XP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : submissionStatus === 'approved' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-sm cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed & Rewarded</span>
                  </button>
                ) : submissionStatus === 'pending' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-100 text-amber-800 font-bold text-sm cursor-default"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Awaiting Admin Verification</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmissionForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/25 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submissionStatus === 'rejected' ? 'Resubmit Photo Evidence' : 'Submit Photo Evidence'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChallengeDetails;
