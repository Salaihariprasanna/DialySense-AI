import React from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Gauge, 
  ShieldAlert, 
  Zap, 
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export default function LiveMonitor({ 
  activeSession, 
  latestTelemetry, 
  latestRisk, 
  readingsHistory = [],
  isConnected
}) {
  const telemetry = latestTelemetry || {
    heart_rate: 76,
    spo2: 98,
    temperature: 36.8,
    systolic_bp: 120,
    diastolic_bp: 80,
    blood_flow_rate: 300,
    dialysis_pressure: 120,
    machine_temperature: 37.0,
    machine_status: 'RUNNING'
  };

  const risk = latestRisk || {
    risk_level: 'LOW',
    risk_score: 12,
    factors: ['All parameters stable within baseline ranges.'],
    recommendation: 'Continue standard dialysis monitoring.'
  };

  const isHighRisk = risk.risk_level === 'HIGH';
  const isMedRisk = risk.risk_level === 'MODERATE' || risk.risk_level === 'MEDIUM';

  const riskCardStyle = isHighRisk 
    ? 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-danger' 
    : (isMedRisk 
        ? 'bg-amber-50/80 border-amber-200 text-amber-950 shadow-warning' 
        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 shadow-success');

  const riskBadgeColor = isHighRisk
    ? 'bg-rose-600 text-white animate-pulse'
    : (isMedRisk ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');

  // Format time series data for Recharts
  const chartData = readingsHistory.map((r, i) => {
    const timeLabel = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${i+1}`;
    return {
      time: timeLabel,
      heart_rate: r.heart_rate,
      spo2: r.spo2,
      systolic_bp: r.systolic_bp,
      diastolic_bp: r.diastolic_bp,
      blood_flow_rate: r.blood_flow_rate,
      dialysis_pressure: r.dialysis_pressure,
      temperature: r.temperature,
      machine_temp: r.machine_temperature || 37.0
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Patient Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-sm">
            {activeSession?.patient?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {activeSession?.session_code || 'SES-202603-001'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {activeSession?.patient?.name || 'John Doe'}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                ({activeSession?.patient?.age || 58}y • {activeSession?.patient?.gender || 'Male'} • {activeSession?.patient?.blood_group || 'O+'})
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Nephrologist: <span className="text-slate-800 font-semibold">{activeSession?.patient?.doctor || 'Dr. Sarah Jenkins'}</span> • Diagnosis: <span className="text-slate-800 font-semibold">{activeSession?.patient?.disease_stage || 'Stage 5 CKD'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dialysis Unit</span>
            <span className="font-bold text-slate-900">{activeSession?.machine?.machine_code || 'DIALY-01'}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Treatment State</span>
            <span className="font-bold text-emerald-700 uppercase">{activeSession?.status || 'ONGOING'}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Prescribed UF Target</span>
            <span className="font-bold text-indigo-700">{activeSession?.target_uf_volume_ml || 2500} mL</span>
          </div>
        </div>
      </div>

      {/* 8 Real-Time Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Heart Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Heart Rate</span>
            <Heart className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className={`text-xl font-black ${telemetry.heart_rate > 115 || telemetry.heart_rate < 55 ? 'text-rose-600 animate-pulse' : 'text-rose-600'}`}>
            {telemetry.heart_rate}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">BPM (60–100)</div>
        </div>

        {/* 2. SpO2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>SpO2 Pulse</span>
            <Activity className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div className={`text-xl font-black ${telemetry.spo2 < 93 ? 'text-rose-600 animate-pulse' : 'text-sky-600'}`}>
            {telemetry.spo2}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Oxygen (≥95%)</div>
        </div>

        {/* 3. Blood Pressure */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>BP (Sys/Dia)</span>
            <Activity className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className={`text-xl font-black ${telemetry.systolic_bp < 85 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {Math.round(telemetry.systolic_bp)}/{Math.round(telemetry.diastolic_bp)}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">mmHg (120/80)</div>
        </div>

        {/* 4. Body Temperature */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Body Temp</span>
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600">
            {telemetry.temperature}°C
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Patient Core</div>
        </div>

        {/* 5. Blood Flow Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Blood Flow</span>
            <Wind className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className={`text-xl font-black ${telemetry.blood_flow_rate < 180 ? 'text-amber-600' : 'text-indigo-600'}`}>
            {telemetry.blood_flow_rate}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">mL/min</div>
        </div>

        {/* 6. Dialysis Venous Pressure */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Circuit Press</span>
            <Gauge className="h-3.5 w-3.5 text-teal-500" />
          </div>
          <div className={`text-xl font-black ${telemetry.dialysis_pressure > 200 ? 'text-rose-600 animate-pulse' : 'text-teal-600'}`}>
            {telemetry.dialysis_pressure}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">mmHg (&lt;180)</div>
        </div>

        {/* 7. Machine Temp */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Dialysate T.</span>
            <Thermometer className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-cyan-700">
            {telemetry.machine_temperature || 37.0}°C
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Heating Bath</div>
        </div>

        {/* 8. Machine Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
            <span>Machine</span>
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className={`text-sm font-black mt-1 uppercase ${
            telemetry.machine_status === 'RUNNING' 
              ? 'text-emerald-700' 
              : (telemetry.machine_status === 'ERROR' ? 'text-rose-600 animate-bounce' : 'text-amber-700')
          }`}>
            {telemetry.machine_status || 'RUNNING'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Unit State</div>
        </div>
      </div>

      {/* Clinical Risk Prediction Banner */}
      <div className={`border rounded-3xl p-5 shadow-sm ${riskCardStyle} transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <ShieldAlert className="h-6 w-6 text-sky-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Continuous Hemodynamic Stability Index
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${riskBadgeColor}`}>
                  {risk.risk_level} RISK
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1 max-w-2xl">
                {risk.recommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-auto bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{risk.risk_score} <span className="text-xs font-normal text-slate-500">/ 100</span></div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Instability Score</div>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  risk.risk_score >= 70 ? 'bg-rose-500' : (risk.risk_score >= 35 ? 'bg-amber-500' : 'bg-emerald-500')
                }`}
                style={{ width: `${Math.min(100, Math.max(5, risk.risk_score))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Explainability factors */}
        {risk.factors && risk.factors.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-600 font-bold">Pathophysiological Findings:</span>
            {risk.factors.map((factor, idx) => (
              <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg text-[11px] font-medium shadow-2xs">
                {factor}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Heart Rate & SpO2 */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              Pulse Rate & Oxygen Saturation (SpO2)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium font-mono">Live Telemetry</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" domain={[40, 160]} stroke="#e11d48" fontSize={10} unit=" bpm" />
                <YAxis yAxisId="right" orientation="right" domain={[70, 100]} stroke="#0284c7" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line yAxisId="left" type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#e11d48" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#0284c7" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Blood Pressure Dynamics */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-600" />
              Non-Invasive Blood Pressure (Systolic & Diastolic)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium font-mono">mmHg</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[30, 200]} stroke="#94a3b8" fontSize={10} unit=" mmHg" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area type="monotone" dataKey="systolic_bp" name="Systolic BP" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#sysGradient)" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="diastolic_bp" name="Diastolic BP" stroke="#6366f1" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Blood Flow & Dialysis Pressure */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-600" />
              Extracorporeal Blood Flow & Venous Return Pressure
            </h3>
            <span className="text-[11px] text-slate-400 font-medium font-mono">Circuit Telemetry</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="flow" domain={[0, 450]} stroke="#6366f1" fontSize={10} unit=" mL/m" />
                <YAxis yAxisId="press" orientation="right" domain={[0, 300]} stroke="#0d9488" fontSize={10} unit=" mmHg" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line yAxisId="flow" type="monotone" dataKey="blood_flow_rate" name="Blood Flow (mL/min)" stroke="#6366f1" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="press" type="monotone" dataKey="dialysis_pressure" name="Venous Pressure (mmHg)" stroke="#0d9488" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Body & Machine Temperature */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-amber-500" />
              Patient Core Temp vs Dialysate Temp
            </h3>
            <span className="text-[11px] text-slate-400 font-medium font-mono">°C</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[34.0, 41.0]} stroke="#94a3b8" fontSize={10} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="temperature" name="Patient Temp (°C)" stroke="#d97706" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="machine_temp" name="Dialysate Temp (°C)" stroke="#0284c7" strokeWidth={2.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
