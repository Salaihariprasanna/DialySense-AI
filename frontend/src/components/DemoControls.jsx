import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Zap, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Radio
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
      
      const modeText = mode === 'RISK' ? 'HIGH RISK COLLAPSE' : (mode === 'MACHINE_ERROR' ? 'MACHINE ERROR' : 'NORMAL BASELINE');
      if (onNotification) {
        onNotification({
          type: mode === 'NORMAL' ? 'success' : 'warning',
          title: `Simulation: Switched to ${modeText}`,
          message: mode === 'RISK' 
            ? 'Emulating hemodynamic collapse, SpO2 desaturation & circuit pressure spike.' 
            : (mode === 'MACHINE_ERROR' ? 'Extracorporeal blood pump error state activated.' : 'Normal stable physiological parameters resumed.')
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
          title: nextState ? 'Live Auto-Streaming Started' : 'Streaming Paused',
          message: nextState ? 'Transmitting simulated ESP32 telemetry every 3 seconds.' : 'Telemetry stream paused.'
        });
      }
    } catch (err) {
      console.error('Stream toggle error:', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title / Badge */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Simulation Controller
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                currentMode === 'NORMAL' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : (currentMode === 'RISK' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-50 text-amber-700 border border-amber-200')
              }`}>
                {currentMode === 'MACHINE_ERROR' ? 'MACHINE ERROR' : currentMode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Inject realistic physiological baseline, hemodynamic collapse, or hardware faults</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Normal Mode Button */}
          <button
            onClick={() => handleModeChange('NORMAL')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentMode === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                : 'bg-slate-50 text-emerald-700 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NORMAL</span>
          </button>

          {/* Risk Mode Button */}
          <button
            onClick={() => handleModeChange('RISK')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentMode === 'RISK'
                ? 'bg-rose-600 text-white shadow-rose-600/20 ring-2 ring-rose-500/30 animate-pulse'
                : 'bg-slate-50 text-rose-700 hover:bg-rose-50 border border-slate-200'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>RISK COLLAPSE</span>
          </button>

          {/* Machine Error Button */}
          <button
            onClick={() => handleModeChange('MACHINE_ERROR')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentMode === 'MACHINE_ERROR'
                ? 'bg-amber-600 text-white shadow-amber-600/20 ring-2 ring-amber-500/30'
                : 'bg-slate-50 text-amber-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>MACHINE ERROR</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Step Tick Button */}
          <button
            onClick={handleManualTick}
            disabled={tickLoading}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-xs"
            title="Inject single step reading"
          >
            <Zap className={`h-3 w-3 text-sky-600 ${tickLoading ? 'animate-spin' : ''}`} />
            <span>Step Tick</span>
          </button>

          {/* Auto-Stream Toggle Button */}
          <button
            onClick={handleToggleStream}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isStreaming
                ? 'bg-sky-600 text-white shadow-sky-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="h-3 w-3 fill-current text-white" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current text-sky-300" />
                <span>Auto Stream (3s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
