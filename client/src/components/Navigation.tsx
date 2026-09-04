import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, History, Flame, Settings, Sparkles, Clock } from 'lucide-react';
import clsx from 'clsx';
import api from '../utils/api';

interface NavigationProps {
  mobile?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ mobile }) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchStreak();

    const handleUpdate = () => fetchStreak();
    window.addEventListener('streakUpdated', handleUpdate);
    
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => {
      window.removeEventListener('streakUpdated', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const fetchStreak = async () => {
    try {
      const res = await api.get('/progress/streak');
      setCurrentStreak(res.data.currentStreak || 0);
    } catch {
      // Ignore initial error
    }
  };

  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/timetable', icon: Calendar, label: 'Timetable' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/streak', icon: Flame, label: 'Streak' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (mobile) {
    return (
      <nav className="flex w-full justify-around items-center p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200',
                isActive ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            <Icon size={20} />
            <span className="text-[10px] mt-0.5 font-bold">{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full p-4 space-y-2 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 p-2.5 mb-4 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
          <img
            src="/logo.png?v=2"
            alt="Placement Preparation Tracker Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-black text-base tracking-tight leading-tight text-slate-900 dark:text-white">
            Placement Prep
          </h1>
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Tracker & Blueprint</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="space-y-1.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            <Icon size={19} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {/* Daily Streak Widget in Sidebar */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-500/10 dark:to-orange-500/5 rounded-2xl border border-orange-200 dark:border-orange-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Streak</span>
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center gap-1">
              🔥 {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Maintain &gt;= 70% daily completion to grow your streak!
          </p>
        </div>

        {/* 24-Hour Clock */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
             <Clock size={14} /> Local Time
           </span>
           <span className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-wider font-mono">
             {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
