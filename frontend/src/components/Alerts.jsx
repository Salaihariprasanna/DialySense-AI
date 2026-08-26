import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Filter, 
  AlertOctagon, 
  Info,
  Check
} from 'lucide-react';
import { acknowledgeAlert } from '../services/api';

export default function Alerts({ alerts = [], onRefresh, onNotification }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [unackOnly, setUnackOnly] = useState(false);

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      if (onNotification) {
        onNotification({
          type: 'info',
          title: 'Alarm Acknowledged',
          message: 'Clinical incident marked as reviewed by duty nurse.'
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Ack alert error:', err);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      const unackAlerts = alerts.filter(a => !a.is_acknowledged);
      await Promise.all(unackAlerts.map(a => acknowledgeAlert(a.id)));
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'All Alarms Cleared',
          message: `Acknowledged ${unackAlerts.length} clinical alarms.`
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Ack all error:', err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (unackOnly && a.is_acknowledged) return false;
    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.is_acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING' && !a.is_acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Clinical Alarms & Incident Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time threshold violation logs, alarm prioritization & nursing sign-off
          </p>
        </div>

        {alerts.some(a => !a.is_acknowledged) && (
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs transition-all self-start sm:self-auto"
          >
            <Check className="h-4 w-4" />
            <span>Acknowledge All ({alerts.filter(a => !a.is_acknowledged).length})</span>
          </button>
        )}
      </div>

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => {
            const count = sev === 'ALL' 
              ? alerts.length 
              : alerts.filter(a => a.severity === sev).length;
            
            const isSelected = severityFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{sev}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unack Toggle */}
        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={unackOnly}
            onChange={(e) => setUnackOnly(e.target.checked)}
            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>Unacknowledged Only</span>
        </label>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';

            const cardBorder = alert.is_acknowledged 
              ? 'border-slate-200/80 bg-white opacity-85' 
              : (isCrit ? 'border-rose-200 bg-rose-50/50 shadow-danger' : (isWarn ? 'border-amber-200 bg-amber-50/50 shadow-warning' : 'border-sky-200 bg-sky-50/50'));

            return (
              <div
                key={alert.id}
                className={`border rounded-3xl p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBorder}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-2xl border ${
                    isCrit 
                      ? 'bg-rose-100/70 border-rose-300 text-rose-700' 
                      : (isWarn ? 'bg-amber-100/70 border-amber-300 text-amber-700' : 'bg-sky-100/70 border-sky-300 text-sky-700')
                  }`}>
                    {isCrit ? <AlertOctagon className="h-5 w-5 animate-pulse" /> : (isWarn ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isCrit ? 'bg-rose-600 text-white' : (isWarn ? 'bg-amber-500 text-white' : 'bg-sky-600 text-white')
                      }`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1 max-w-3xl">
                      {alert.message}
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500 font-mono">
                      <span>Time: {new Date(alert.timestamp).toLocaleTimeString()} ({new Date(alert.timestamp).toLocaleDateString()})</span>
                      <span>•</span>
                      <span>Event Code: {alert.alert_type}</span>
                    </div>
                  </div>
                </div>

                {/* Ack Button / Status */}
                <div className="self-end md:self-auto shrink-0">
                  {alert.is_acknowledged ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-all"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Alarms Matching Filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              All hemodialysis physiological vitals and circuit parameters are currently within safe limits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
