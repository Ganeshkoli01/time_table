import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, CheckCircle2, AlertCircle, Save, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import api from '../utils/api';

import type { TaskDetail } from '../types';

interface TaskDetailModalProps {
  task: TaskDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !task) return null;

  const [notes, setNotes] = useState(task.notes || '');
  const [whatLearned, setWhatLearned] = useState(task.whatLearned || '');
  const [problemsFaced, setProblemsFaced] = useState(task.problemsFaced || '');
  const [timeSpent, setTimeSpent] = useState(task.timeSpent || '');
  const [description, setDescription] = useState(task.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNotes(task.notes || '');
    setWhatLearned(task.whatLearned || '');
    setProblemsFaced(task.problemsFaced || '');
    setTimeSpent(task.timeSpent || '');
    setDescription(task.description || '');
  }, [task]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tasks/${task._id}`, {
        notes,
        whatLearned,
        problemsFaced,
        timeSpent,
        description
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating task details:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task.isCustom) return;
    if (!confirm('Are you sure you want to delete this custom task?')) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-50 dark:from-slate-800 to-white dark:to-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {task.subject}
              </span>
              <span className={clsx(
                "text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1",
                task.completed ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
              )}>
                {task.completed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{task.taskName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
              <Clock size={12} /> {task.startTime} - {task.endTime} • {task.date}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Description / Target
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solve 20 Quant questions or practice React Redux"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Time Actually Spent */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Time Actually Spent (hours / mins)
            </label>
            <input
              type="text"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              placeholder="e.g. 1 hr 15 mins"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Notes & Study Summary
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Practiced topics, formulas covered, links..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* What I Learned */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              What I Learned Today
            </label>
            <textarea
              rows={2}
              value={whatLearned}
              onChange={(e) => setWhatLearned(e.target.value)}
              placeholder="Key concepts grasped, new algorithms, interview tips..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Problems Faced */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Problems Faced / Doubts
            </label>
            <textarea
              rows={2}
              value={problemsFaced}
              onChange={(e) => setProblemsFaced(e.target.value)}
              placeholder="Difficult questions, tricky syntax, areas to revisit..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {task.isCustom ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <Trash2 size={14} /> Delete Custom Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailModal;
