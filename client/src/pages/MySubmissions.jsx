import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  Calendar,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { challengesAPI } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ChallengeDetails from '../components/challenges/ChallengeDetails';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Submissions' },
  { key: 'pending', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Needs Revision' },
];

const MySubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lightbox modal state for viewing full evidence image
  const [lightboxImage, setLightboxImage] = useState(null);

  // Resubmission drawer state
  const [selectedChallengeForResubmit, setSelectedChallengeForResubmit] = useState(null);
  const [isResubmitDrawerOpen, setIsResubmitDrawerOpen] = useState(false);

  const fetchSubmissions = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await challengesAPI.getMySubmissions();
      if (res.data?.success) {
        setSubmissions(res.data.submissions || []);
      } else {
        setError('Failed to load your submissions.');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.message || 'Error connecting to submissions server.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle Resubmit
  const handleOpenResubmit = (sub) => {
    if (sub.challengeId) {
      setSelectedChallengeForResubmit({
        ...sub.challengeId,
        hasJoined: true,
        submissionStatus: 'rejected',
        submission: sub,
      });
      setIsResubmitDrawerOpen(true);
    }
  };

  const handleResubmitSuccess = () => {
    setIsResubmitDrawerOpen(false);
    fetchSubmissions(true);
  };

  // Metrics
  const totalCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
  const totalApprovedXP = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.xpAwarded || s.challengeId?.rewardXP || 0), 0);

  // Filtered List
  const filteredSubmissions = selectedFilter === 'all'
    ? submissions
    : submissions.filter(s => s.status === selectedFilter);

  return (
    <div className="min-h-screen bg-cream bg-nature-pattern flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          profile={{ name: user?.name, xp: user?.xp, level: user?.level }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Archive</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                My Challenge Submissions
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Track status, review administrative feedback, and view earned sustainability XP.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors shadow-2xs"
              >
                <span>Browse Challenges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => fetchSubmissions(true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                title="Refresh submissions"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Submitted</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
              <p className="text-2xl font-black text-amber-800 mt-1">{pendingCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Verified & Approved</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{approvedCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Total XP Granted</span>
              <p className="text-2xl font-black text-amber-900 mt-1 flex items-center gap-1">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>+{totalApprovedXP} XP</span>
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === f.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 rounded-3xl bg-white/70 border border-emerald-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-8 rounded-3xl bg-white border border-red-100 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Unable to Load Submissions</h3>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={() => fetchSubmissions()}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSubmissions.length === 0 && (
            <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-emerald-200 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3">
                📷
              </div>
              <h3 className="text-base font-bold text-gray-900">No submissions found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                Join active campus challenges, document your actions with photos, and submit them here for points.
              </p>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Explore Active Challenges</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Submissions List */}
          {!loading && !error && filteredSubmissions.length > 0 && (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => {
                const challenge = sub.challengeId || {};
                const formattedDate = new Date(sub.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group hover:border-emerald-300 transition-all"
                  >
                    {/* Left: Thumbnail & Challenge Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Evidence Photo Thumbnail with Lightbox trigger */}
                      <div
                        onClick={() => setLightboxImage(sub.imageUrl)}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer group/thumb"
                        title="Click to view full photo"
                      >
                        <img
                          src={sub.imageUrl}
                          alt="Evidence thumbnail"
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><text y="50%" x="50%" text-anchor="middle" font-size="12" fill="%2364748b">Photo</text></svg>';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{challenge.icon || '🌱'}</span>
                          <h3 className="text-base font-bold text-gray-900 truncate">
                            {challenge.title || 'Campus Sustainability Mission'}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Submitted: {formattedDate}</span>
                          </span>
                          {challenge.category && (
                            <span className="capitalize font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {challenge.category}
                            </span>
                          )}
                        </div>

                        {/* Student's explanation */}
                        <p className="text-xs sm:text-sm text-gray-700 bg-gray-50/80 p-3 rounded-xl border border-gray-100 italic line-clamp-2">
                          &ldquo;{sub.description}&rdquo;
                        </p>

                        {/* Rejection Feedback Note */}
                        {sub.status === 'rejected' && sub.rejectReason && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                            <strong className="flex items-center gap-1 text-rose-800">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Administrator Feedback:</span>
                            </strong>
                            <p>{sub.rejectReason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {sub.status === 'approved' ? (
                        <div className="text-left md:text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Approved
                          </span>
                          <p className="text-xs font-extrabold text-amber-700 mt-1 flex items-center justify-start md:justify-end gap-1">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>+{sub.xpAwarded || challenge.rewardXP || 50} XP Awarded</span>
                          </p>
                        </div>
                      ) : sub.status === 'pending' ? (
                        <div className="text-left md:text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                            <Clock className="w-4 h-4 text-amber-600" />
                            Pending Review
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1">Awaiting admin review</p>
                        </div>
                      ) : (
                        <div className="text-left md:text-right space-y-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 text-xs font-black border border-rose-200">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            Revision Requested
                          </span>
                          <div>
                            <button
                              onClick={() => handleOpenResubmit(sub)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Resubmit Evidence</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Photo Preview Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden bg-black shadow-2xl">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={lightboxImage}
                alt="Full resolution evidence"
                className="max-h-[85vh] w-auto object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resubmission Drawer */}
      <ChallengeDetails
        isOpen={isResubmitDrawerOpen}
        onClose={() => setIsResubmitDrawerOpen(false)}
        challenge={selectedChallengeForResubmit}
        onSubmissionSuccess={handleResubmitSuccess}
      />
    </div>
  );
};

export default MySubmissions;
