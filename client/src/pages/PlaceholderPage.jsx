import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const PlaceholderPage = ({ title, milestone, description, icon = '🌱' }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream bg-nature-pattern flex">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          profile={{ name: user?.name, xp: user?.xp, level: user?.level }}
        />

        <main className="flex-1 p-6 sm:p-10 flex items-center justify-center">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-emerald-100 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center text-3xl mx-auto mb-5 shadow-xs">
              {icon}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{milestone}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
              {title}
            </h1>

            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaceholderPage;
