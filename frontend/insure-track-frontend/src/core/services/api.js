import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8082/api',
});
// Automatically add the JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Auth
export const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};
//Auth services
export const register = (userData) => API.post('/auth/register', userData);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) =>
    API.post(`/auth/reset-password?token=${token}`, { password: newPassword });

// Underwriter Services
export const getAllCases = () => API.get('/underwriter/all');
export const getPendingCases = () => API.get('/underwriter/pending');
export const getDashboardStats = () => API.get('/underwriter/stats');
export const createUnderwritingCase = (quoteId) => API.post(`/underwriter/${quoteId}`);
export const getCaseById = (id) => API.get(`/underwriter/case/${id}`);
export const submitUnderwritingDecision = (id, data) => API.put(`/underwriter/decide/${id}`, data);
export const getUserProfile = () => API.get('/underwriter/profile');
export const updateUserProfile = (data) => API.put('/underwriter/profile', data);
// export const getAuditLogs = () => API.get('/underwriter/audit-logs');
export const getUAuditLogs = (page = 0, size = 10) =>
    API.get(`/underwriter/audit-logs?page=${page}&size=${size}`);

//admin
export const getAllProducts = () => API.get('/admin/products');
export const getAllCoverages = () => API.get('/admin/products/coverages');
export const addProduct = (productData) => API.post('/admin/products/add', productData);
export const addCoverage = (productId, coverageData) =>
    API.post(`/admin/products/${productId}/coverages`, coverageData);
export const getAllRatingRules = () => API.get('/admin/products/rating-rules');
export const addRatingRule = (productId, ruleData) =>
    API.post(`/admin/products/${productId}/rating-rules`, ruleData);
export const getAllUsers = () => API.get('/admin/users');
export const getAuditLogs = () => API.get('/auth/auditlogs');

//
// Quote Endpoints
export const createQuote = (quoteData) => API.post('/quotes/create', quoteData);
export const fetchAllQuotes = () => API.get('/quotes/all');

// Endorsement Endpoints (Mapping to your RequestDTO)
export const requestEndorsement = (endorsementData) => API.post('/policies/endorse', endorsementData);
export const fetchEndorsements = () => API.get('/policies/endorsements');

// Renewal Endpoints
export const fetchRenewals = () => API.get('/policies/renewals');
export const updateRenewalStatus = (id, status) => API.put(`/policies/renewals/${id}`, { status });

export const customerClaimsApi = {
    fileClaim: (dto) => API.post("/customer/claims", dto),
    uploadEvidence: (claimId, formData) =>
        API.post(`/customer/claims/${claimId}/evidence`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};
// ── ADJUSTER API (Uses 'api' instance for Token) ──
export const claimsApi = {
    getAll: () => API.get("/adjuster/claims"),
    getByStatus: (s) => API.get(`/adjuster/claims/status/${s}`),
    getById: (id) => API.get(`/adjuster/claims/${id}`),
    moveToReview: (id) => API.put(`/adjuster/claims/${id}/review`),
    approve: (id) => API.put(`/adjuster/claims/${id}/approve`),
    reject: (id) => API.put(`/adjuster/claims/${id}/reject`),
};

export const assignmentApi = {
    assign: (claimId, dto) => API.post(`/adjuster/claims/${claimId}/assign`, dto),
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/assignment`),
};


export const reservesApi = {
    create: (claimId, dto) => API.post(`/adjuster/claims/${claimId}/reserve`, dto),
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/reserves`),
};


export const settlementApi = {
    create: (claimId, dto) => API.post(`/adjuster/claims/${claimId}/settlement`, dto),
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/settlement`),
};

export const evidenceApi = {
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/evidence`),
};

export const notificationsApi = {
    getAll: (userId) => API.get(`/notifications/users/${userId}`),
    markRead: (id) => API.put(`/notifications/${id}/read`),
    dismiss: (id) => API.put(`/notifications/${id}/dismiss`),
    markAllRead: (userId) => API.put(`/notifications/users/${userId}/read-all`),
};
export default API;