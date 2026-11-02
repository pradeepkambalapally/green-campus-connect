import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  LayoutDashboard,
  Map,
  BookOpen,
  HelpCircle,
  Trophy,
  Award,
  User,
  LogOut,
  X,
  Flame,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Learning Map', path: '/learning-map', icon: Map, badge: 'Adventure' },
  { name: 'My Learning', path: '/my-learning', icon: BookOpen },
  { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
  { name: 'Challenges', path: '/challenges', icon: Trophy },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'My Badges', path: '/badges', icon: Award },
  { name: 'Profile', path: '/profile', icon: User },
];

const DashboardSidebar = ({ isOpen, onClose, studentData }) => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const streak = studentData?.profile?.streak ?? user?.streak ?? 0;
  const level = studentData?.profile?.level ?? user?.level ?? 1;
  const levelTitle = studentData?.profile?.levelTitle ?? 'Eco Seedling';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-emerald-100/70 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-100">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight flex items-center gap-1.5 text-base">
              Green Campus
            </h1>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Student Adventure
            </span>
          </div>
        </NavLink>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Streak & Level mini-banner */}
      <div className="px-4 pt-4">
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50/60 rounded-xl border border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Daily Streak</p>
              <p className="text-sm font-bold text-gray-800">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded-full">
              Lvl {level}
            </span>
            <p className="text-[10px] text-emerald-800 font-medium mt-0.5 truncate max-w-[80px]">
              {levelTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Student Portal
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                    : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-emerald-200" />}
                </>
              )}
            </NavLink>
          );
        })}

        {isAdmin && (
          <div className="pt-3">
            <div className="px-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </div>
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Admin Console</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Logout / User footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (fixed left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
