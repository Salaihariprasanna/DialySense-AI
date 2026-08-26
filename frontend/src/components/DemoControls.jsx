import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Zap, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Radio, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { setSimulationMode, triggerSimulationTick, controlSimulation } from '../services/api';

export default function DemoControls({ activeSession, activePatient, onNotification }) {
  const [currentMode, setCurrentMode] = useState('NORMAL');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const [tickLoading, setTickLoading] = useState(false);

  const sessionId = activeSession?.id || 1;
  const patientId = activePatient?.id || activeSession?.patient_id || 1;

  const handleModeChange = async (mode) => {
    try {
      setLoadingMode(true);
      await setSimulationMode(mode, sessionId, patientId);
      setCurrentMode(mode);
      // Immediately trigger 1 tick so the live dashboard updates instantly without waiting
      await triggerSimulationTick(sessionId, patientId, mode);
      
      const modeText = mode === 'RISK' ? 'HIGH RISK DEMO' : (mode === 'MACHINE_ERROR' ? 'MACHINE ERROR' : 'NORMAL');
      if (onNotification) {
        onNotification({
          type: mode === 'NORMAL' ? 'success' : 'warning',
          title: `Simulator: Switched to ${modeText}`,
          message: mode === 'RISK' 
            ? 'Emulating hemodynamic collapse & SpO2 crash. Check Live Dashboard!' 
            : (mode === 'MACHINE_ERROR' ? 'Dialysis machine error state activated.' : 'Normal stable parameters resumed.')
        });
      }
    } catch (err) {
      console.error('Mode change error:', err);
    } finally {
      setLoadingMode(false);
    }
  };

  const handleManualTick = async () => {
    try {
      setTickLoading(true);
      await triggerSimulationTick(sessionId, patientId, currentMode);
    } catch (err) {
      console.error('Tick error:', err);
    } finally {
      setTickLoading(false);
    }
  };

  const handleToggleStream = async () => {
    try {
      const nextState = !isStreaming;
      await controlSimulation(nextState ? 'start' : 'stop', 3.0);
      setIsStreaming(nextState);
      if (onNotification) {
        onNotification({
          type: nextState ? 'info' : 'neutral',
          title: nextState ? 'Auto-Streaming Active' : 'Streaming Paused',
          message: nextState ? 'Transmitting simulated ESP32 telemetry every 3 seconds.' : 'Telemetry stream paused.'
        });
      }
    } catch (err) {
      console.error('Stream toggle error:', err);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title / Badge */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                IoT Hardware Demo Mode
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                currentMode === 'NORMAL' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : (currentMode === 'RISK' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' : 'bg-amber-950 text-amber-400 border border-amber-800')
              }`}>
                {currentMode === 'MACHINE_ERROR' ? 'MACHINE ERROR' : currentMode}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Simulate ESP32 physiological & machine streams live</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Normal Mode Button */}
          <button
            onClick={() => handleModeChange('NORMAL')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              currentMode === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700/80 border border-emerald-900/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NORMAL</span>
          </button>

          {/* Risk Mode Button */}
          <button
            onClick={() => handleModeChange('RISK')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              currentMode === 'RISK'
                ? 'bg-rose-600 text-white shadow-rose-500/40 ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-slate-800 text-rose-400 hover:bg-slate-700/80 border border-rose-900/50'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>RISK</span>
          </button>

          {/* Machine Error Button */}
          <button
            onClick={() => handleModeChange('MACHINE_ERROR')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              currentMode === 'MACHINE_ERROR'
                ? 'bg-amber-600 text-white shadow-amber-500/30 ring-2 ring-amber-400/50'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700/80 border border-amber-900/50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>MACHINE ERROR</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Step Tick Button */}
          <button
            onClick={handleManualTick}
            disabled={tickLoading}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all"
            title="Inject single telemetry reading"
          >
            <Zap className={`h-3 w-3 ${tickLoading ? 'animate-spin' : ''}`} />
            <span>Step Tick</span>
          </button>

          {/* Auto-Stream Toggle Button */}
          <button
            onClick={handleToggleStream}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="h-3 w-3 fill-current text-white" />
                <span>Stop Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current text-cyan-400" />
                <span>Auto Stream (3s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
