import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ProfileProgressCard from '../components/dashboard/ProfileProgressCard';
import StatCard from '../components/dashboard/StatCard';
import LearningProgressCard from '../components/dashboard/LearningProgressCard';
import ActiveChallenges from '../components/dashboard/ActiveChallenges';
import BadgeShowcase from '../components/dashboard/BadgeShowcase';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await dashboardAPI.getStudentDashboard();
      if (res.data?.success) {
        setDashboardData(res.data.dashboard);
      } else {
        setError('Failed to retrieve dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(
        err.response?.data?.message ||
        'Could not load your sustainability dashboard. Please ensure the backend is running.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex">
        <DashboardSidebar isOpen={false} />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <div className="h-16 bg-white/70 border-b border-emerald-100 animate-pulse" />
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Profile banner skeleton */}
            <div className="h-48 rounded-3xl bg-emerald-800/10 animate-pulse" />
            {/* 4 Stat cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/80 border border-emerald-100 animate-pulse" />
              ))}
            </div>
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 rounded-3xl bg-white/80 border border-emerald-100 animate-pulse" />
                <div className="h-72 rounded-3xl bg-white/80 border border-emerald-100 animate-pulse" />
              </div>
              <div className="space-y-6">
                <div className="h-56 rounded-3xl bg-white/80 border border-emerald-100 animate-pulse" />
                <div className="h-64 rounded-3xl bg-white/80 border border-emerald-100 animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-cream flex">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <DashboardHeader
            onOpenSidebar={() => setIsSidebarOpen(true)}
            profile={{ name: user?.name, xp: user?.xp, level: user?.level }}
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Problem</h2>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => fetchDashboard()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading Dashboard</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    profile = user,
    stats = {},
    learningJourney = {},
    activeChallenges = [],
    recentBadges = [],
    recentActivities = [],
    leaderboardPreview = {},
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-cream bg-nature-pattern flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        studentData={dashboardData}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          profile={profile}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Row: Refresh Bar on mobile/desktop */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>University Sustainability Engagement Network</span>
            </div>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-emerald-700 font-semibold border border-emerald-100 shadow-2xs transition-all disabled:opacity-50"
              title="Refresh dashboard metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Profile & XP Hero Banner */}
          <ProfileProgressCard profile={profile} />

          {/* 4 Sustainability Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            <StatCard
              type="xp"
              label="Total Experience"
              value={stats.totalXP ?? profile?.xp ?? 0}
              subtitle="All-time points"
              color="emerald"
              delay={0.05}
            />
            <StatCard
              type="modules"
              label="Modules Finished"
              value={`${stats.completedModulesCount ?? 0} / ${stats.totalModulesCount ?? 5}`}
              subtitle="Learning quest"
              color="blue"
              delay={0.1}
            />
            <StatCard
              type="challenges"
              label="Missions Joined"
              value={stats.challengesJoinedCount ?? 0}
              subtitle="Real-world action"
              color="amber"
              delay={0.15}
            />
            <StatCard
              type="badges"
              label="Badges Unlocked"
              value={stats.badgesCount ?? recentBadges.length}
              subtitle="Accomplishments"
              color="purple"
              delay={0.2}
            />
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Learning Journey & Active Missions */}
            <div className="lg:col-span-2 space-y-6">
              <LearningProgressCard learningJourney={learningJourney} />
              <ActiveChallenges challenges={activeChallenges} />
            </div>

            {/* Right Column: Badges, Leaderboard, & Live Timeline */}
            <div className="space-y-6">
              <BadgeShowcase badges={recentBadges} />
              <LeaderboardPreview
                leaderboardData={leaderboardPreview}
                currentUserId={profile?.id || profile?._id || user?.id}
              />
              <ActivityFeed activities={recentActivities} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
