import React from 'react';
import { 
  Cpu, 
  Activity, 
  Wind, 
  Gauge, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Power
} from 'lucide-react';

export default function DigitalTwin({ activeSession, latestTelemetry, latestRisk }) {
  const telemetry = latestTelemetry || {
    blood_flow_rate: 300,
    dialysis_pressure: 120,
    machine_temperature: 37.0,
    machine_status: 'RUNNING'
  };

  const isRunning = telemetry.machine_status === 'RUNNING';
  const isWarning = telemetry.machine_status === 'WARNING';
  const isError = telemetry.machine_status === 'ERROR';

  const flowRate = telemetry.blood_flow_rate || 0;
  const pressure = telemetry.dialysis_pressure || 120;
  const temp = telemetry.machine_temperature || 37.0;

  // Approximate rotor RPM based on blood flow rate
  const pumpRpm = Math.round(flowRate * 0.85);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Lightweight Digital Twin
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              VIRTUAL DIALYZER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time physical circuit synchronization with ESP32 sensor stream & fluid dynamics
          </p>
        </div>

        {/* Machine Status Badge */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-200">{activeSession?.machine?.model || 'DialySense Pro-5000'}</div>
            <div className="text-[10px] text-slate-400 font-mono">SN: {activeSession?.machine?.serial_number || 'DSP-2026-001'}</div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${
            isRunning 
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 glow-emerald' 
              : (isError ? 'bg-rose-950/80 text-rose-400 border-rose-800 glow-red animate-pulse' : 'bg-amber-950/80 text-amber-400 border-amber-800 glow-amber')
          }`}>
            <Power className="h-4 w-4" />
            <span>{telemetry.machine_status}</span>
          </div>
        </div>
      </div>

      {/* Main Virtual Machine Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Visual Animated Dialyzer System */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Hemodialysis Fluidics Circuit Simulation
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Active Patient: <span className="text-cyan-300 font-bold">{activeSession?.patient?.name || 'John Doe'}</span>
            </div>
          </div>

          {/* SVG Diagram with Animated Streams */}
          <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-center p-4">
            <svg viewBox="0 0 800 420" className="w-full h-full">
              <defs>
                <linearGradient id="bloodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="cleanBloodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="dialysateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Patient Vascular Access Node */}
              <rect x="30" y="160" width="120" height="90" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="90" y="195" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">PATIENT ACCESS</text>
              <text x="90" y="215" fill="#94a3b8" fontSize="10" textAnchor="middle">AV Fistula / Graft</text>
              <circle cx="90" cy="235" r="4" fill="#10b981" />

              {/* Arterial Blood Line (Red) -> Leaving Patient */}
              <path 
                d="M 150 185 L 260 185" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="6" 
                className={isRunning ? "flow-anim" : ""}
              />
              <text x="205" y="175" fill="#fda4af" fontSize="9" fontWeight="bold" textAnchor="middle">Arterial Line</text>

              {/* Peristaltic Blood Pump Rotor */}
              <g transform="translate(260, 150)">
                <rect width="90" height="70" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                <circle cx="45" cy="35" r="22" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                <g className={isRunning ? "animate-spin origin-[45px_35px]" : ""} style={{ animationDuration: flowRate > 0 ? `${Math.max(0.4, 200/flowRate)}s` : '0s' }}>
                  <line x1="45" y1="18" x2="45" y2="52" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="28" y1="35" x2="62" y2="35" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                </g>
                <text x="45" y="62" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">PUMP: {pumpRpm} RPM</text>
              </g>

              {/* Pipe: Pump to Dialyzer */}
              <path 
                d="M 350 185 L 430 185 L 430 140 L 460 140" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="6" 
                className={isRunning ? "flow-anim" : ""}
              />

              {/* DIALYZER (Artificial Kidney Cylinder) */}
              <g transform="translate(460, 90)">
                {/* Dialyzer Shell */}
                <rect width="100" height="230" rx="18" fill="#0f172a" stroke="#0284c7" strokeWidth="3" />
                <rect x="15" y="30" width="70" height="170" rx="6" fill="#0c4a6e" fillOpacity="0.4" stroke="#0369a1" strokeDasharray="3 3" />
                
                {/* Hollow Fibers inside */}
                <line x1="30" y1="35" x2="30" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="40" y1="35" x2="40" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="50" y1="35" x2="50" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="60" y1="35" x2="60" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
                <line x1="70" y1="35" x2="70" y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />

                <text x="50" y="115" fill="#bae6fd" fontSize="10" fontWeight="bold" textAnchor="middle">DIALYZER</text>
                <text x="50" y="130" fill="#7dd3fc" fontSize="8" textAnchor="middle">Hollow Fibers</text>
              </g>

              {/* Dialysate Inflow (Fresh Dialysate) */}
              <path 
                d="M 510 30 L 510 90" 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="5" 
                className={isRunning ? "flow-anim" : ""}
              />
              <rect x="460" y="10" width="100" height="26" rx="6" fill="#155e75" />
              <text x="510" y="27" fill="#cffafe" fontSize="9" fontWeight="bold" textAnchor="middle">Fresh Dialysate In</text>

              {/* Used Dialysate / Effluent Outflow */}
              <path 
                d="M 510 320 L 510 380" 
                fill="none" 
                stroke="#eab308" 
                strokeWidth="5" 
                className={isRunning ? "flow-anim" : ""}
              />
              <rect x="460" y="380" width="100" height="26" rx="6" fill="#713f12" />
              <text x="510" y="397" fill="#fef08a" fontSize="9" fontWeight="bold" textAnchor="middle">Effluent / Waste Out</text>

              {/* Cleaned Venous Blood Line -> Returning to Patient */}
              <path 
                d="M 560 270 L 650 270 L 650 330 L 220 330 L 220 225 L 150 225" 
                fill="none" 
                stroke="#0284c7" 
                strokeWidth="6" 
                className={isRunning ? "flow-anim-reverse" : ""}
              />
              <text x="430" y="345" fill="#7dd3fc" fontSize="9" fontWeight="bold" textAnchor="middle">Cleaned Venous Blood Return</text>

              {/* Venous Pressure Sensor / Bubble Trap */}
              <g transform="translate(620, 240)">
                <rect width="60" height="50" rx="8" fill="#1e293b" stroke={pressure > 200 ? "#f43f5e" : "#0284c7"} strokeWidth="2" />
                <text x="30" y="22" fill="#94a3b8" fontSize="8" textAnchor="middle">VENOUS TRAP</text>
                <text x="30" y="38" fill={pressure > 200 ? "#f43f5e" : "#38bdf8"} fontSize="11" fontWeight="bold" textAnchor="middle">{pressure}</text>
              </g>
            </svg>
          </div>

          {/* Quick Sub-Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Flow Rate</span>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">{flowRate} mL/min</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Circuit Pressure</span>
              <div className={`text-lg font-bold mt-0.5 ${pressure > 200 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>{pressure} mmHg</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Dialysate Temp</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{temp}°C</div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Virtual Telemetry Gauges & Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Machine Health Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              Machine Telemetry Health
            </h3>

            <div className="space-y-3 text-xs">
              {/* Pressure Range Bar */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Venous Circuit Pressure</span>
                  <span className="font-bold text-slate-200">{pressure} / 300 mmHg</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      pressure > 210 ? 'bg-rose-500' : (pressure > 160 ? 'bg-amber-500' : 'bg-cyan-500')
                    }`}
                    style={{ width: `${Math.min(100, (pressure / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Blood Flow Bar */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Blood Flow Capacity</span>
                  <span className="font-bold text-slate-200">{flowRate} / 450 mL/min</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (flowRate / 450) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Machine Temp Bar */}
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Fluid Heating Bath</span>
                  <span className="font-bold text-slate-200">{temp}°C (Target 36.5°C)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((temp - 30) / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Actuator Diagnostic Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Subsystem Diagnostics
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Arterial Occlusion Sensor</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> CLEAR
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Air Bubble Detector</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> NO BUBBLES
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Blood Leak Detector</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> NEGATIVE
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Transmembrane Pressure</span>
                <span className={`font-bold flex items-center gap-1 ${
                  pressure > 200 ? 'text-rose-400' : 'text-slate-200'
                }`}>
                  {pressure > 200 ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
                  {pressure} mmHg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
