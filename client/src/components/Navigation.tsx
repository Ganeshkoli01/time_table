import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, History, Flame, Settings, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import api from '../utils/api';

interface NavigationProps {
  mobile?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ mobile }) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    fetchStreak();
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
      <nav className="flex w-full justify-around items-center p-2 bg-white/95 backdrop-blur-md border-t border-slate-200">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200',
                isActive ? 'text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-900'
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
    <nav className="flex flex-col w-64 bg-white border-r border-slate-200 h-full p-4 space-y-2 select-none">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 p-2.5 mb-4 text-slate-800">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100 bg-white p-0.5">
          <img
            src="/logo.png?v=2"
            alt="Placement Preparation Tracker Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-black text-base tracking-tight leading-tight text-slate-900">
            Placement Prep
          </h1>
          <p className="text-[11px] font-bold text-blue-600">Tracker & Blueprint</p>
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
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Icon size={19} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Daily Streak Widget in Sidebar */}
      <div className="mt-auto p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-orange-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">Daily Streak</span>
          <span className="text-xs font-black text-orange-600 flex items-center gap-1">
            🔥 {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium">
          Maintain &gt;= 70% daily completion to grow your streak!
        </p>
      </div>
    </nav>
  );
};

export default Navigation;
