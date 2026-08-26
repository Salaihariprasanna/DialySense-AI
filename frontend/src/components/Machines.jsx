import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Power, 
  MapPin, 
  Wifi, 
  ShieldCheck, 
  AlertTriangle,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';
import { createMachine } from '../services/api';

export default function Machines({ machines = [], onRefresh, onNotification }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    machine_code: '',
    model: 'DialySense Pro-5000',
    serial_number: '',
    status: 'AVAILABLE',
    location: 'Dialysis Ward A - Bed 3',
    ip_address: '192.168.1.104'
  });

  const handleAddMachine = async (e) => {
    e.preventDefault();
    try {
      await createMachine(formData);
      setIsAddModalOpen(false);
      setFormData({
        machine_code: '',
        model: 'DialySense Pro-5000',
        serial_number: '',
        status: 'AVAILABLE',
        location: 'Dialysis Ward A - Bed 3',
        ip_address: '192.168.1.104'
      });
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Machine Registered',
          message: `Dialysis machine ${formData.machine_code || 'unit'} added to fleet inventory.`
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Create machine error:', err);
      if (onNotification) {
        onNotification({
          type: 'danger',
          title: 'Error Adding Machine',
          message: err.response?.data?.detail || 'Failed to add machine.'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-sky-600" />
            Hemodialysis Machine Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Hardware telemetry nodes, bed assignments & preventive maintenance status
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const nextNum = (machines?.length || 0) + 1;
              setFormData({
                machine_code: `DIALY-0${nextNum}`,
                model: 'DialySense Pro-5000',
                serial_number: `DSP-2026-00${nextNum}`,
                status: 'AVAILABLE',
                location: `Ward A - Bed ${nextNum}`,
                ip_address: `192.168.1.10${nextNum}`
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Machine</span>
          </button>
        </div>
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
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                    {m.machine_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{m.model}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">SN: {m.serial_number}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isRunning 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : (isError ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700')
                }`}>
                  {m.status}
                </span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center text-slate-600 gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{m.location}</span>
                </div>
                <div className="flex items-center text-slate-600 gap-2 font-mono text-[11px]">
                  <Wifi className="h-4 w-4 text-sky-600" />
                  <span>Node IP: {m.ip_address || '192.168.1.10x'}</span>
                </div>
                <div className="flex items-center text-emerald-700 gap-2 text-[11px] font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Safety Diagnostics: Certified Operational</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Machine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-600" />
                Register Dialysis Machine
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMachine} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Machine Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIALY-04"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                    value={formData.machine_code}
                    onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DialySense Pro-5000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-DSP-2026-004"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Initial Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-semibold"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ward Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dialysis Ward B - Bed 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">IP Address / Node IP</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.104"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-sm shadow-sky-600/20"
                >
                  Save Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
