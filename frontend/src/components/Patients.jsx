import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Play, 
  Search, 
  Edit3, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { createPatient, createSession } from '../services/api';

export default function Patients({ 
  patients, 
  sessions, 
  machines, 
  onRefresh, 
  onSelectSession, 
  onNotification 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedPatientForSession, setSelectedPatientForSession] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 55,
    gender: 'Male',
    blood_group: 'O+',
    disease_stage: 'Stage 5 CKD',
    doctor: 'Dr. Sarah Jenkins',
    contact: '+1-555-0192',
    notes: ''
  });

  const [sessionFormData, setSessionFormData] = useState({
    machine_id: '',
    target_duration_mins: 240,
    target_uf_volume_ml: 2500,
    notes: 'Prescribed hemodialysis treatment'
  });

  const filteredPatients = (patients || []).filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await createPatient(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        age: 55,
        gender: 'Male',
        blood_group: 'O+',
        disease_stage: 'Stage 5 CKD',
        doctor: 'Dr. Sarah Jenkins',
        contact: '+1-555-0192',
        notes: ''
      });
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Patient Added',
          message: `Successfully registered patient ${formData.name}.`
        });
      }
      onRefresh();
    } catch (err) {
      console.error('Create patient error:', err);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      const res = await createSession({
        patient_id: selectedPatientForSession.id,
        machine_id: sessionFormData.machine_id ? Number(sessionFormData.machine_id) : (machines?.[0]?.id || 1),
        status: 'ONGOING',
        target_duration_mins: Number(sessionFormData.target_duration_mins),
        target_uf_volume_ml: Number(sessionFormData.target_uf_volume_ml),
        notes: sessionFormData.notes
      });
      setIsSessionModalOpen(false);
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Session Started',
          message: `Dialysis session ${res.data.session_code} is now ONGOING.`
        });
      }
      onRefresh();
      if (onSelectSession) onSelectSession(res.data);
    } catch (err) {
      console.error('Start session error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Patient Clinical Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage chronic kidney disease patient profiles, prescriptions & hemodialysis sessions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-400 ml-1" />
        <input 
          type="text"
          placeholder="Search by patient name, ID (e.g. PAT-101), or nephrologist..."
          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Patient Code</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Diagnosis / Stage</th>
                <th className="py-3 px-4">Nephrologist</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPatients.map((p) => {
                const patientSession = (sessions || []).find(s => s.patient_id === p.id && s.status === 'ONGOING');
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {p.patient_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.age} yrs • {p.gender}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-200 font-bold font-mono">
                        {p.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {p.disease_stage}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.doctor}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {p.contact}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {patientSession ? (
                        <button
                          onClick={() => onSelectSession && onSelectSession(patientSession)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-emerald-900/60"
                        >
                          <Activity className="h-3 w-3" /> Live Session
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPatientForSession(p);
                            setIsSessionModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-cyan-900/60"
                        >
                          <Play className="h-3 w-3" /> Start Session
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">Register New Patient</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Gender</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Blood Group</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Disease Stage</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  value={formData.disease_stage}
                  onChange={(e) => setFormData({ ...formData, disease_stage: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nephrologist / Doctor</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Clinical Notes</label>
                <textarea
                  rows="2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Vascular access details, allergies, ultrafiltration targets..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md shadow-cyan-600/30"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      {isSessionModalOpen && selectedPatientForSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                Start Dialysis: {selectedPatientForSession.name}
              </h2>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Assign Dialysis Unit</label>
                <select
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  value={sessionFormData.machine_id}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, machine_id: e.target.value })}
                >
                  <option value="">Select Machine...</option>
                  {(machines || []).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.machine_code} ({m.model}) - {m.status} [{m.location}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target Duration (min)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={sessionFormData.target_duration_mins}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, target_duration_mins: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target UF Volume (mL)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    value={sessionFormData.target_uf_volume_ml}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, target_uf_volume_ml: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Session Protocol Notes</label>
                <textarea
                  rows="2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  value={sessionFormData.notes}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md shadow-cyan-600/30"
                >
                  Launch Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
