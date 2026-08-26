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
  ArrowRight,
  ShieldCheck,
  Calendar,
  UserCheck
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
    factors: ['All hemodynamic parameters within normal physiological ranges.'],
    recommendation: 'Stable baseline.'
  };

  const isHighRisk = risk.risk_level === 'HIGH';
  const isMedRisk = risk.risk_level === 'MODERATE' || risk.risk_level === 'MEDIUM';

  const riskCardStyle = isHighRisk 
    ? 'bg-rose-50/70 border-rose-200 text-rose-950 shadow-danger' 
    : (isMedRisk 
        ? 'bg-amber-50/70 border-amber-200 text-amber-950 shadow-warning' 
        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-success');

  const riskBadgeStyle = isHighRisk
    ? 'bg-rose-600 text-white animate-pulse'
    : (isMedRisk ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Clinical Dialysis Monitoring Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time IoT Hemodialysis Telemetry, Clinical Risk Stratification & Incident Response
          </p>
        </div>
        <button
          onClick={() => setActiveTab('monitor')}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <span>Open Full Telemetry</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Patients */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Patients</span>
            <Users className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalPatients || 3}</div>
          <span className="text-[11px] text-slate-500 font-medium">Registered in Ward</span>
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Sessions</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats?.activeSessions || 1}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">In Treatment</span>
        </div>

        {/* Available Machines */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Units</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.availableMachines || 2}</div>
          <span className="text-[11px] text-slate-500 font-medium">Ready for Intake</span>
        </div>

        {/* Running Machines */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Running Units</span>
            <Cpu className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-800">{stats?.runningMachines || 1}</div>
          <span className="text-[11px] text-cyan-700 font-semibold">Dialyzing</span>
        </div>

        {/* Warning Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Alarms</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{recentAlerts?.length || 0}</div>
          <span className="text-[11px] text-amber-700 font-medium">Incident Flags</span>
        </div>

        {/* High Risk Patients */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Risk Watch</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className={`text-2xl font-black ${isHighRisk ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {isHighRisk ? 1 : 0}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Critical Triage</span>
        </div>
      </div>

      {/* Main Monitoring Screen Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Primary Live Session Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono text-sky-700 font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200">
                  {activeSession?.session_code || 'SES-202603-001'}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeSession?.patient?.name || 'John Doe'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  ({activeSession?.patient?.age || 58}y, {activeSession?.patient?.gender || 'Male'}, {activeSession?.patient?.blood_group || 'O+'})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Attending Nephrologist: <span className="text-slate-800 font-semibold">{activeSession?.patient?.doctor || 'Dr. Sarah Jenkins'}</span> • Diagnosis: <span className="text-slate-800 font-semibold">{activeSession?.patient?.disease_stage || 'Stage 5 CKD'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                activeSession?.status === 'ONGOING' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{activeSession?.status || 'ONGOING'}</span>
              </span>
            </div>
          </div>

          {/* Vitals Telemetry Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Heart Rate */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Heart Rate</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {telemetry.heart_rate} <span className="text-xs text-slate-500 font-normal">BPM</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Normal: 60–100</div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">SpO2 Oxygen</div>
              <div className={`text-2xl font-black mt-1 ${telemetry.spo2 < 93 ? 'text-rose-600 animate-pulse' : 'text-sky-600'}`}>
                {telemetry.spo2} <span className="text-xs text-slate-500 font-normal">%</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Target: ≥ 95%</div>
            </div>

            {/* Blood Pressure */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Blood Pressure</div>
              <div className={`text-2xl font-black mt-1 ${telemetry.systolic_bp < 85 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                {Math.round(telemetry.systolic_bp)}/{Math.round(telemetry.diastolic_bp)} <span className="text-xs text-slate-500 font-normal">mmHg</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Normal: 120/80</div>
            </div>

            {/* Temperature */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Body Temp</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {telemetry.temperature} <span className="text-xs text-slate-500 font-normal">°C</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Normal: 36.5–37.2</div>
            </div>

            {/* Blood Flow */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Blood Flow</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {telemetry.blood_flow_rate} <span className="text-xs text-slate-500 font-normal">mL/min</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Target: 300 mL/min</div>
            </div>

            {/* Dialysis Venous Pressure */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Circuit Pressure</div>
              <div className={`text-2xl font-black mt-1 ${telemetry.dialysis_pressure > 200 ? 'text-rose-600 animate-pulse' : 'text-teal-600'}`}>
                {telemetry.dialysis_pressure} <span className="text-xs text-slate-500 font-normal">mmHg</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Limit: &lt; 180 mmHg</div>
            </div>

            {/* Machine Temperature */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Dialysate Temp</div>
              <div className="text-2xl font-black text-cyan-700 mt-1">
                {telemetry.machine_temperature || 37.0} <span className="text-xs text-slate-500 font-normal">°C</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Target: 36.5°C</div>
            </div>

            {/* Machine Status */}
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Machine State</div>
              <div className={`text-sm sm:text-base font-black mt-1 uppercase ${
                telemetry.machine_status === 'RUNNING' 
                  ? 'text-emerald-700' 
                  : (telemetry.machine_status === 'ERROR' ? 'text-rose-600 animate-bounce' : 'text-amber-700')
              }`}>
                {telemetry.machine_status || 'RUNNING'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1">DialySense Pro</div>
            </div>
          </div>

          {/* Quick Nav Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('digital-twin')}
              className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1.5 font-bold"
            >
              <span>View Virtual Machine Digital Twin</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: AI Risk Prediction Card */}
        <div className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between ${riskCardStyle}`}>
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-sky-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Clinical Risk Stratification
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${riskBadgeStyle}`}>
                {risk.risk_level} RISK
              </span>
            </div>

            {/* Risk Score Display */}
            <div className="mt-5 flex items-baseline justify-between">
              <div>
                <div className="text-4xl font-black tracking-tight text-slate-900">{risk.risk_score}</div>
                <div className="text-[11px] text-slate-500 font-semibold">Clinical Instability Index (0–100)</div>
              </div>
              <div className="w-28 bg-white rounded-full h-3.5 border border-slate-200 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    risk.risk_score >= 70 ? 'bg-rose-500' : (risk.risk_score >= 35 ? 'bg-amber-500' : 'bg-emerald-500')
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, risk.risk_score))}%` }}
                />
              </div>
            </div>

            {/* Clinical Factors */}
            <div className="mt-5 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pathophysiological Findings:
              </div>
              <ul className="text-xs space-y-1.5 text-slate-700">
                {risk.factors && risk.factors.length > 0 ? (
                  risk.factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">All physiological parameters within normal limits.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Clinical Recommendation */}
          <div className="mt-5 pt-3.5 border-t border-slate-200/60 text-[11px] text-slate-700">
            <span className="font-bold text-slate-900">Clinical Protocol:</span> {risk.recommendation || 'Continue standard hemodialysis monitoring.'}
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Clinical Alarms & Incident Log
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold"
          >
            View All ({recentAlerts?.length || 0})
          </button>
        </div>

        {recentAlerts && recentAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Alarm Title</th>
                  <th className="py-3 px-4 font-semibold">Clinical Details</th>
                  <th className="py-3 px-4 font-semibold">Time</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAlerts.slice(0, 5).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.severity === 'CRITICAL' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                          : (a.severity === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200')
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{a.title}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-md truncate">{a.message}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      {a.is_acknowledged ? (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledged
                        </span>
                      ) : (
                        <span className="text-rose-600 text-[11px] font-bold">Unresolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            No active alert conditions. Hemodialysis hemodynamics are stable.
          </div>
        )}
      </div>
    </div>
  );
}
