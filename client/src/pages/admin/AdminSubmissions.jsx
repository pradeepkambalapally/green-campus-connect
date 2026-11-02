import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Trophy,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  X,
  Send,
  MessageSquare,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected / Revision' },
  { key: 'all', label: 'All Submissions' },
];

const CATEGORIES = [
  { key: 'all', label: 'All Categories' },
  { key: 'waste', label: 'Waste' },
  { key: 'water', label: 'Water' },
  { key: 'energy', label: 'Energy' },
  { key: 'mobility', label: 'Mobility' },
  { key: 'lifestyle', label: 'Lifestyle' },
];

const AdminSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected submission for full review modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Lightbox full image preview
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchSubmissions = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await adminAPI.getSubmissions({
        status: statusFilter,
        category: categoryFilter,
        search: searchTerm,
      });

      if (res.data?.success) {
        setSubmissions(res.data.submissions || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      } else {
        setError('Failed to load administrative submissions.');
      }
    } catch (err) {
      console.error('Error fetching admin submissions:', err);
      setError(err.response?.data?.message || 'Access denied or server error.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Open review modal
  const handleOpenReview = (sub) => {
    setSelectedSub(sub);
    setIsReviewModalOpen(true);
  };

  // Handle Approve
  const handleApprove = async (subId) => {
    if (!subId) return;
    setActionLoading(true);

    try {
      const res = await adminAPI.approveSubmission(subId);
      if (res.data?.success) {
        setIsReviewModalOpen(false);
        fetchSubmissions(true);
      }
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.message || 'Failed to approve submission.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleRejectConfirm = async () => {
    if (!selectedSub) return;
    setActionLoading(true);

    try {
      const res = await adminAPI.rejectSubmission(selectedSub._id, rejectReason.trim());
      if (res.data?.success) {
        setIsRejectModalOpen(false);
        setIsReviewModalOpen(false);
        setRejectReason('');
        fetchSubmissions(true);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(err.response?.data?.message || 'Failed to reject submission.');
    } finally {
      setActionLoading(false);
    }
  };

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
          {/* Top Admin Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-1 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Institutional Administrator Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Evidence Verification Console
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Audit student photo evidence, verify genuine campus sustainability action, and award verified XP.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchSubmissions(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setStatusFilter('pending')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  Pending Verification
                </span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black">{counts.pending}</p>
            </div>

            <div
              onClick={() => setStatusFilter('approved')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  Approved & Rewarded
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black">{counts.approved}</p>
            </div>

            <div
              onClick={() => setStatusFilter('rejected')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  Revisions Requested
                </span>
                <XCircle className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black">{counts.rejected}</p>
            </div>

            <div
              onClick={() => setStatusFilter('all')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                  Total Submissions
                </span>
                <FileCheck className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black">{counts.total}</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student or challenge..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all text-gray-800"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      statusFilter === tab.key
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-gray-100 scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat.key
                      ? 'bg-purple-900 text-white shadow-2xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 rounded-3xl bg-white/70 border border-purple-100 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-8 rounded-3xl bg-white border border-red-100 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">Access or Connection Error</h3>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={() => fetchSubmissions()}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && submissions.length === 0 && (
            <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-purple-200 p-8 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center text-3xl mx-auto mb-3">
                📭
              </div>
              <h3 className="text-base font-bold text-gray-800">No submissions matching criteria</h3>
              <p className="text-xs text-gray-500 mt-1">
                All submissions in this view have been processed or none match your active filters.
              </p>
            </div>
          )}

          {/* Submissions List */}
          {!loading && !error && submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const challenge = sub.challengeId || {};
                const student = sub.userId || {};
                const formattedDate = new Date(sub.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={sub._id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 hover:border-purple-200 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Evidence Photo */}
                      <div
                        onClick={() => setLightboxImage(sub.imageUrl)}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer group/thumb"
                        title="Click to view full photo"
                      >
                        <img
                          src={sub.imageUrl}
                          alt="Student evidence"
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

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Student Name & Challenge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-gray-900">
                            {student.name || 'Anonymous Student'}
                          </span>
                          <span className="text-xs text-gray-400">({student.email})</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Lvl {student.level || 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <span>{challenge.icon || '🌱'}</span>
                          <span>{challenge.title || 'Challenge'}</span>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            +{challenge.rewardXP || 50} XP
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 line-clamp-2">
                          &ldquo;{sub.description}&rdquo;
                        </p>

                        <div className="text-[11px] text-gray-400">
                          Submitted on {formattedDate}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      {/* Status Indicator */}
                      <div>
                        {sub.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Approved
                          </span>
                        ) : sub.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Audit
                          </span>
                        )}
                      </div>

                      {/* Review / Inspect Button */}
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Decide</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Review & Decision Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Evidence Audit
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-2">
                  {selectedSub.challengeId?.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Submitted by {selectedSub.userId?.name} ({selectedSub.userId?.email})
                </p>
              </div>

              {/* High-Res Photo View */}
              <div
                onClick={() => setLightboxImage(selectedSub.imageUrl)}
                className="relative rounded-2xl overflow-hidden bg-black/90 max-h-72 flex items-center justify-center cursor-pointer group"
              >
                <img
                  src={selectedSub.imageUrl}
                  alt="Full evidence"
                  className="max-h-72 w-auto object-contain"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/60 text-white text-[11px] font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Click to expand</span>
                </div>
              </div>

              {/* Challenge Requirements vs Student Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <h4 className="font-bold text-gray-900">Required Evidence:</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedSub.challengeId?.evidenceRequirements || 'Original photo demonstrating the campus activity.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                  <h4 className="font-bold text-purple-900">Student Explanation:</h4>
                  <p className="text-gray-800 leading-relaxed italic">
                    &ldquo;{selectedSub.description}&rdquo;
                  </p>
                </div>
              </div>

              {/* Reward preview */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Approving will award this student:</span>
                </div>
                <strong className="text-sm font-black text-amber-900">
                  +{selectedSub.challengeId?.rewardXP || 50} XP
                </strong>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {selectedSub.status === 'pending' ? (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => setIsRejectModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
                    >
                      Reject with Reason
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleApprove(selectedSub._id)}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Award XP</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-gray-400">
                    This submission was already processed as {selectedSub.status}.
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject with Feedback Modal */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-black text-gray-900">
                Reject Evidence Submission
              </h3>
              <p className="text-xs text-gray-500">
                Provide constructive feedback so the student knows what to correct before resubmitting.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., The photo was too blurry or did not show reusable items in use on campus grounds. Please take a clearer photo and resubmit."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-rose-500 focus:bg-white resize-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleRejectConfirm}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Lightbox Image */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-70 flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden bg-black shadow-2xl">
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
    </div>
  );
};

export default AdminSubmissions;
