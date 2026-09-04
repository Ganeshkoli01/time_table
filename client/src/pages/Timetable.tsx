import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ChevronRight, Sparkles, Edit3 } from 'lucide-react';
import api from '../utils/api';
import clsx from 'clsx';
import type { TemplateDay, TemplateTask } from '../types';
import EditTimetableModal from '../components/EditTimetableModal';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getSubjectBadge = (subject: string) => {
  switch (subject) {
    case 'Aptitude':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'English Communication':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Web Development':
      return 'bg-sky-100 text-sky-900 border-sky-300';
    case 'Data Analytics':
      return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'College':
      return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    case 'Interview Prep':
      return 'bg-teal-100 text-teal-900 border-teal-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const Timetable = () => {
  const [templates, setTemplates] = useState<TemplateDay[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Error fetching timetable templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = templates.find(t => t.day === selectedDay);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
          <Calendar size={14} className="text-blue-600" /> Weekly Master Schedule
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          📅 Weekly Timetable Schedule
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          Complete placement preparation blueprint from Monday to Sunday.
        </p>
      </header>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={clsx(
              "px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm whitespace-nowrap transition-all shadow-xs",
              selectedDay === day
                ? "bg-blue-600 text-white shadow-md scale-102"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Day Overview Card */}
      {currentTemplate && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {currentTemplate.day}'s Timetable
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Total Activities: {currentTemplate.tasks.length}
                </p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="ml-2 p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all flex items-center justify-center shrink-0"
                title="Edit Timetable"
              >
                <Edit3 size={18} />
              </button>
            </div>

            {/* Quick stats pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Aptitude
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Web Dev
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                Data Analytics
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                English
              </span>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="divide-y divide-slate-100">
            {currentTemplate.tasks.map((task, idx) => (
              <div
                key={task.taskId || idx}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-6">
                    {idx + 1}.
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{task.taskName}</h3>
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-1",
                        getSubjectBadge(task.subject)
                      )}
                    >
                      {task.subject}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock size={12} className="mr-1.5 text-slate-400" />
                  {task.startTime} - {task.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-slate-400 font-medium animate-pulse">
          Loading master timetable...
        </div>
      )}

      <EditTimetableModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        template={currentTemplate || null} 
        onSaved={fetchTemplates} 
      />
    </div>
  );
};

export default Timetable;
