import React from 'react';
import { 
  Users, 
  Activity, 
  Layers, 
  Cpu, 
  AlertTriangle, 
  ShieldAlert, 
  Heart, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({ 
  stats, 
  activeSession, 
  latestTelemetry, 
  latestRisk, 
  recentAlerts, 
  setActiveTab 
}) {
  const telemetry = latestTelemetry || {
    heart_rate: 76,
    spo2: 98,
    systolic_bp: 120,
    diastolic_bp: 80,
    temperature: 36.8,
    blood_flow_rate: 300,
    dialysis_pressure: 120,
    machine_status: 'RUNNING'
  };

  const risk = latestRisk || {
    risk_level: 'LOW',
    risk_score: 12,
    factors: ['All hemodynamic parameters within normal ranges.'],
    recommendation: 'Stable baseline.'
  };

  const riskColor = risk.risk_level === 'HIGH' 
    ? 'text-rose-400 bg-rose-950/40 border-rose-800/80 shadow-rose-950/50' 
    : (risk.risk_level === 'MODERATE' 
        ? 'text-amber-400 bg-amber-950/40 border-amber-800/80 shadow-amber-950/50' 
        : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80 shadow-emerald-950/50');

  const riskBadge = risk.risk_level === 'HIGH'
    ? 'bg-rose-600 text-white'
    : (risk.risk_level === 'MODERATE' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white');

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Clinical Dialysis Monitoring Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time IoT Hemodialysis Telemetry, Predictive AI Risk Assessment & Incident Engine
          </p>
        </div>
        <button
          onClick={() => setActiveTab('monitor')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
        >
          <span>Open Full Monitor</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Patients */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Patients</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{stats?.totalPatients || 3}</div>
          <span className="text-[10px] text-cyan-400 font-medium">Registered in Ward</span>
        </div>

        {/* Active Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Sessions</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{stats?.activeSessions || 1}</div>
          <span className="text-[10px] text-emerald-500 font-medium">In Treatment</span>
        </div>

        {/* Available Machines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Available Units</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">{stats?.availableMachines || 2}</div>
          <span className="text-[10px] text-slate-400 font-medium">Ready for Intake</span>
        </div>

        {/* Running Machines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Running Units</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300">{stats?.runningMachines || 1}</div>
          <span className="text-[10px] text-indigo-400 font-medium">Dialyzing</span>
        </div>

        {/* Warning Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400">{recentAlerts?.length || 0}</div>
          <span className="text-[10px] text-amber-500 font-medium">Unresolved Flags</span>
        </div>

        {/* High Risk Patients */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Risk Watch</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className={`text-xl font-bold ${risk.risk_level === 'HIGH' ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
            {risk.risk_level === 'HIGH' ? 1 : 0}
          </div>
          <span className="text-[10px] text-rose-400 font-medium">Critical Triage</span>
        </div>
      </div>

      {/* Main Monitoring Screen Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Primary Live Session Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {activeSession?.session_code || 'SES-202603-001'}
                </span>
                <h2 className="text-lg font-bold text-slate-100">
                  {activeSession?.patient?.name || 'John Doe'}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  ({activeSession?.patient?.age || 58}y, {activeSession?.patient?.gender || 'Male'}, {activeSession?.patient?.blood_group || 'O+'})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Prescribing Doctor: <span className="text-slate-300 font-medium">{activeSession?.patient?.doctor || 'Dr. Sarah Jenkins'}</span> • Stage: <span className="text-slate-300 font-medium">{activeSession?.patient?.disease_stage || 'Stage 5 CKD'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 ${
                activeSession?.status === 'ONGOING' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                {activeSession?.status || 'ONGOING'}
              </span>
            </div>
          </div>

          {/* Vitals Telemetry Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Heart Rate */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Heart Rate</div>
              <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">
                {telemetry.heart_rate} <span className="text-xs text-slate-400 font-normal">BPM</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Normal: 60–100</div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">SpO2 Oxygen</div>
              <div className={`text-xl sm:text-2xl font-black mt-0.5 ${telemetry.spo2 < 92 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                {telemetry.spo2} <span className="text-xs text-slate-400 font-normal">%</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target: ≥ 95%</div>
            </div>

            {/* Blood Pressure */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Blood Pressure</div>
              <div className={`text-xl sm:text-2xl font-black mt-0.5 ${telemetry.systolic_bp < 85 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                {Math.round(telemetry.systolic_bp)}/{Math.round(telemetry.diastolic_bp)} <span className="text-xs text-slate-400 font-normal">mmHg</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Normal: 120/80</div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Body Temp</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                {telemetry.temperature} <span className="text-xs text-slate-400 font-normal">°C</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Normal: 36.5–37.2</div>
            </div>

            {/* Blood Flow */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Blood Flow</div>
              <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-0.5">
                {telemetry.blood_flow_rate} <span className="text-xs text-slate-400 font-normal">mL/min</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target: 300 mL/min</div>
            </div>

            {/* Dialysis Venous Pressure */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Circuit Pressure</div>
              <div className={`text-xl sm:text-2xl font-black mt-0.5 ${telemetry.dialysis_pressure > 200 ? 'text-rose-400 animate-pulse' : 'text-blue-300'}`}>
                {telemetry.dialysis_pressure} <span className="text-xs text-slate-400 font-normal">mmHg</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Limit: &lt; 180 mmHg</div>
            </div>

            {/* Machine Temperature */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Dialysate Temp</div>
              <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
                {telemetry.machine_temperature || 37.0} <span className="text-xs text-slate-400 font-normal">°C</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Target: 36.5°C</div>
            </div>

            {/* Machine Status */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium">Machine State</div>
              <div className={`text-sm sm:text-base font-black mt-1 uppercase ${
                telemetry.machine_status === 'RUNNING' 
                  ? 'text-emerald-400' 
                  : (telemetry.machine_status === 'ERROR' ? 'text-rose-400 animate-bounce' : 'text-amber-400')
              }`}>
                {telemetry.machine_status || 'RUNNING'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">DialySense Pro</div>
            </div>
          </div>

          {/* Quick Nav Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('digital-twin')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View Virtual Machine Digital Twin</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right Col: AI Risk Prediction Card */}
        <div className={`border rounded-2xl p-5 shadow-xl flex flex-col justify-between ${riskColor}`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  AI Risk Prediction
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${riskBadge}`}>
                {risk.risk_level} RISK
              </span>
            </div>

            {/* Risk Score Display */}
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-black tracking-tight">{risk.risk_score}</div>
                <div className="text-[11px] text-slate-400">Risk Score Index (0–100)</div>
              </div>
              <div className="w-28 bg-slate-950/80 rounded-full h-3 border border-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    risk.risk_score >= 70 ? 'bg-rose-500' : (risk.risk_score >= 35 ? 'bg-amber-500' : 'bg-emerald-500')
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, risk.risk_score))}%` }}
                />
              </div>
            </div>

            {/* Clinical Factors */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contributing Clinical Factors:
              </div>
              <ul className="text-xs space-y-1 text-slate-200">
                {risk.factors && risk.factors.length > 0 ? (
                  risk.factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No abnormal risks detected.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Clinical Recommendation */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
            <span className="font-bold text-slate-200">Clinical Protocol:</span> {risk.recommendation || 'Continue regular protocol.'}
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Recent Smart Alerts & Incidents
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            View All ({recentAlerts?.length || 0})
          </button>
        </div>

        {recentAlerts && recentAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Alert Title</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAlerts.slice(0, 5).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.severity === 'CRITICAL' 
                          ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' 
                          : (a.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-blue-950 text-blue-400 border border-blue-800')
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{a.title}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">{a.message}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      {a.is_acknowledged ? (
                        <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ack
                        </span>
                      ) : (
                        <span className="text-rose-400 text-[11px] font-bold">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mx-auto mb-2" />
            No active alert conditions. Dialysis hemodynamics are stable.
          </div>
        )}
      </div>
    </div>
  );
}
