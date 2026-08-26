import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = (credentials) => api.post('/auth/login', credentials);

export const getPatients = () => api.get('/patients');
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

export const getMachines = () => api.get('/machines');
export const createMachine = (data) => api.post('/machines', data);
export const updateMachine = (id, data) => api.put(`/machines/${id}`, data);

export const getSessions = (status) => api.get('/sessions', { params: { status_filter: status } });
export const getSessionById = (id) => api.get(`/sessions/${id}`);
export const getCurrentActiveSession = () => api.get('/sessions/active/current');
export const createSession = (data) => api.post('/sessions', data);
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);

export const getReadingsHistory = (sessionId, limit = 40) => api.get(`/readings/session/${sessionId}`, { params: { limit } });
export const getLatestReading = (sessionId) => api.get(`/readings/session/${sessionId}/latest`);
export const postReading = (data) => api.post('/readings', data);

export const getAlerts = (params) => api.get('/alerts', { params });
export const acknowledgeAlert = (id, acknowledgedBy = 'Clinical Staff') => api.put(`/alerts/${id}/acknowledge`, { acknowledged_by: acknowledgedBy });
export const acknowledgeAllAlerts = () => api.post('/alerts/acknowledge-all');

export const generateSessionReport = (sessionId) => api.post(`/reports/session/${sessionId}/generate`);
export const getSessionReportInfo = (sessionId) => api.get(`/reports/session/${sessionId}`);
export const getDownloadReportUrl = (filename) => `${API_BASE_URL}/reports/download/${filename}`;

export const setSimulationMode = (mode, sessionId, patientId) => api.post('/simulation/mode', { mode, session_id: sessionId, patient_id: patientId });
export const triggerSimulationTick = (sessionId, patientId, mode) => api.post('/simulation/tick', null, { params: { session_id: sessionId, patient_id: patientId, mode } });
export const controlSimulation = (action, intervalSeconds = 3.0) => api.post('/simulation/control', { action, interval_seconds: intervalSeconds });
export const getSimulationStatus = () => api.get('/simulation/status');

export default api;
