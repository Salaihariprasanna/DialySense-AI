import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import DemoControls from './components/DemoControls';
import Dashboard from './components/Dashboard';
import LiveMonitor from './components/LiveMonitor';
import DigitalTwin from './components/DigitalTwin';
import Patients from './components/Patients';
import Machines from './components/Machines';
import Alerts from './components/Alerts';
import Reports from './components/Reports';

import { 
  getPatients, 
  getSessions, 
  getMachines, 
  getReadingsHistory, 
  getLatestReading, 
  getAlerts,
  getCurrentActiveSession,
  acknowledgeAlert
} from './services/api';
import wsService from './services/websocket';
import { AlertOctagon, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dialysense_user');
      return saved ? JSON.parse(saved) : {
        username: 'dr_sarah',
        full_name: 'Dr. Sarah Jenkins',
        role: 'DOCTOR',
        email: 'sarah.jenkins@hospital.org'
      };
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [readingsHistory, setReadingsHistory] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [latestRisk, setLatestRisk] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);

  const [toastNotification, setToastNotification] = useState(null);

  // 1. Initial Data Fetch
  const loadCoreData = async () => {
    try {
      const [patRes, sesRes, macRes, altRes] = await Promise.all([
        getPatients(),
        getSessions(),
        getMachines(),
        getAlerts({ limit: 20 })
      ]);
      setPatients(patRes.data || []);
      setSessions(sesRes.data || []);
      setMachines(macRes.data || []);
      setRecentAlerts(altRes.data || []);

      // Pick active ongoing session or first available
      const active = (sesRes.data || []).find(s => s.status === 'ONGOING') || sesRes.data?.[0];
      if (active) {
        setActiveSession(active);
        loadSessionTelemetry(active.id);
      }
    } catch (err) {
      console.error('Core data load error:', err);
    }
  };

  const loadSessionTelemetry = async (sessionId) => {
    try {
      const [histRes, latestRes] = await Promise.all([
        getReadingsHistory(sessionId, 40),
        getLatestReading(sessionId)
      ]);
      setReadingsHistory(histRes.data || []);
      if (latestRes.data?.reading) {
        setLatestTelemetry(latestRes.data.reading);
      }
      if (latestRes.data?.risk) {
        setLatestRisk(latestRes.data.risk);
      }
    } catch (err) {
      console.error('Session telemetry load error:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCoreData();
    }
  }, [currentUser]);

  // 2. WebSocket Real-Time Integration
  useEffect(() => {
    if (!currentUser || !activeSession?.id) return;

    wsService.connect(activeSession.id);
    const unbindStatus = wsService.onStatusChange(setIsConnected);

    const unbindMessage = wsService.subscribe((data) => {
      if (data.type === 'TELEMETRY_UPDATE') {
        const { telemetry, risk, new_alerts } = data;
        
        setLatestTelemetry(telemetry);
        if (risk) setLatestRisk(risk);

        // Append to history and keep last 40 data points
        setReadingsHistory((prev) => {
          const next = [...prev, telemetry];
          return next.slice(-40);
        });

        // Prepend any new alerts
        if (new_alerts && new_alerts.length > 0) {
          setRecentAlerts((prev) => [...new_alerts, ...prev]);
          // If critical alert, trigger notification
          const critical = new_alerts.find(a => a.severity === 'CRITICAL');
          if (critical) {
            setToastNotification({
              type: 'danger',
              title: critical.title,
              message: critical.message
            });
          }
        }
      }
    });

    return () => {
      unbindStatus();
      unbindMessage();
      wsService.disconnect();
    };
  }, [currentUser, activeSession?.id]);

  const handleLogout = () => {
    localStorage.removeItem('dialysense_user');
    setCurrentUser(null);
  };

  const handleNotification = (notif) => {
    setToastNotification(notif);
    setTimeout(() => {
      setToastNotification((curr) => (curr === notif ? null : curr));
    }, 6000);
  };

  const handleSelectSession = (session) => {
    setActiveSession(session);
    loadSessionTelemetry(session.id);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const stats = {
    totalPatients: patients.length,
    activeSessions: sessions.filter(s => s.status === 'ONGOING').length,
    availableMachines: machines.filter(m => m.status === 'AVAILABLE').length,
    runningMachines: machines.filter(m => m.status === 'RUNNING').length,
  };

  const unacknowledgedCritical = recentAlerts.filter(a => a.severity === 'CRITICAL' && !a.is_acknowledged);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar with User Profile & Logout */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        activeSession={activeSession}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        criticalAlertCount={unacknowledgedCritical.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Critical Alert Emergency Banner */}
      {unacknowledgedCritical.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5 max-w-5xl">
            <AlertOctagon className="h-5 w-5 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">
              CRITICAL PATIENT ALERT:
            </span>
            <span className="text-xs font-medium truncate">
              {unacknowledgedCritical[0].title} — {unacknowledgedCritical[0].message}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1 bg-white text-rose-700 rounded-lg text-xs font-black uppercase hover:bg-rose-50 transition-all shrink-0 ml-3 shadow-2xs border border-rose-300"
          >
            Review Alarms ({unacknowledgedCritical.length})
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Interactive Demo Controller Toolbar */}
        <DemoControls 
          activeSession={activeSession}
          activePatient={activeSession?.patient}
          onNotification={handleNotification}
        />

        {/* Tab Pages */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats}
            activeSession={activeSession}
            latestTelemetry={latestTelemetry}
            latestRisk={latestRisk}
            recentAlerts={recentAlerts}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'monitor' && (
          <LiveMonitor 
            activeSession={activeSession}
            latestTelemetry={latestTelemetry}
            latestRisk={latestRisk}
            readingsHistory={readingsHistory}
            isConnected={isConnected}
          />
        )}

        {activeTab === 'digital-twin' && (
          <DigitalTwin 
            activeSession={activeSession}
            latestTelemetry={latestTelemetry}
            latestRisk={latestRisk}
          />
        )}

        {activeTab === 'patients' && (
          <Patients 
            patients={patients}
            sessions={sessions}
            machines={machines}
            onRefresh={loadCoreData}
            onSelectSession={handleSelectSession}
            onNotification={handleNotification}
          />
        )}

        {activeTab === 'machines' && (
          <Machines 
            machines={machines}
            onRefresh={loadCoreData}
            onNotification={handleNotification}
          />
        )}

        {activeTab === 'alerts' && (
          <Alerts 
            alerts={recentAlerts}
            onRefresh={loadCoreData}
            onNotification={handleNotification}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            sessions={sessions}
            onNotification={handleNotification}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl mt-0.5 border-2 ${
              toastNotification.type === 'danger' ? 'bg-rose-50 text-rose-600 border-rose-300' : 'bg-emerald-50 text-emerald-600 border-emerald-300'
            }`}>
              {toastNotification.type === 'danger' ? <AlertOctagon className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{toastNotification.title}</h4>
              <p className="text-xs text-slate-700 font-medium mt-0.5">{toastNotification.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        DialySense AI • Clinical Hemodialysis Telemetry, Risk Stratification & Decision Support System
      </footer>
    </div>
  );
}
