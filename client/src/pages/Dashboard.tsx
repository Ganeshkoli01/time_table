import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, AlertTriangle, CheckCircle2, Clock, Filter, Sparkles } from 'lucide-react';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import AddTaskModal from '../components/AddTaskModal';
import type { TaskDetail } from '../types';
import clsx from 'clsx';

const Dashboard = () => {
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [missedTasks, setMissedTasks] = useState<TaskDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Modals
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'EEEE, dd MMMM yyyy');

  useEffect(() => {
    fetchTasks();
    fetchMissedTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${dateStr}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissedTasks = async () => {
    try {
      const res = await api.get('/tasks/missed');
      setMissedTasks(res.data);
    } catch (error) {
      console.error('Error fetching missed tasks:', error);
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t._id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      await api.post(`/tasks/${id}/complete`);
      fetchMissedTasks();
      // Notify sidebar to check for streak updates
      window.dispatchEvent(new Event('streakUpdated'));
    } catch (error) {
      console.error('Error toggling task:', error);
      fetchTasks();
    }
  };

  const openDetail = (task: TaskDetail) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const pendingCount = totalCount - completedCount;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Motivational message from requirements
  let motivationMsg = "⚡ You can still complete more tasks today!";
  if (totalCount > 0) {
    if (percentage >= 80) {
      motivationMsg = "🔥 Excellent! Keep going!";
    } else if (percentage >= 50) {
      motivationMsg = "💪 Good progress! Finish the remaining tasks.";
    } else {
      motivationMsg = "⚡ You can still complete more tasks today!";
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="hidden sm:block w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100 bg-white p-1">
            <img src="/logo.png?v=2" alt="Placement Preparation Tracker Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
              <Sparkles size={14} className="text-blue-600" /> Daily Tracker
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              🎯 Placement Preparation Tracker
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {displayDate}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} /> Add Custom Task
        </button>
      </header>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
              Today's Progress
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                {percentage}%
              </h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {motivationMsg}
              </span>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Completed</div>
              <div className="text-lg font-black text-emerald-600">{completedCount}</div>
            </div>
            <div className="w-px bg-slate-200" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Pending</div>
              <div className="text-lg font-black text-rose-500">{pendingCount}</div>
            </div>
            <div className="w-px bg-slate-200" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Total</div>
              <div className="text-lg font-black text-slate-700">{totalCount}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 mb-4 overflow-hidden p-0.5">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-700 ease-out",
              percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-blue-600" : "bg-amber-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Motivation quote */}
        <p className="text-xs text-slate-500 text-center font-medium italic border-t border-slate-100 pt-3">
          "Consistency is more important than studying 12 hours one day and nothing the next day."
        </p>
      </div>

      {/* Missed Tasks Alert Section (Requirement 11) */}
      {missedTasks.length > 0 && (
        <div className="mb-8 bg-rose-50 border border-rose-200 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
            <AlertTriangle size={18} className="text-rose-600" />
            <span>Missed Tasks Alert ({missedTasks.length})</span>
          </div>
          <p className="text-xs text-rose-700 mb-3">
            These tasks were scheduled earlier or on previous days and are still marked pending. Review and complete them!
          </p>
          <div className="space-y-2">
            {missedTasks.slice(0, 3).map(mt => (
              <div
                key={mt._id}
                className="bg-white/90 border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">❌ {mt.taskName}</span>
                  <span className="text-slate-500 ml-2">
                    ({mt.subject} • {mt.date} {mt.startTime})
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(mt._id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                >
                  Mark Done
                </button>
              </div>
            ))}
            {missedTasks.length > 3 && (
              <p className="text-[11px] text-rose-600 text-right font-semibold">
                + {missedTasks.length - 3} more missed tasks
              </p>
            )}
          </div>
        </div>
      )}

      {/* Task List Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Today's Timeline</h2>
          <p className="text-xs text-slate-500">
            Green = Completed • Light Red = Pending. Click any task to edit notes.
          </p>
        </div>

        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-3 py-1 rounded-lg transition-all",
              filter === 'all' ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
            )}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={clsx(
              "px-3 py-1 rounded-lg transition-all",
              filter === 'pending' ? "bg-white text-rose-700 shadow-xs font-bold" : "hover:text-slate-900"
            )}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={clsx(
              "px-3 py-1 rounded-lg transition-all",
              filter === 'completed' ? "bg-white text-emerald-700 shadow-xs font-bold" : "hover:text-slate-900"
            )}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-1">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold animate-pulse">
            Loading today's timetable...
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onOpenDetail={openDetail}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400 font-medium">
            No tasks found in this view.
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdated={() => {
          fetchTasks();
          fetchMissedTasks();
        }}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultDate={dateStr}
        onTaskAdded={() => {
          fetchTasks();
        }}
      />
    </div>
  );
};

export default Dashboard;
