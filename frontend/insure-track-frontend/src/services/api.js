
import api from "../axiosConfig"; // This handles the token/interceptors
import axios from "axios";

const BASE_URL = "http://localhost:8082/api";

// Public Instance (Login, Register)
const pub = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// ── AUTH API ──
export const login = (creds) => pub.post("/auth/login", creds);
export const register = (data) => pub.post("/auth/register", data);
export const forgotPassword = (email) => pub.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) => pub.post(`/auth/reset-password?token=${token}`, { password });

// ── CUSTOMER API ──
export const customerClaimsApi = {
  fileClaim: (dto) => pub.post("/customer/claims", dto),
  uploadEvidence: (claimId, formData) =>
    pub.post(`/customer/claims/${claimId}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── ADJUSTER API (Uses 'api' instance for Token) ──
export const claimsApi = {
  getAll: () => api.get("/adjuster/claims"),
  getByStatus: (s) => api.get(`/adjuster/claims/status/${s}`),
  getById: (id) => api.get(`/adjuster/claims/${id}`),
  moveToReview: (id) => api.put(`/adjuster/claims/${id}/review`),
  approve: (id) => api.put(`/adjuster/claims/${id}/approve`),
  reject: (id) => api.put(`/adjuster/claims/${id}/reject`),
};

export const assignmentApi = {
  assign:     (claimId, dto) => api.post(`/adjuster/claims/${claimId}/assign`, dto),
  getByClaim: (claimId)      => api.get(`/adjuster/claims/${claimId}/assignment`),
};


export const reservesApi = {
  create: (claimId, dto) => api.post(`/adjuster/claims/${claimId}/reserve`, dto),
  getByClaim: (claimId) => api.get(`/adjuster/claims/${claimId}/reserves`),
};


export const settlementApi = {
  create:     (claimId, dto) => api.post(`/adjuster/claims/${claimId}/settlement`, dto),
  getByClaim: (claimId)      => api.get(`/adjuster/claims/${claimId}/settlement`),
};

export const evidenceApi = {
  getByClaim: (claimId) => api.get(`/adjuster/claims/${claimId}/evidence`),
};

export const notificationsApi = {
  getAll:      (userId) => api.get(`/notifications/users/${userId}`),
  markRead:    (id)     => api.put(`/notifications/${id}/read`),
  dismiss:     (id)     => api.put(`/notifications/${id}/dismiss`),
  markAllRead: (userId) => api.put(`/notifications/users/${userId}/read-all`),
};



//-------ADMIN API---------
export const getAllProducts    = () => api.get('/admin/products');
export const getAllCoverages   = () => api.get('/admin/products/coverages');
export const addProduct        = (data) => api.post('/admin/products/add', data);
export const addCoverage       = (id, data) => api.post(`/admin/products/${id}/coverages`, data);
export const getAllRatingRules = () => api.get('/admin/rating-rules');
export const addRatingRule     = (id, data) => api.post(`/admin/products/${id}/rating-rules`, data);
export const getAllUsers       = () => api.get('/users');
export const getAuditLogs      = () => api.get('/auth/auditlogs');

export default api;
