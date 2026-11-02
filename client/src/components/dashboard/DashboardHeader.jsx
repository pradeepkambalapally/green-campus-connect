import { Menu, Sparkles, Bell, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const getInitials = (name = '') => {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const DashboardHeader = ({ onOpenSidebar, profile }) => {
  const name = profile?.name || 'Student';
  const initials = getInitials(name);
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;

  return (
    <header className="sticky top-0 z-20 bg-cream/80 backdrop-blur-md border-b border-emerald-100/60 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & page greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-emerald-800 hover:bg-emerald-100/50 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 flex items-center gap-2">
              <span>Eco Dashboard</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Hub
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Track your sustainability learning, achievements & campus impact.
            </p>
          </div>
        </div>

        {/* Right: Quick Stats & Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* XP pill */}
          <Link
            to="/leaderboard"
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 hover:bg-amber-100/70 transition-colors text-xs font-bold"
            title="View Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{xp.toLocaleString()} XP</span>
          </Link>

          {/* Level pill */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-600/20">
            Lvl {level}
          </span>

          {/* Student Profile Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-white/80 transition-colors border border-transparent hover:border-emerald-200"
            title="View Profile"
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-forest flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 hidden md:inline truncate max-w-[120px]">
              {name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

