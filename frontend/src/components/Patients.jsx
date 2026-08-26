import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Play, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Calendar,
  X
} from 'lucide-react';
import { createPatient, createSession } from '../services/api';

export default function Patients({ 
  patients = [], 
  machines = [], 
  onRefresh, 
  onNotification 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
  const [selectedPatientForSession, setSelectedPatientForSession] = useState(null);

  // New Patient Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: 55,
    gender: 'Male',
    blood_group: 'O+',
    disease_stage: 'Stage 5 CKD',
    doctor: 'Dr. Sarah Jenkins',
    contact: '+1 (555) 234-5678'
  });

  // Start Session Form State
  const [sessionForm, setSessionForm] = useState({
    machine_id: machines[0]?.id || 1,
    target_duration_mins: 240,
    target_uf_volume_ml: 2500
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await createPatient(patientForm);
      setIsAddPatientOpen(false);
      setPatientForm({
        name: '',
        age: 55,
        gender: 'Male',
        blood_group: 'O+',
        disease_stage: 'Stage 5 CKD',
        doctor: 'Dr. Sarah Jenkins',
        contact: '+1 (555) 234-5678'
      });
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Patient Registered',
          message: `Patient record created successfully.`
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Create patient error:', err);
      if (onNotification) {
        onNotification({
          type: 'danger',
          title: 'Registration Error',
          message: err.response?.data?.detail || 'Failed to create patient.'
        });
      }
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedPatientForSession) return;
    try {
      await createSession({
        patient_id: selectedPatientForSession.id,
        machine_id: Number(sessionForm.machine_id),
        target_duration_mins: Number(sessionForm.target_duration_mins),
        target_uf_volume_ml: Number(sessionForm.target_uf_volume_ml)
      });
      setIsStartSessionOpen(false);
      setSelectedPatientForSession(null);
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Dialysis Session Started',
          message: `Session assigned to machine for ${selectedPatientForSession.name}.`
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Start session error:', err);
      if (onNotification) {
        onNotification({
          type: 'danger',
          title: 'Session Creation Error',
          message: err.response?.data?.detail || 'Failed to start dialysis session.'
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
            <Users className="h-6 w-6 text-sky-600" />
            Patient Registry & Hemodialysis Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage chronic kidney disease (CKD) patient records and launch new dialysis sessions
          </p>
        </div>

        <button
          onClick={() => setIsAddPatientOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredPatients.length}</span> of {patients.length} registered patients
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Patient Details</th>
                <th className="py-3.5 px-5">Age / Gender</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Disease Stage</th>
                <th className="py-3.5 px-5">Nephrologist</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900">{patient.name}</div>
                    <div className="text-[11px] font-mono text-sky-700">{patient.patient_id}</div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {patient.age} yrs • {patient.gender}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[11px]">
                      {patient.blood_group}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-semibold text-slate-800">{patient.disease_stage}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {patient.doctor}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                    {patient.contact}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => {
                        setSelectedPatientForSession(patient);
                        setIsStartSessionOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs transition-all"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Session</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-sky-600" />
                Register New CKD Patient
              </h2>
              <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clara Oswald"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={patientForm.blood_group}
                    onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
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
                <label className="block text-slate-600 font-semibold mb-1">Disease Stage</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                  value={patientForm.disease_stage}
                  onChange={(e) => setPatientForm({ ...patientForm, disease_stage: e.target.value })}
                >
                  <option value="Stage 5 CKD">Stage 5 CKD (End-Stage Renal Disease)</option>
                  <option value="Stage 4 CKD">Stage 4 CKD (Severe GFR 15-29)</option>
                  <option value="Acute Kidney Injury">Acute Kidney Injury (AKI)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Attending Nephrologist</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                  value={patientForm.doctor}
                  onChange={(e) => setPatientForm({ ...patientForm, doctor: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                  value={patientForm.contact}
                  onChange={(e) => setPatientForm({ ...patientForm, contact: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-sm shadow-sky-600/20"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      {isStartSessionOpen && selectedPatientForSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Play className="h-5 w-5 text-emerald-600 fill-current" />
                  Initiate Dialysis Session
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Patient: <span className="text-slate-800 font-bold">{selectedPatientForSession.name}</span>
                </p>
              </div>
              <button onClick={() => setIsStartSessionOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Assign Hemodialyzer Unit</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-semibold"
                  value={sessionForm.machine_id}
                  onChange={(e) => setSessionForm({ ...sessionForm, machine_id: e.target.value })}
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.machine_code} • {m.model} ({m.status}) - {m.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Duration (Minutes)</label>
                  <input
                    type="number"
                    min="60"
                    max="480"
                    step="30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={sessionForm.target_duration_mins}
                    onChange={(e) => setSessionForm({ ...sessionForm, target_duration_mins: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400">Standard: 240 mins (4h)</span>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Prescribed UF Volume (mL)</label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    step="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white"
                    value={sessionForm.target_uf_volume_ml}
                    onChange={(e) => setSessionForm({ ...sessionForm, target_uf_volume_ml: e.target.value })}
                  />
                  <span className="text-[10px] text-slate-400">Target Fluid Removal</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStartSessionOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm shadow-emerald-600/20"
                >
                  Launch Treatment Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
