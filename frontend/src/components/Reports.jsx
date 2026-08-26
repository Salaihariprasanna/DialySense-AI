import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  FileCheck, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { generateSessionReport, getDownloadReportUrl } from '../services/api';

export default function Reports({ sessions = [], onNotification }) {
  const [generatingSessionId, setGeneratingSessionId] = useState(null);
  const [latestGeneratedReport, setLatestGeneratedReport] = useState(null);

  const handleGenerateReport = async (sessionId) => {
    try {
      setGeneratingSessionId(sessionId);
      const res = await generateSessionReport(sessionId);
      setLatestGeneratedReport(res.data);
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Clinical PDF Report Compiled',
          message: `Official session report ${res.data.report_code} generated using ReportLab.`
        });
      }
    } catch (err) {
      console.error('Generate report error:', err);
      if (onNotification) {
        onNotification({
          type: 'danger',
          title: 'Report Generation Failed',
          message: err.response?.data?.detail || 'Error compiling PDF report.'
        });
      }
    } finally {
      setGeneratingSessionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-sky-600" />
            Clinical Dialysis Session Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Automated ReportLab medical session summaries, vital telemetry statistics & physician sign-off documentation
          </p>
        </div>
      </div>

      {/* Generated Report Highlight Card */}
      {latestGeneratedReport && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-white border border-sky-200 shadow-xs">
              <FileCheck className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {latestGeneratedReport.report_code}
                </span>
                <span className="text-xs font-bold text-slate-900">Official Clinical Summary Ready</span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">
                Compiled Document: <span className="font-mono text-slate-900">{latestGeneratedReport.pdf_filename}</span>
              </p>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Generated: {new Date(latestGeneratedReport.generated_at).toLocaleString()}
              </div>
            </div>
          </div>

          <a
            href={getDownloadReportUrl(latestGeneratedReport.pdf_filename)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all self-start md:self-auto"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      )}

      {/* Sessions Report Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Available Dialysis Session Records
          </h3>
          <span className="text-xs text-slate-500 font-medium">{sessions.length} Recorded Sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Session Code</th>
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Assigned Machine</th>
                <th className="py-3.5 px-5">Prescription</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Start Time</th>
                <th className="py-3.5 px-5 text-right">Medical PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => {
                const isGenerating = generatingSessionId === session.id;
                return (
                  <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-sky-700">
                      {session.session_code}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{session.patient?.name || `Patient #${session.patient_id}`}</div>
                      <div className="text-[11px] text-slate-400">{session.patient?.disease_stage || 'Stage 5 CKD'}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">
                      {session.machine?.machine_code || `Unit #${session.machine_id}`}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {session.target_duration_mins} min • {session.target_uf_volume_ml} mL
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        session.status === 'ONGOING' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleGenerateReport(session.id)}
                        disabled={isGenerating}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>{isGenerating ? 'Compiling...' : 'Generate PDF'}</span>
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
