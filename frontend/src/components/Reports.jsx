import React, { useState } from 'react';
import { FileText, Download, Play, CheckCircle2, Clock, ShieldAlert, Activity, Sparkles } from 'lucide-react';
import { generateSessionReport } from '../services/api';

export default function Reports({ sessions = [], onNotification }) {
  const [generatingId, setGeneratingId] = useState(null);
  const [lastGeneratedReport, setLastGeneratedReport] = useState(null);

  const handleGenerateReport = async (sessionId) => {
    try {
      setGeneratingId(sessionId);
      const res = await generateSessionReport(sessionId);
      setLastGeneratedReport(res.data);
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'PDF Report Ready',
          message: `Generated clinical session report: ${res.data.filename}`
        });
      }
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setGeneratingId(null);
    }
  };

  const API_HOST = 'http://localhost:8000';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-400" />
          Clinical Hemodialysis Session Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Export automated ReportLab PDF clinical summaries, hemodynamic trends & AI risk logs
        </p>
      </div>

      {/* Generated Report Highlight Banner */}
      {lastGeneratedReport && (
        <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {lastGeneratedReport.report_code}
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Report Compiled
                </span>
              </div>
              <p className="text-xs text-slate-200 font-semibold mt-0.5">
                {lastGeneratedReport.filename}
              </p>
            </div>
          </div>

          <a
            href={`${API_HOST}${lastGeneratedReport.download_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Session Code</th>
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Machine Unit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Prescribed Target</th>
                <th className="py-3 px-4">Treatment Time</th>
                <th className="py-3 px-4 text-right">PDF Generator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sessions.map((s) => {
                const isOngoing = s.status === 'ONGOING';
                const isGenerating = generatingId === s.id;

                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {s.session_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{s.patient?.name || `Patient #${s.patient_id}`}</div>
                      <div className="text-[11px] text-slate-400">{s.patient?.disease_stage || 'Stage 5 CKD'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {s.machine?.machine_code || 'DIALY-01'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isOngoing ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.target_duration_mins} min • {s.target_uf_volume_ml} mL UF
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(s.start_time).toLocaleDateString()} {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleGenerateReport(s.id)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all"
                      >
                        {isGenerating ? (
                          <>
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                            <span>Building PDF...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5" />
                            <span>Generate PDF</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
