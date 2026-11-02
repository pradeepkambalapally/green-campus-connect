import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LearningMap from './pages/LearningMap';
import LearningModule from './pages/LearningModule';
import PlaceholderPage from './pages/PlaceholderPage';

// Loading spinner component
const LoadingScreen = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="text-2xl">🌿</span>
      </div>
      <p className="text-emerald-700 font-medium">Loading Green Campus Connect...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public-only route (redirect logged-in users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-map"
            element={
              <ProtectedRoute>
                <LearningMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute>
                <LearningMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modules/:id"
            element={
              <ProtectedRoute>
                <LearningModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <LearningMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="Campus Challenges"
                  milestone="Milestone 5 (Upcoming)"
                  description="Browse active sustainability missions, participate in plastic-free drives, and submit photo evidence."
                  icon="🏆"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges/:id"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="Challenge Details & Evidence Submission"
                  milestone="Milestone 5 (Upcoming)"
                  description="Submit photo proof and descriptions for administrator verification and reward points."
                  icon="📸"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="Campus Leaderboard"
                  milestone="Milestone 7 (Upcoming)"
                  description="Compare total sustainability XP, track peer rankings, and celebrate the top eco champions."
                  icon="👑"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="My Badges & Accolades"
                  milestone="Milestone 7 (Upcoming)"
                  description="View unlocked achievements like Eco Beginner, Water Guardian, and Waste Warrior."
                  icon="🏅"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PlaceholderPage
                  title="Student Profile"
                  milestone="Student Settings"
                  description="Manage your student sustainability profile, avatar, credentials, and track your all-time metrics."
                  icon="👤"
                />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <PlaceholderPage
                  title="Admin Dashboard"
                  milestone="Milestone 6 (Upcoming)"
                  description="Administrative review of student photo submissions, module management, and institutional analytics."
                  icon="🛡️"
                />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
