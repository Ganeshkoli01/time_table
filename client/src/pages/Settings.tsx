import React, { useState, useRef } from 'react';
import { Download, Upload, Shield, User, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const Settings = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const res = await api.get('/tasks/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `placement_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setMessage({ type: 'success', text: 'Data exported successfully as JSON!' });
    } catch (err) {
      console.error('Export error:', err);
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await api.get('/tasks/export');
      const tasks = res.data;
      if (!tasks || tasks.length === 0) {
        setMessage({ type: 'error', text: 'No tasks to export.' });
        return;
      }

      // Convert to CSV
      const headers = ['date', 'day', 'taskName', 'subject', 'startTime', 'endTime', 'completed', 'notes'];
      const rows = tasks.map((t: any) => [
        `"${t.date || ''}"`,
        `"${t.day || ''}"`,
        `"${(t.taskName || '').replace(/"/g, '""')}"`,
        `"${t.subject || ''}"`,
        `"${t.startTime || ''}"`,
        `"${t.endTime || ''}"`,
        `"${t.completed ? 'YES' : 'NO'}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(','));

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `placement_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: 'success', text: 'Data exported successfully as CSV!' });
    } catch (err) {
      console.error('CSV Export error:', err);
      setMessage({ type: 'error', text: 'Failed to export CSV.' });
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const tasks = JSON.parse(text);
      const res = await api.post('/tasks/import', tasks);
      setMessage({
        type: 'success',
        text: `Successfully imported ${res.data.count} task records!`
      });
    } catch (err) {
      console.error('Import error:', err);
      setMessage({
        type: 'error',
        text: 'Failed to import backup file. Please ensure it is valid JSON.'
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          ⚙️ Settings & Data Backup
        </h1>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          Export your preparation history, restore backups, and manage your account.
        </p>
      </header>

      {/* Message alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
            PK
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Placement Prep Aspirant</h3>
            <p className="text-xs text-slate-500 font-medium">Demo User Profile • Local MongoDB</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
          Active
        </span>
      </div>

      {/* Data Export & Backup Card (Requirement 19) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          💾 Backup & Data Export
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Download your complete history so you never lose your placement preparation tracking data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 font-bold text-sm transition-all"
          >
            <Download size={18} className="text-blue-600" />
            <span>{exporting ? 'Exporting...' : 'Export Data (JSON)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 font-bold text-sm transition-all"
          >
            <FileText size={18} className="text-emerald-600" />
            <span>{exporting ? 'Exporting...' : 'Export Data (CSV)'}</span>
          </button>
        </div>

        {/* Import section */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            📥 Restore from Backup
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Upload a previously exported JSON backup file to restore task statuses.
          </p>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors"
          >
            <Upload size={16} className="text-slate-600" />
            <span>{importing ? 'Importing...' : 'Choose JSON Backup File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
