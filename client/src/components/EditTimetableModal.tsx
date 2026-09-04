import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import api from '../utils/api';
import type { TemplateDay, TemplateTask } from '../types';

interface EditTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDay | null;
  onSaved: () => void;
}

const subjectsList = [
  'Aptitude',
  'English Communication',
  'Web Development',
  'Data Analytics',
  'College',
  'Revision',
  'Interview Prep',
  'Career',
  'Routine',
  'Planning'
];

const EditTimetableModal: React.FC<EditTimetableModalProps> = ({
  isOpen,
  onClose,
  template,
  onSaved
}) => {
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setTasks(template.tasks.map(t => ({ ...t })));
    } else {
      setTasks([]);
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  const handleTaskChange = (index: number, field: keyof TemplateTask, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = tasks.filter((_, idx) => idx !== index);
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    const newTask: TemplateTask = {
      taskId: `custom-${Date.now()}`,
      taskName: '',
      subject: 'Routine',
      startTime: '09:00',
      endTime: '10:00'
    };
    setTasks([...tasks, newTask]);
  };

  const handleSave = async () => {
    // Validate empty tasks
    if (tasks.some(t => !t.taskName.trim())) {
      alert("Please provide a name for all tasks.");
      return;
    }

    setLoading(true);
    try {
      // Sort tasks by startTime for neatness
      const sortedTasks = [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      await api.put(`/tasks/templates/${template.day}`, {
        tasks: sortedTasks
      });
      
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving timetable:', err);
      alert('Failed to save timetable template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-t-3xl shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Edit {template.day}'s Timetable
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your master blueprint for {template.day}s</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 flex-1">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-semibold">
                No tasks scheduled for this day yet. Add one!
              </div>
            ) : null}

            {tasks.map((task, idx) => (
              <div key={task.taskId || idx} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm items-start sm:items-center">
                
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    required
                    value={task.taskName}
                    onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                    placeholder="Task Name (e.g. Morning Walk)"
                    className="w-full text-sm font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="w-full sm:w-40 shrink-0">
                  <select
                    value={task.subject}
                    onChange={(e) => handleTaskChange(idx, 'subject', e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 transition-all text-slate-600 dark:text-slate-300"
                  >
                    {subjectsList.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <input
                    type="time"
                    required
                    value={task.startTime}
                    onChange={(e) => handleTaskChange(idx, 'startTime', e.target.value)}
                    className="w-28 text-xs font-mono font-semibold px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="text-slate-400 dark:text-slate-500 font-bold">-</span>
                  <input
                    type="time"
                    required
                    value={task.endTime}
                    onChange={(e) => handleTaskChange(idx, 'endTime', e.target.value)}
                    className="w-28 text-xs font-mono font-semibold px-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTask(idx)}
                  className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto sm:ml-0"
                  title="Remove Task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddTask}
            className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Plus size={18} /> Add Another Task
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-3xl shrink-0 transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Timetable'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTimetableModal;
