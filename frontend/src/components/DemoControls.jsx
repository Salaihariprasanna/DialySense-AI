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
    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title / Badge */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border-2 border-amber-300">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Simulation Controller
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border-2 ${
                currentMode === 'NORMAL' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : (currentMode === 'RISK' ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse' : 'bg-amber-50 text-amber-800 border-amber-300')
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
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs border-2 ${
              currentMode === 'NORMAL'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20'
                : 'bg-slate-50 text-emerald-800 hover:bg-emerald-50 border-slate-300'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NORMAL</span>
          </button>

          {/* Risk Mode Button */}
          <button
            onClick={() => handleModeChange('RISK')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs border-2 ${
              currentMode === 'RISK'
                ? 'bg-rose-600 text-white border-rose-700 shadow-rose-600/20 animate-pulse'
                : 'bg-slate-50 text-rose-800 hover:bg-rose-50 border-slate-300'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>RISK COLLAPSE</span>
          </button>

          {/* Machine Error Button */}
          <button
            onClick={() => handleModeChange('MACHINE_ERROR')}
            disabled={loadingMode}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs border-2 ${
              currentMode === 'MACHINE_ERROR'
                ? 'bg-amber-600 text-white border-amber-700 shadow-amber-600/20'
                : 'bg-slate-50 text-amber-800 hover:bg-amber-50 border-slate-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>MACHINE ERROR</span>
          </button>

          <div className="h-6 w-[2px] bg-slate-300 hidden sm:block" />

          {/* Step Tick Button */}
          <button
            onClick={handleManualTick}
            disabled={tickLoading}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-300 transition-all shadow-2xs"
            title="Inject single step reading"
          >
            <Zap className={`h-3.5 w-3.5 text-sky-600 ${tickLoading ? 'animate-spin' : ''}`} />
            <span>Step Tick</span>
          </button>

          {/* Auto-Stream Toggle Button */}
          <button
            onClick={handleToggleStream}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs border-2 ${
              isStreaming
                ? 'bg-sky-600 text-white border-sky-700 shadow-sky-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
            }`}
          >
            {isStreaming ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current text-white" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current text-sky-300" />
                <span>Auto Stream (3s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
