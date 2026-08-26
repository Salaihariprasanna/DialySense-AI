import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  Cpu, 
  Users, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Radio, 
  SlidersHorizontal,
  Clock
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  activeSession, 
  sessions, 
  onSelectSession,
  criticalAlertCount = 0 
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'monitor', label: 'Live Monitoring', icon: Heart, badge: isConnected ? 'LIVE' : null },
    { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
    { id: 'patients', label: 'Patients & Sessions', icon: Users },
    { id: 'machines', label: 'Machines', icon: Layers },
    { 
      id: 'alerts', 
      label: 'Smart Alerts', 
      icon: AlertTriangle, 
      count: criticalAlertCount > 0 ? criticalAlertCount : null 
    },
    { id: 'reports', label: 'Session Reports', icon: FileText },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  DialySense AI
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono font-bold">
                  IoT v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Smart Dialysis Decision Support</p>
            </div>
          </div>

          {/* Session Selector & Live Telemetry Badge */}
          <div className="hidden md:flex items-center space-x-3">
            {sessions && sessions.length > 0 && (
              <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-slate-400 mr-2">Session:</span>
                <select 
                  className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                  value={activeSession?.id || ''}
                  onChange={(e) => {
                    const found = sessions.find(s => s.id === Number(e.target.value));
                    if (found) onSelectSession(found);
                  }}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                      {s.session_code} - {s.patient?.name || `Patient #${s.patient_id}`} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* WebSocket Pulse Badge */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected 
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60 shadow-sm shadow-emerald-500/20' 
                : 'bg-rose-950/50 text-rose-400 border-rose-800/60'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
              <Radio className="h-3 w-3" />
              <span>{isConnected ? 'ESP32 STREAMING' : 'OFFLINE'}</span>
            </div>

            {/* Clock */}
            <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono bg-slate-950/40 px-2 py-1 rounded border border-slate-800">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white animate-bounce">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
