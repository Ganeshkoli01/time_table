import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Progress from './pages/Progress';
import History from './pages/History';
import Streak from './pages/Streak';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';

const AuthenticatedLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 overflow-hidden font-sans antialiased transition-colors duration-200">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex shrink-0">
        <Navigation />
      </div>
      
      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
          <img src="/logo.png?v=2" alt="Logo" className="w-9 h-9 rounded-xl object-contain shadow-xs border border-slate-100" />
          <div>
            <span className="font-black text-sm text-slate-900 block leading-tight">Placement Prep</span>
            <span className="text-[10px] font-bold text-blue-600 block">Tracker & Blueprint</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <Navigation mobile />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/history" element={<History />} />
                <Route path="/streak" element={<Streak />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
