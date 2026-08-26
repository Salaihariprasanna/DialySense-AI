import React from 'react';
import { 
  Cpu, 
  Activity, 
  Wind, 
  Gauge, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
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
          <div className="flex items-center space-x-2.5">
            <Cpu className="h-6 w-6 text-sky-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Extracorporeal Digital Twin
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-bold">
              VIRTUAL DIALYZER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time physical circuit synchronization with ESP32 sensor stream & fluid dynamics
          </p>
        </div>

        {/* Machine Status Badge */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{activeSession?.machine?.model || 'DialySense Pro-5000'}</div>
            <div className="text-[11px] text-slate-400 font-mono">SN: {activeSession?.machine?.serial_number || 'DSP-2026-001'}</div>
          </div>
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-wider ${
            isRunning 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
              : (isError ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200')
          }`}>
            <Power className="h-4 w-4" />
            <span>{telemetry.machine_status}</span>
          </div>
        </div>
      </div>

      {/* Main Virtual Machine Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Visual Animated Dialyzer System */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-ping" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hemodialysis Fluidics Circuit Simulation
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Active Patient: <span className="text-sky-700 font-bold">{activeSession?.patient?.name || 'John Doe'}</span>
            </div>
          </div>

          {/* SVG Diagram with Animated Streams in Light Medical Canvas */}
          <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-50/70 rounded-2xl border border-slate-200 flex items-center justify-center p-4">
            <svg viewBox="0 0 800 420" className="w-full h-full">
              <defs>
                <linearGradient id="bloodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
                <linearGradient id="cleanBloodGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="dialysateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Patient Vascular Access Node */}
              <rect x="30" y="160" width="120" height="90" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              <text x="90" y="195" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">PATIENT ACCESS</text>
              <text x="90" y="215" fill="#64748b" fontSize="10" textAnchor="middle">AV Fistula / Graft</text>
              <circle cx="90" cy="235" r="4" fill="#10b981" />

              {/* Arterial Blood Line (Red) -> Leaving Patient */}
              <path 
                d="M 150 185 L 260 185" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="6" 
                className={isRunning ? "flow-anim" : ""}
              />
              <text x="205" y="175" fill="#be123c" fontSize="9" fontWeight="bold" textAnchor="middle">Arterial Blood Out</text>

              {/* Peristaltic Blood Pump Rotor */}
              <g transform="translate(260, 150)">
                <rect width="90" height="70" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="45" cy="35" r="22" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="2" />
                <g className={isRunning ? "animate-spin origin-[45px_35px]" : ""} style={{ animationDuration: flowRate > 0 ? `${Math.max(0.4, 200/flowRate)}s` : '0s' }}>
                  <line x1="45" y1="18" x2="45" y2="52" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="28" y1="35" x2="62" y2="35" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                </g>
                <text x="45" y="62" fill="#0284c7" fontSize="8.5" fontWeight="bold" textAnchor="middle">PUMP: {pumpRpm} RPM</text>
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
                <rect width="100" height="230" rx="18" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                <rect x="15" y="30" width="70" height="170" rx="8" fill="#e0f2fe" fillOpacity="0.6" stroke="#0284c7" strokeDasharray="3 3" />
                
                {/* Hollow Fibers inside */}
                <line x1="30" y1="35" x2="30" y2="195" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="40" y1="35" x2="40" y2="195" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="50" y1="35" x2="50" y2="195" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="60" y1="35" x2="60" y2="195" stroke="#0ea5e9" strokeWidth="1.5" />
                <line x1="70" y1="35" x2="70" y2="195" stroke="#0ea5e9" strokeWidth="1.5" />

                <text x="50" y="115" fill="#0c4a6e" fontSize="11" fontWeight="bold" textAnchor="middle">DIALYZER</text>
                <text x="50" y="130" fill="#0369a1" fontSize="8" fontWeight="semibold" textAnchor="middle">Hollow Fibers</text>
              </g>

              {/* Dialysate Inflow (Fresh Dialysate) */}
              <path 
                d="M 510 30 L 510 90" 
                fill="none" 
                stroke="#0ea5e9" 
                strokeWidth="5" 
                className={isRunning ? "flow-anim" : ""}
              />
              <rect x="460" y="10" width="100" height="26" rx="6" fill="#0284c7" />
              <text x="510" y="27" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Fresh Dialysate In</text>

              {/* Used Dialysate / Effluent Outflow */}
              <path 
                d="M 510 320 L 510 380" 
                fill="none" 
                stroke="#d97706" 
                strokeWidth="5" 
                className={isRunning ? "flow-anim" : ""}
              />
              <rect x="460" y="380" width="100" height="26" rx="6" fill="#d97706" />
              <text x="510" y="397" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Effluent Waste Out</text>

              {/* Cleaned Venous Blood Line -> Returning to Patient */}
              <path 
                d="M 560 270 L 650 270 L 650 330 L 220 330 L 220 225 L 150 225" 
                fill="none" 
                stroke="#0284c7" 
                strokeWidth="6" 
                className={isRunning ? "flow-anim-reverse" : ""}
              />
              <text x="430" y="345" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle">Cleaned Venous Blood Return</text>

              {/* Venous Pressure Sensor / Bubble Trap */}
              <g transform="translate(620, 240)">
                <rect width="60" height="50" rx="10" fill="#ffffff" stroke={pressure > 200 ? "#e11d48" : "#0284c7"} strokeWidth="2" />
                <text x="30" y="20" fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">VENOUS TRAP</text>
                <text x="30" y="38" fill={pressure > 200 ? "#e11d48" : "#0284c7"} fontSize="12" fontWeight="bold" textAnchor="middle">{pressure}</text>
              </g>
            </svg>
          </div>

          {/* Quick Sub-Stats */}
          <div className="grid grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Flow Rate</span>
              <div className="text-lg font-black text-indigo-700 mt-0.5">{flowRate} mL/min</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Circuit Pressure</span>
              <div className={`text-lg font-black mt-0.5 ${pressure > 200 ? 'text-rose-600 animate-pulse' : 'text-sky-700'}`}>{pressure} mmHg</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Dialysate Temp</span>
              <div className="text-lg font-black text-amber-700 mt-0.5">{temp}°C</div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Virtual Telemetry Gauges & Diagnostics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Machine Health Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-600" />
              Machine Telemetry Health
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* Pressure Range Bar */}
              <div>
                <div className="flex justify-between text-slate-500 font-medium mb-1">
                  <span>Venous Return Circuit Pressure</span>
                  <span className="font-bold text-slate-900">{pressure} / 300 mmHg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      pressure > 210 ? 'bg-rose-500' : (pressure > 160 ? 'bg-amber-500' : 'bg-sky-500')
                    }`}
                    style={{ width: `${Math.min(100, (pressure / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Blood Flow Bar */}
              <div>
                <div className="flex justify-between text-slate-500 font-medium mb-1">
                  <span>Blood Pump Flow Capacity</span>
                  <span className="font-bold text-slate-900">{flowRate} / 450 mL/min</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (flowRate / 450) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Machine Temp Bar */}
              <div>
                <div className="flex justify-between text-slate-500 font-medium mb-1">
                  <span>Fluid Heating Equilibrium</span>
                  <span className="font-bold text-slate-900">{temp}°C (Target 36.5°C)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-0.5">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, ((temp - 30) / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Actuator Diagnostic Status */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Circuit Safety Diagnostics
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-700 font-medium">Arterial Occlusion Sensor</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> CLEAR
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-700 font-medium">Ultrasonic Air Bubble Detector</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> NO BUBBLES
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-700 font-medium">Optical Blood Leak Sensor</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> NEGATIVE
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-700 font-medium">Transmembrane Pressure (TMP)</span>
                <span className={`font-bold flex items-center gap-1 ${
                  pressure > 200 ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  {pressure > 200 ? <AlertTriangle className="h-4 w-4" /> : null}
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
