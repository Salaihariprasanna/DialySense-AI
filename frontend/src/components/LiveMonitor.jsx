import React from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Gauge, 
  ShieldAlert, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertCircle
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

  const riskBg = risk.risk_level === 'HIGH' 
    ? 'bg-rose-950/40 border-rose-800/80 shadow-rose-950/40' 
    : (risk.risk_level === 'MODERATE' ? 'bg-amber-950/40 border-amber-800/80' : 'bg-emerald-950/40 border-emerald-800/80');

  const riskBadgeColor = risk.risk_level === 'HIGH'
    ? 'bg-rose-600 text-white animate-pulse'
    : (risk.risk_level === 'MODERATE' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white');

  return (
    <div className="space-y-6">
      {/* Top Patient Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md">
            {activeSession?.patient?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {activeSession?.session_code || 'SES-202603-001'}
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                {activeSession?.patient?.name || 'John Doe'}
              </h2>
              <span className="text-xs text-slate-400">
                ({activeSession?.patient?.age || 58}y / {activeSession?.patient?.gender || 'Male'} / {activeSession?.patient?.blood_group || 'O+'})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Doctor: <span className="text-slate-200">{activeSession?.patient?.doctor || 'Dr. Sarah Jenkins'}</span> • Diagnosis: <span className="text-slate-200">{activeSession?.patient?.disease_stage || 'Stage 5 CKD'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 block text-[10px]">Machine Unit</span>
            <span className="font-bold text-cyan-300">{activeSession?.machine?.machine_code || 'DIALY-01'}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 block text-[10px]">Session Status</span>
            <span className="font-bold text-emerald-400 uppercase">{activeSession?.status || 'ONGOING'}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 block text-[10px]">Target UF Volume</span>
            <span className="font-bold text-indigo-300">{activeSession?.target_uf_volume_ml || 2500} mL</span>
          </div>
        </div>
      </div>

      {/* 8 Real-Time Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Heart Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Heart Rate</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className={`text-xl font-black ${telemetry.heart_rate > 115 || telemetry.heart_rate < 55 ? 'text-rose-400 animate-pulse' : 'text-rose-300'}`}>
            {telemetry.heart_rate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">BPM</div>
        </div>

        {/* 2. SpO2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>SpO2</span>
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className={`text-xl font-black ${telemetry.spo2 < 93 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
            {telemetry.spo2}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Oxygen</div>
        </div>

        {/* 3. Blood Pressure */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>BP (Sys/Dia)</span>
            <Activity className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className={`text-xl font-black ${telemetry.systolic_bp < 85 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
            {Math.round(telemetry.systolic_bp)}/{Math.round(telemetry.diastolic_bp)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">mmHg</div>
        </div>

        {/* 4. Body Temperature */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Body Temp</span>
            <Thermometer className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300">
            {telemetry.temperature}°C
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Patient</div>
        </div>

        {/* 5. Blood Flow Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Blood Flow</span>
            <Wind className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className={`text-xl font-black ${telemetry.blood_flow_rate < 180 ? 'text-amber-400' : 'text-indigo-300'}`}>
            {telemetry.blood_flow_rate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">mL/min</div>
        </div>

        {/* 6. Dialysis Venous Pressure */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Dialysis Press</span>
            <Gauge className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className={`text-xl font-black ${telemetry.dialysis_pressure > 200 ? 'text-rose-400 animate-pulse' : 'text-teal-300'}`}>
            {telemetry.dialysis_pressure}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">mmHg</div>
        </div>

        {/* 7. Machine Temp */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Dialysate T.</span>
            <Thermometer className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-300">
            {telemetry.machine_temperature || 37.0}°C
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Machine</div>
        </div>

        {/* 8. Machine Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Unit State</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className={`text-sm font-black mt-1 uppercase ${
            telemetry.machine_status === 'RUNNING' 
              ? 'text-emerald-400' 
              : (telemetry.machine_status === 'ERROR' ? 'text-rose-400 animate-bounce' : 'text-amber-400')
          }`}>
            {telemetry.machine_status || 'RUNNING'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Status</div>
        </div>
      </div>

      {/* AI Risk Prediction Banner */}
      <div className={`border rounded-2xl p-4 shadow-xl ${riskBg} transition-all duration-500`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
              <ShieldAlert className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  AI Real-Time Hemodynamic Risk Prediction
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${riskBadgeColor}`}>
                  {risk.risk_level} RISK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {risk.recommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-auto bg-slate-950/70 border border-slate-800 px-4 py-2 rounded-xl">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-100">{risk.risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Risk Index</div>
            </div>
            <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
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
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-semibold">AI Explanatory Factors:</span>
            {risk.factors.map((factor, idx) => (
              <span key={idx} className="bg-slate-950/80 border border-slate-700/80 text-slate-200 px-2 py-0.5 rounded text-[11px]">
                {factor}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Heart Rate & SpO2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-500" />
              Heart Rate & SpO2 Oxygen Saturation
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Live Time-Series</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" domain={[40, 160]} stroke="#f43f5e" fontSize={10} unit=" bpm" />
                <YAxis yAxisId="right" orientation="right" domain={[70, 100]} stroke="#06b6d4" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line yAxisId="left" type="monotone" dataKey="heart_rate" name="Heart Rate (BPM)" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Blood Pressure Dynamics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-400" />
              Blood Pressure (Systolic & Diastolic)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[30, 200]} stroke="#64748b" fontSize={10} unit=" mmHg" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area type="monotone" dataKey="systolic_bp" name="Systolic BP" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#sysGradient)" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="diastolic_bp" name="Diastolic BP" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Blood Flow & Dialysis Pressure */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-indigo-400" />
              Blood Flow Rate & Circuit Venous Pressure
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Circuit Telemetry</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="flow" domain={[0, 450]} stroke="#818cf8" fontSize={10} unit=" mL/m" />
                <YAxis yAxisId="press" orientation="right" domain={[0, 300]} stroke="#2dd4bf" fontSize={10} unit=" mmHg" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line yAxisId="flow" type="monotone" dataKey="blood_flow_rate" name="Blood Flow (mL/min)" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="press" type="monotone" dataKey="dialysis_pressure" name="Venous Pressure (mmHg)" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Body & Machine Temperature */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-amber-400" />
              Patient Body Temp vs Dialysate Temp
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">°C</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[34.0, 41.0]} stroke="#64748b" fontSize={10} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="temperature" name="Body Temp (°C)" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="machine_temp" name="Machine Temp (°C)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
