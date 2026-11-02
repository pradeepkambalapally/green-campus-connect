import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  Clock,
  HelpCircle,
  Trophy,
  Award,
  AlertCircle,
  Lightbulb,
  Check,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { modulesAPI, quizzesAPI } from '../services/api';

const LearningModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockRequirement, setUnlockRequirement] = useState('');

  // Quiz Mode State
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch Module Details
  const fetchModuleData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await modulesAPI.getOne(id);
      if (res.data?.success) {
        const mod = res.data.module;
        setModule(mod);
        setIsLocked(res.data.isLocked || false);
        setUnlockRequirement(res.data.unlockRequirement || '');

        const prog = res.data.progress;
        setProgress(prog);

        if (prog) {
          const finished = prog.completedSections || [];
          setCompletedSections(finished);
          if (typeof prog.currentSection === 'number' && prog.currentSection < (mod.sections?.length || 1)) {
            setCurrentSectionIdx(prog.currentSection);
          }
        }
      } else {
        setError('Could not retrieve learning content.');
      }
    } catch (err) {
      console.error('Error fetching module:', err);
      setError(err.response?.data?.message || 'Error connecting to the learning server.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  // Persist Section Progress
  const markSectionAsRead = async (index) => {
    const updatedSections = Array.from(new Set([...completedSections, index]));
    setCompletedSections(updatedSections);

    try {
      await modulesAPI.updateProgress(id, {
        currentSection: index,
        sectionCompleted: index,
      });
    } catch (err) {
      console.error('Failed to sync reading progress to server:', err);
    }
  };

  const handleNextSection = () => {
    markSectionAsRead(currentSectionIdx);
    const nextIdx = currentSectionIdx + 1;
    if (nextIdx < (module?.sections?.length || 0)) {
      setCurrentSectionIdx(nextIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Reached the end of all sections -> open quiz
      handleStartQuiz();
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSection = (idx) => {
    markSectionAsRead(currentSectionIdx);
    setCurrentSectionIdx(idx);
    setQuizMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Quiz
  const handleStartQuiz = async () => {
    markSectionAsRead(currentSectionIdx);
    setQuizMode(true);
    setQuizResult(null);
    setUserAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await quizzesAPI.getQuestions(id);
      if (res.data?.success) {
        setQuizQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.error('Failed to load quiz questions:', err);
    }
  };

  const handleSelectAnswer = (qIndex, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < quizQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setQuizSubmitting(true);
    const formattedAnswers = quizQuestions.map((_, idx) => ({
      questionIndex: idx,
      selectedAnswer: userAnswers[idx] ?? -1,
    }));

    try {
      const res = await quizzesAPI.submit(id, formattedAnswers);
      if (res.data?.success) {
        setQuizResult(res.data);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert(err.response?.data?.message || 'Error submitting quiz evaluation.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl animate-bounce mb-3">
          📖
        </div>
        <h2 className="text-xl font-bold text-gray-900">Loading Sustainability Lesson...</h2>
        <p className="text-sm text-gray-500 mt-1">Fetching lesson content and progress</p>
      </div>
    );
  }

  // Locked State
  if (isLocked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Destination Locked</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {unlockRequirement || 'You must complete and pass the previous destination quiz to unlock this chapter.'}
          </p>
          <Link
            to="/learning-map"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Adventure Map</span>
          </Link>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !module) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Could not find this module.'}</p>
          <Link
            to="/learning-map"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Learning Map</span>
          </Link>
        </div>
      </div>
    );
  }

  const sections = module.sections || [];
  const currentSection = sections[currentSectionIdx] || sections[0];
  const totalSectionsCount = sections.length;
  const readingProgressPercent = totalSectionsCount > 0
    ? Math.round((completedSections.length / totalSectionsCount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Sticky Reader Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Back link */}
          <Link
            to="/learning-map"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Learning Map</span>
          </Link>

          {/* Module Title & Destination */}
          <div className="text-center min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 truncate block">
              {module.destination} • Chapter {module.order}
            </span>
            <h1 className="text-sm sm:text-base font-black text-gray-900 truncate">
              {module.title}
            </h1>
          </div>

          {/* XP & Reading Time */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {module.estimatedReadingTime || '6 mins'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              +{module.xpReward || 100} XP
            </span>
          </div>
        </div>

        {/* Reading Progress Line */}
        <div className="max-w-6xl mx-auto mt-2.5">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${quizMode ? 100 : readingProgressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ============================================================ */}
        {/* SIDEBAR: Table of Contents / Section Checklist               */}
        {/* ============================================================ */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm sticky top-24 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Lesson Sections
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              {completedSections.length} / {totalSectionsCount}
            </span>
          </div>

          {/* Section Navigation Buttons */}
          <div className="space-y-1.5">
            {sections.map((sec, idx) => {
              const isCurrent = !quizMode && currentSectionIdx === idx;
              const isRead = completedSections.includes(idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSection(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-start gap-2.5 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : isRead
                      ? 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/70'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-white text-emerald-700'
                        : isRead
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isRead && !isCurrent ? '✓' : idx + 1}
                  </span>
                  <span className="line-clamp-2 leading-tight">
                    {sec.title}
                  </span>
                </button>
              );
            })}

            {/* Quiz Tab */}
            <button
              onClick={handleStartQuiz}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between mt-3 ${
                quizMode
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Knowledge Check Quiz</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-200/60">
                Quiz
              </span>
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN PANEL: Section Reader OR Quiz Engine                   */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-6">
          {!quizMode ? (
            /* SECTION READER VIEW */
            <motion.article
              key={currentSectionIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm space-y-8"
            >
              {/* Section Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Section {currentSectionIdx + 1} of {totalSectionsCount}
                  </span>
                  {completedSections.includes(currentSectionIdx) && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Read
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                  {currentSection.title}
                </h2>
              </div>

              {/* Lesson Body Content */}
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
                <p>{currentSection.content}</p>
              </div>

              {/* Illustrated Campus Example Card */}
              {currentSection.campusExample && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 flex items-start gap-4 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Campus In Action</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                      {currentSection.campusExample}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Takeaways Box */}
              {currentSection.keyTakeaway && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-3.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
                      Key Takeaway
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                      {currentSection.keyTakeaway}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Pagination Controls */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevSection}
                  disabled={currentSectionIdx === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextSection}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                >
                  <span>
                    {currentSectionIdx + 1 === totalSectionsCount ? 'Proceed to Quiz' : 'Next Section'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ) : (
            /* ============================================================ */
            /* QUIZ ENGINE VIEW                                            */
            /* ============================================================ */
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-sm space-y-8">
              {/* Quiz Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black mb-2">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-700" />
                    <span>Knowledge Checkpoint</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {module.destination} Quiz
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Answer all questions correctly. Score 70%+ to conquer this destination and unlock the next path on the map.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-purple-700">
                    +{module.xpReward || 100} XP
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Upon Passing</p>
                </div>
              </div>

              {/* Quiz Results Banner */}
              {quizResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-3xl border text-center space-y-3 ${
                    quizResult.passed
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
                      : 'bg-gradient-to-br from-amber-50 to-rose-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm bg-white">
                    {quizResult.passed ? '🏆' : '📚'}
                  </div>

                  <h3 className="text-xl font-black">
                    {quizResult.passed
                      ? 'Congratulations! You Conquered This Destination!'
                      : 'Review & Try Again'}
                  </h3>

                  <p className="text-sm max-w-md mx-auto">
                    You scored <strong className="text-base">{quizResult.score} out of {quizResult.totalQuestions}</strong> ({quizResult.percentage}%).
                    {quizResult.passed
                      ? ` You earned ${quizResult.xpEarned} XP! The next destination on your adventure map is now unlocked.`
                      : ' A passing score of 70% is required to unlock the next chapter. Review the questions and explanations below, then retry.'}
                  </p>

                  {/* Badge Alert */}
                  {quizResult.badgeAwarded && (
                    <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-white border border-amber-300 shadow-sm text-amber-950 text-xs font-bold">
                      <span className="text-2xl">{quizResult.badgeAwarded.icon || '🏅'}</span>
                      <div className="text-left">
                        <p className="text-[10px] uppercase text-amber-600 font-extrabold">New Accolade Unlocked</p>
                        <p>{quizResult.badgeAwarded.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to="/learning-map"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <span>Return to Adventure Map</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {!quizResult.passed && (
                      <button
                        onClick={() => {
                          setQuizResult(null);
                          setUserAnswers({});
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-sm border border-gray-300 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retry Quiz</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quiz Questions List */}
              <div className="space-y-8">
                {quizQuestions.map((q, qIndex) => {
                  const evaluation = quizResult?.results?.find(r => r.questionIndex === qIndex);
                  const selected = userAnswers[qIndex];

                  return (
                    <div
                      key={qIndex}
                      className="p-5 sm:p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-4"
                    >
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <span>{q.question}</span>
                      </h4>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selected === optIndex;
                          let optionStyle = 'bg-white hover:bg-purple-50/60 border-gray-200 text-gray-800';

                          if (quizResult && evaluation) {
                            if (optIndex === evaluation.correctAnswer) {
                              optionStyle = 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300';
                            } else if (isSelected && !evaluation.isCorrect) {
                              optionStyle = 'bg-rose-100/80 border-rose-400 text-rose-950 font-bold';
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm';
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={!!quizResult}
                              onClick={() => handleSelectAnswer(qIndex, optIndex)}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {isSelected && !quizResult && (
                                <Check className="w-4 h-4 shrink-0 text-white" />
                              )}
                              {quizResult && optIndex === evaluation?.correctAnswer && (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Feedback */}
                      {evaluation?.explanation && (
                        <div className="mt-3 p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 space-y-1">
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Explanation:</span>
                          </p>
                          <p className="leading-relaxed">{evaluation.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Action */}
              {!quizResult && (
                <div className="pt-4 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setQuizMode(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Lesson Reading</span>
                  </button>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizSubmitting || Object.keys(userAnswers).length < quizQuestions.length}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {quizSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" />
                        <span>Submit Answers for Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningModule;
