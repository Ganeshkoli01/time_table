import React, { useState, useEffect } from 'react';
import { format, subDays, addDays, isFuture, parseISO } from 'date-fns';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import type { TaskDetail } from '../types';
import clsx from 'clsx';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const History = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyMap, setHistoryMap] = useState<{ [key: string]: { percentage: number; total: number; completed: number } }>({});
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'EEEE, dd MMMM yyyy');

  useEffect(() => {
    fetchHistoryData();
  }, []);

  useEffect(() => {
    fetchTasksForDate(dateStr);
  }, [dateStr]);

  const fetchHistoryData = async () => {
    try {
      const res = await api.get('/progress/history');
      const map: { [key: string]: { percentage: number; total: number; completed: number } } = {};
      res.data.forEach((item: any) => {
        map[item.date] = {
          percentage: item.percentage,
          total: item.total,
          completed: item.completed
        };
      });
      setHistoryMap(map);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchTasksForDate = async (targetDate: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${targetDate}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks for date:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setTasks(prev =>
      prev.map(t => (t._id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.post(`/tasks/${id}/complete`);
      fetchHistoryData();
      // Notify sidebar to check for streak updates
      window.dispatchEvent(new Event('streakUpdated'));
    } catch (error) {
      console.error('Error toggling task:', error);
      fetchTasksForDate(dateStr);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const pendingCount = totalCount - completedCount;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calendar strip (past 14 days)
  const calendarDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = subDays(new Date(), i);
    calendarDays.push(d);
  }

  const getDayStatusColor = (dStr: string) => {
    const entry = historyMap[dStr];
    if (!entry || entry.total === 0) return { dot: 'bg-slate-300', tag: '⚪ No data' };
    if (entry.percentage >= 80) return { dot: 'bg-emerald-500', tag: '🟢 80-100%' };
    if (entry.percentage >= 50) return { dot: 'bg-amber-400', tag: '🟡 50-79%' };
    return { dot: 'bg-rose-500', tag: '🔴 0-49%' };
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-400 text-xs font-bold mb-2">
            <CalendarIcon size={14} className="text-blue-600 dark:text-blue-400" /> Historical Performance
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            📜 History & Calendar View
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
            Pick any past date to inspect or update your permanent records.
          </p>
        </div>

        {/* Direct Date Picker input */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Date:</span>
          <input
            type="date"
            max={format(new Date(), 'yyyy-MM-dd')}
            value={dateStr}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(parseISO(e.target.value));
              }
            }}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </header>

      {/* Calendar Color Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors">
        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">Calendar Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>80-100% Excellent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>50-79% Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>0-49% Poor</span>
        </div>
      </div>

      {/* Interactive 14-Day Calendar Strip */}
      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-3 md:p-4 mb-8 border border-slate-200 dark:border-slate-700/50 shadow-inner transition-colors">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Days Calendar
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 shadow-xs transition-colors disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {calendarDays.map((dayObj) => {
            const curStr = format(dayObj, 'yyyy-MM-dd');
            const isSelected = curStr === dateStr;
            const status = getDayStatusColor(curStr);

            return (
              <button
                key={curStr}
                onClick={() => setSelectedDate(dayObj)}
                className={clsx(
                  "flex flex-col items-center justify-center p-2.5 min-w-[62px] rounded-2xl transition-all shadow-xs",
                  isSelected
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                )}
              >
                <span className="text-[10px] font-bold uppercase mb-0.5">
                  {format(dayObj, 'EEE')}
                </span>
                <span className="text-base font-black mb-1.5">
                  {format(dayObj, 'dd')}
                </span>
                <div className={clsx("w-2.5 h-2.5 rounded-full ring-2 ring-white/50", status.dot)} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Stats Card (Requirement 5) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayDate}</h2>
          <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Tasks: <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong></span>
            <span>•</span>
            <span>Completed: <strong className="text-emerald-600">{completedCount}</strong></span>
            <span>•</span>
            <span>Pending: <strong className="text-rose-500">{pendingCount}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">Completion</span>
            <span
              className={clsx(
                "text-3xl font-black",
                percentage >= 80 ? "text-emerald-600" : percentage >= 50 ? "text-amber-500" : "text-rose-500"
              )}
            >
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Task Cards for selected date */}
      <div className="space-y-1">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-semibold animate-pulse">
            Loading historical tasks...
          </div>
        ) : tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onOpenDetail={(t) => {
                setSelectedTask(t);
                setIsDetailOpen(true);
              }}
            />
          ))
        ) : (
          <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed text-slate-400 font-medium transition-colors">
            No records found for this date.
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={() => {
          fetchTasksForDate(dateStr);
          fetchHistoryData();
        }}
      />
    </div>
  );
};

export default History;
