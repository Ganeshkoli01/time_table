import React from 'react';
import { CheckCircle2, XCircle, Clock, BookOpen, FileText, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { TaskDetail, Task } from '../types';

interface TaskCardProps {
  task: TaskDetail;
  onToggle: (id: string) => void;
  onOpenDetail: (task: TaskDetail) => void;
}

const getSubjectBadge = (subject: string) => {
  switch (subject) {
    case 'Aptitude':
      return {
        label: '📚 Aptitude',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
      };
    case 'English Communication':
      return {
        label: '🗣 English Communication',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
      };
    case 'Web Development':
      return {
        label: '💻 Web Development',
        badge: 'bg-sky-100 text-sky-900 border-sky-300 font-bold'
      };
    case 'Data Analytics':
      return {
        label: '📊 Data Analytics',
        badge: 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
      };
    case 'College':
      return {
        label: '🎓 College',
        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-medium'
      };
    case 'Interview Prep':
      return {
        label: '💼 Interview Prep',
        badge: 'bg-teal-100 text-teal-900 border-teal-300 font-medium'
      };
    case 'Career':
      return {
        label: '🚀 Career / GitHub',
        badge: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-medium'
      };
    case 'Revision':
      return {
        label: '🔄 Revision',
        badge: 'bg-violet-100 text-violet-900 border-violet-300 font-medium'
      };
    default:
      return {
        label: `⚡ ${subject}`,
        badge: 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
      };
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onOpenDetail }) => {
  const isCompleted = task.completed;
  const subjectInfo = getSubjectBadge(task.subject);

  return (
    <div
      className={clsx(
        "relative rounded-2xl border-2 p-4 md:p-5 mb-3.5 transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer select-none",
        isCompleted
          ? "bg-emerald-50/90 border-emerald-300 hover:border-emerald-400"
          : "bg-rose-50/70 border-rose-200 hover:border-rose-300"
      )}
      onClick={() => onOpenDetail(task)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Subject badge */}
            <span
              className={clsx(
                "text-xs px-2.5 py-1 rounded-full border shadow-2xs inline-flex items-center",
                subjectInfo.badge
              )}
            >
              {subjectInfo.label}
            </span>

            {/* Timing */}
            <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
              <Clock size={12} className="mr-1 text-slate-500" />
              {task.startTime} - {task.endTime}
            </span>

            {task.isCustom && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Custom
              </span>
            )}
          </div>

          <h3
            className={clsx(
              "text-base md:text-lg font-bold tracking-tight mb-1 truncate transition-colors",
              isCompleted ? "text-emerald-950 line-through decoration-emerald-500/50" : "text-slate-900"
            )}
          >
            {task.taskName}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-600 line-clamp-1 mb-1 font-medium">
              {task.description}
            </p>
          )}

          {task.notes && (
            <div className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 mt-1">
              <FileText size={11} /> Notes Added
            </div>
          )}
        </div>

        {/* Right completion action */}
        <div 
          className="flex items-center gap-2 self-end sm:self-center"
          onClick={(e) => e.stopPropagation()} // don't open modal when clicking button
        >
          <button
            onClick={() => onToggle(task._id)}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 shadow-sm transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1",
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
                : "bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 focus:ring-rose-500"
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-200" />
                <span>✓ Completed</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-rose-500" />
                <span>✗ Pending</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenDetail(task)}
            title="View Details & Notes"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl border border-transparent hover:border-slate-200 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
