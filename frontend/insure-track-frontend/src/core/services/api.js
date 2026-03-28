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
export const getCountofUsers = () => API.get('/auth/users');
// Underwriter Services
export const getAllCases = () => API.get('/underwriter/all');
export const getPendingCases = () => API.get('/underwriter/pending');
export const getDashboardStats = () => API.get('/underwriter/stats');
export const createUnderwritingCase = (quoteId) => API.post(`/underwriter/${quoteId}`);
export const getCaseById = (id) => API.get(`/underwriter/case/${id}`);
export const submitUnderwritingDecision = (id, data) => API.put(`/underwriter/decide/${id}`, data);
export const getUserProfile = () => API.get('/underwriter/profile');
export const updateUserProfile = (data) => API.put('/underwriter/profile', data);
export const getUAuditLogs = (page = 0, size = 10) =>
    API.get(`/underwriter/audit-logs?page=${page}&size=${size}`);
// Get notifications for underwriter
export const getUserNotifications = (userId) => API.get(`/notifications/users/${userId}`);
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const dismissNotification = (id) => API.put(`/notifications/${id}/dismiss`);

//admin
export const getAllProducts = () => API.get('/admin/products/allproducts');
export const getAllCoverages = () => API.get('/admin/products/coverages');
export const addProduct = (productData) => API.post('/admin/products/add', productData);
export const deleteProduct = (productId) => API.delete(`/admin/products/${productId}`);
export const deleteCoverage = (id) => API.delete(`/admin/products/coverages/${id}`);
export const addCoverage = (productId, coverageData) =>
    API.post(`/admin/products/${productId}/coverages`, coverageData);
export const getAllRatingRules = () => API.get('/admin/products/rating-rules');
export const addRatingRule = (productId, ruleData) =>
    API.post(`/admin/products/${productId}/rating-rules`, ruleData);
export const deleteRatingRule = (ruleId) => API.delete(`/admin/products/rating-rules/${ruleId}`);
export const getAllUsers = () => API.get('/admin/users');
export const getAuditLogs = () => API.get('/auth/auditlogs');
export const activateProduct = (id) => API.put(`/admin/products/${id}/activate`);
export const deactivateProduct = (id) => API.put(`/admin/products/${id}/deactivate`);
export const getAdminDashboardStats = () => API.get('/admin/products/stats');

// Quote Endpoints
export const createQuote = (quoteData) => API.post('/quotes/create', quoteData);
export const fetchAllQuotes = () => API.get('/quotes/all');
export const getAllQuotes=()=>API.get('/agent/quotes')
export const rateQuote = (id) => API.put(`/agent/quotes/${id}/rate`);
export const submitQuote = (id) => API.put(`/agent/quotes/${id}/submit`);
export const updateInsuredObject = (objectId, data) =>
    API.put(`/customers/update/insuredobj/${objectId}`, data);

export const fetchActivePolicies = () => API.get('/agent/policies');
export const issuePolicy = (quoteId) => API.post(`/agent/policies/issue`, { quoteId });
export const getPolicyById = (policyId) => API.get(`/agent/policies/${policyId}`);
// Endorsement Endpoints
export const requestEndorsement = (endorsementData) => API.post('/customer/endorsements', endorsementData);
export const fetchAgentEndorsements = () => API.get('/agent/endorsements');
export const approveEndorsement = (id) => API.put(`/agent/endorsements/${id}/approve`);
// Renewal Endpoints
export const fetchAgentRenewals = () => API.get('/agent/renewals');
export const updateRenewalStatusApi = (id, status) =>
    API.patch(`/agent/renewal/${id}/status`, null, {
        params: { status: status }
    });
// Cancellation Endpoints
export const fetchAgentCancellations = () => API.get('/agent/cancellation');
// export const approveCancellation = (id) => API.put(`/agent/cancellation/${id}/approve`);
export const approveCancellation = (id) => API.put(`/${id}/approve`);
//Adjuster
export const customerClaimsApi = {
    fileClaim: (dto) => API.post("/customer/claims", dto),
    uploadEvidence: (claimId, formData) =>
        API.post(`/customer/claims/${claimId}/evidence`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};
export const claimsApi = {
    getAll: () => API.get("/adjuster/claims"),
    getByStatus: (s) => API.get(`/adjuster/claims/status/${s}`),
    getById: (id) => API.get(`/adjuster/claims/${id}`),
    moveToReview: (id) => API.put(`/adjuster/claims/${id}/review`),
    approve: (id) => API.put(`/adjuster/claims/${id}/approve`),
    reject: (id) => API.put(`/adjuster/claims/${id}/reject`),
    getPolicyInfo:      (policyId) => API.get(`/adjuster/claims/policy/${policyId}`),
    getPolicyCoverages: (policyId) => API.get(`/adjuster/claims/policy/${policyId}/coverages`),
 
};
export const assignmentApi = {
    assign: (claimId, dto) => API.post(`/adjuster/claims/${claimId}/assign`, dto),
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/assignment`),
};
export const reservesApi = {
    create: (claimId, dto) => API.post(`/adjuster/claims/${claimId}/reserve`, dto),
    getByClaim: (claimId) => API.get(`/adjuster/claims/${claimId}/reserves`),
    getByPolicy: (policyId) => API.get(`/adjuster/claims/policy/${policyId}/reserves`),
};
export const settlementApi = {
    getAll: () => API.get("/adjuster/claims/settlements/all"), // Check if this exists in Controller
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
//Customer
export const getAllCustomers = () => API.get('/customers');
export const createCustomer = (userId, data) =>
    API.post(`/customers/${userId}`, data);
export const updateCustomer = (customerId, data) =>
    API.put(`/customers/update/${customerId}`, data);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
 
// --- BENEFICIARIES ---
export const addBeneficiary = (id, dto) => {
    if (!id || id === "undefined") return Promise.reject("Missing Customer ID");
    return API.post(`/customers/${id}/beneficiaries`, dto);
};
 
// --- INSURED OBJECTS ---
export const addInsuredObject = (id, dto) => {
    if (!id || id === "undefined") return Promise.reject("Missing Customer ID");
    return API.post(`/customers/${id}/insuredobjects`, dto);
};
export const getBeneficiaries = (id) => API.get(`/customers/${id}/beneficiaries`);
export const getInsuredObjects = (customerId) => {
    return API.get(`/customers/${customerId}/insuredobjects`);
};
// --- QUOTES
export const createQuoteDraft = (dto) => API.post('/agent/quotes/draft', dto);
export const getCustomerQuotes = (id) => API.get(`/agent/quotes/customers/${id}`);
export const createEndorsement = (data) => API.post('/customers/endorsements', data);

// Billing / Payment Endpoints
export const getInvoicesByPolicy = (policyId) => API.get(`/analyst/billing/policies/${policyId}/invoices`);
export const makePayment = (invoiceId, paymentData) => API.post(`/analyst/billing/invoices/${invoiceId}/pay`, paymentData);
export const cancelPolicy = (cancelData) => API.post('/policies/cancel', cancelData);
export default API;