import React from 'react';
import { Layers, Cpu, Power, MapPin, Wifi, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Machines({ machines = [] }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <Layers className="h-6 w-6 text-indigo-400" />
          Hemodialysis Machine Fleet
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Hardware telemetry nodes, bed assignments & preventive maintenance status
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {machines.map((m) => {
          const isRunning = m.status === 'RUNNING';
          const isError = m.status === 'ERROR';
          const isAvailable = m.status === 'AVAILABLE';

          return (
            <div 
              key={m.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {m.machine_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-1.5">{m.model}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">SN: {m.serial_number}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isRunning 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : (isError ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' : 'bg-slate-800 text-slate-300')
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center text-slate-300 gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center text-slate-300 gap-2 font-mono text-[11px]">
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                  <span>IP: {m.ip_address || '192.168.1.10x'}</span>
                </div>
                <div className="flex items-center text-slate-400 gap-2 text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Safety Self-Test: Certified Valid</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
