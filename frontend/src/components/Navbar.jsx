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
  Clock,
  ChevronDown
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
      label: 'Clinical Alerts', 
      icon: AlertTriangle, 
      count: criticalAlertCount > 0 ? criticalAlertCount : null 
    },
    { id: 'reports', label: 'Clinical Reports', icon: FileText },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  DialySense <span className="text-sky-600">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  Clinical CDSS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hemodialysis IoT Telemetry & Decision Support</p>
            </div>
          </div>

          {/* Session Selector & Live Telemetry Badge */}
          <div className="hidden md:flex items-center space-x-3">
            {sessions && sessions.length > 0 && (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
                <span className="text-slate-400 font-medium mr-2">Active Session:</span>
                <select 
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
                  value={activeSession?.id || ''}
                  onChange={(e) => {
                    const found = sessions.find(s => s.id === Number(e.target.value));
                    if (found) onSelectSession(found);
                  }}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id} className="bg-white text-slate-800">
                      {s.session_code} • {s.patient?.name || `Patient #${s.patient_id}`} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* WebSocket Pulse Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
              <Radio className="h-3.5 w-3.5" />
              <span>{isConnected ? 'ESP32 STREAMING' : 'OFFLINE'}</span>
            </div>

            {/* Clock */}
            <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-mono bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2 pt-1 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-sky-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-600 text-white animate-bounce">
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
