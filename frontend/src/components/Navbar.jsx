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
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  activeSession, 
  sessions, 
  onSelectSession,
  criticalAlertCount = 0,
  currentUser,
  onLogout
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
    <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  DialySense <span className="text-sky-600">AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 font-bold">
                  Hospital Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hemodialysis IoT Telemetry & Decision Support</p>
            </div>
          </div>

          {/* Session Selector & Live Telemetry Badge */}
          <div className="hidden md:flex items-center space-x-3">
            {sessions && sessions.length > 0 && (
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                <span className="text-slate-500 font-semibold mr-2">Session:</span>
                <select 
                  className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer pr-1"
                  value={activeSession?.id || ''}
                  onChange={(e) => {
                    const found = sessions.find(s => s.id === Number(e.target.value));
                    if (found) onSelectSession(found);
                  }}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id} className="bg-white text-slate-900">
                      {s.session_code} • {s.patient?.name || `Patient #${s.patient_id}`} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* WebSocket Pulse Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' 
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
              <Radio className="h-3.5 w-3.5" />
              <span>{isConnected ? 'ESP32 STREAMING' : 'OFFLINE'}</span>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l-2 border-slate-200">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-xl">
                <div className="h-7 w-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser?.full_name || 'Staff Clinician'}
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
                    {currentUser?.role || 'DOCTOR'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold shadow-2xs transition-all"
                title="Sign out of hospital account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs with Crisp Defined Active States */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2.5 pt-1.5 border-t border-slate-200 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border-2 border-sky-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-sky-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-rose-600 text-white animate-bounce">
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
