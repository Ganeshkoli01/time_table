import React, { useState, useEffect } from 'react';
import { Flame, Award, Calendar, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import api from '../utils/api';
import clsx from 'clsx';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  daysCompleted: number;
  successfulDates: string[];
}

const Streak = () => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/streak');
      setStreak(res.data);
    } catch (err) {
      console.error('Error fetching streak:', err);
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    { days: 3, title: 'Seedling Habit', desc: '3 consecutive days of 70%+ completion' },
    { days: 7, title: 'Weekly Warrior', desc: '7 days of unbroken dedication' },
    { days: 14, title: 'Focus Master', desc: '2 full weeks of disciplined prep' },
    { days: 30, title: 'Placement Pro', desc: '1 month consistent powerhouse' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-800 dark:text-orange-400 text-xs font-bold mb-2">
          <Flame size={14} className="text-orange-600 dark:text-orange-500 fill-orange-500" /> Consistency Tracker
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          🔥 Consistency & Daily Streaks
        </h1>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
          Complete at least 70% of each day's tasks to maintain your streak.
        </p>
      </header>

      {/* Main Streak Card */}
      {streak && (
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-orange-100">
                Current Daily Streak
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-5xl md:text-6xl font-black">
                  {streak.currentStreak}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-orange-100">
                  {streak.currentStreak === 1 ? 'Day' : 'Days'} 🔥
                </span>
              </div>
              <p className="text-xs text-orange-100/90 font-medium mt-2 max-w-sm">
                Rule: A day counts as successful if you complete at least 70% of its scheduled tasks.
              </p>
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-2 gap-3 bg-black/15 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
              <div className="text-center px-3">
                <div className="text-[11px] text-orange-100 font-bold uppercase">Longest Streak</div>
                <div className="text-2xl font-black text-white">{streak.longestStreak} Days</div>
              </div>
              <div className="text-center px-3 border-l border-white/20">
                <div className="text-[11px] text-orange-100 font-bold uppercase">Days Completed</div>
                <div className="text-2xl font-black text-white">{streak.daysCompleted} Days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak Milestones */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          🏆 Streak Milestones
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {milestones.map((m) => {
            const isAchieved = streak ? streak.longestStreak >= m.days : false;

            return (
              <div
                key={m.days}
                className={clsx(
                  "p-5 rounded-3xl border transition-all flex items-start gap-4",
                  isAchieved
                    ? "bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700/50 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70"
                )}
              >
                <div
                  className={clsx(
                    "p-3 rounded-2xl",
                    isAchieved ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                  )}
                >
                  <Award size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-200">{m.title}</h3>
                    {isAchieved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.desc}</p>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-500 mt-2">
                    Requirement: {m.days} days streak
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Advice Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-3xl p-6 flex items-center gap-4 transition-colors">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-2xl shrink-0">
          <Zap size={24} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Pro Tip for Consistency</h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-400/80 mt-1 leading-relaxed">
            "Consistency is more important than studying 12 hours one day and nothing the next day. Small daily wins compound into placement offers!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Streak;
