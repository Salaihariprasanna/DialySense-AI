import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  CheckCheck, 
  Filter, 
  Clock, 
  AlertOctagon,
  Info
} from 'lucide-react';
import { acknowledgeAlert, acknowledgeAllAlerts } from '../services/api';

export default function Alerts({ alerts = [], onRefresh, onNotification }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [unackOnly, setUnackOnly] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (unackOnly && a.is_acknowledged) return false;
    return true;
  });

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id, 'Clinical Staff');
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Alert Acknowledged',
          message: `Alert #${id} marked as acknowledged.`
        });
      }
      onRefresh();
    } catch (err) {
      console.error('Ack error:', err);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await acknowledgeAllAlerts();
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'All Alerts Acknowledged',
          message: 'All pending alarms cleared from active queue.'
        });
      }
      onRefresh();
    } catch (err) {
      console.error('Ack all error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            Smart Alert & Clinical Incident Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time threshold and AI risk-driven alerts for hemodialysis abnormalities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all"
          >
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <span>Acknowledge All</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                severityFilter === sev
                  ? (sev === 'CRITICAL' ? 'bg-rose-600 text-white' : (sev === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white'))
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <label className="flex items-center space-x-2 cursor-pointer text-slate-300 select-none">
          <input 
            type="checkbox"
            checked={unackOnly}
            onChange={(e) => setUnackOnly(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Unacknowledged Only</span>
        </label>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            const cardBorder = isCritical 
              ? 'border-rose-800/80 bg-rose-950/20' 
              : (isWarning ? 'border-amber-800/80 bg-amber-950/20' : 'border-slate-800 bg-slate-900/90');

            const badgeBg = isCritical
              ? 'bg-rose-600 text-white animate-pulse'
              : (isWarning ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white');

            const Icon = isCritical ? AlertOctagon : (isWarning ? AlertTriangle : Info);

            return (
              <div 
                key={alert.id}
                className={`border rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${cardBorder}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    isCritical ? 'bg-rose-500/20 text-rose-400' : (isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badgeBg}`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{alert.title}</h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                      {alert.message}
                    </p>
                    {alert.is_acknowledged && (
                      <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Acknowledged by {alert.acknowledged_by || 'Staff'} at {new Date(alert.acknowledged_at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acknowledge Button */}
                {!alert.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="self-end md:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-200">No active alerts matching filter criteria</p>
            <p className="text-slate-400 mt-1">All hemodialysis clinical parameters are within baseline tolerances.</p>
          </div>
        )}
      </div>
    </div>
  );
}
