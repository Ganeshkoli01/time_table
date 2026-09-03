import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import api from '../utils/api';
import clsx from 'clsx';
import { BarChart3, Target, Clock, CheckCircle2, TrendingUp, Award } from 'lucide-react';

interface SubjectStat {
  totalTasks: number;
  completedTasks: number;
  scheduledHours: number;
  targetHours: number;
  completedHours: number;
  pendingHours: number;
  completionPercentage: number;
}

interface ProgressResponse {
  subjects: {
    [key: string]: SubjectStat;
  };
  totalWeeklyCompletion: number;
  totalCompletedHours: number;
  totalTargetHours: number;
}

const subjectMeta: { [key: string]: { icon: string; bg: string; text: string; bar: string; lightBg: string } } = {
  'Aptitude': {
    icon: '📚',
    bg: 'bg-amber-500',
    text: 'text-amber-800',
    bar: 'bg-amber-500',
    lightBg: 'bg-amber-100'
  },
  'English Communication': {
    icon: '🗣',
    bg: 'bg-emerald-500',
    text: 'text-emerald-800',
    bar: 'bg-emerald-500',
    lightBg: 'bg-emerald-100'
  },
  'Web Development': {
    icon: '💻',
    bg: 'bg-sky-500',
    text: 'text-sky-800',
    bar: 'bg-sky-500',
    lightBg: 'bg-sky-100'
  },
  'Data Analytics': {
    icon: '📊',
    bg: 'bg-purple-500',
    text: 'text-purple-800',
    bar: 'bg-purple-500',
    lightBg: 'bg-purple-100'
  }
};

const Progress = () => {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
  
  const startDateStr = format(start, 'yyyy-MM-dd');
  const endDateStr = format(end, 'yyyy-MM-dd');
  const displayRange = `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/progress/weekly?startDate=${startDateStr}&endDate=${endDateStr}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
          <TrendingUp size={14} className="text-blue-600" /> Weekly Subject Metrics
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          📊 Subject-Wise & Weekly Progress
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          Week: {displayRange}
        </p>
      </header>

      {/* Weekly Overall Summary Card */}
      {data && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-300">
                Total Weekly Summary
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-1">
                {data.totalWeeklyCompletion}% Completed
              </h2>
            </div>
            <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div>
                <div className="text-[11px] text-blue-200 uppercase font-bold">Done</div>
                <div className="text-lg font-black text-emerald-400">{data.totalCompletedHours} hrs</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <div className="text-[11px] text-blue-200 uppercase font-bold">Target</div>
                <div className="text-lg font-black text-white">{data.totalTargetHours} hrs</div>
              </div>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3.5 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, data.totalWeeklyCompletion)}%` }}
            />
          </div>
          <p className="text-xs text-blue-200/80 font-medium">
            Based on all completed study hours across Aptitude, English, Web Dev, and Data Analytics.
          </p>
        </div>
      )}

      {/* Subject-Wise Progress Cards (Requirement 8) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Main Placement Subjects
        </h2>

        {loading ? (
          <div className="text-center py-16 text-slate-400 font-semibold animate-pulse">
            Loading subject progress...
          </div>
        ) : data && data.subjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(data.subjects).map((subKey) => {
              const sub = data.subjects[subKey];
              const meta = subjectMeta[subKey] || {
                icon: '📌',
                bg: 'bg-slate-500',
                text: 'text-slate-800',
                bar: 'bg-blue-600',
                lightBg: 'bg-slate-100'
              };

              return (
                <div
                  key={subKey}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{meta.icon}</span>
                        <h3 className={clsx("font-black text-lg", meta.text)}>
                          {subKey}
                        </h3>
                      </div>
                      <span className="text-2xl font-black text-slate-900">
                        {sub.completionPercentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className={clsx("w-full rounded-full h-3 mb-4 overflow-hidden", meta.lightBg)}>
                      <div
                        className={clsx("h-full rounded-full transition-all duration-1000", meta.bar)}
                        style={{ width: `${Math.min(100, sub.completionPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Hours breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Target</div>
                      <div className="text-sm font-black text-slate-800">{sub.targetHours} hrs</div>
                    </div>
                    <div className="border-x border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
                      <div className="text-sm font-black text-emerald-600">{sub.completedHours} hrs</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
                      <div className="text-sm font-black text-rose-500">{sub.pendingHours} hrs</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400 font-medium">
            No progress recorded yet for this week.
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
