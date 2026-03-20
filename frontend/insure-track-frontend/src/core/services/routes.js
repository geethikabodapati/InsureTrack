import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../../modules/user/components/Login';
import Register from '../../modules/user/components/Register';
// import Dashboard from '../../core/components/Dashboard';
// import AdminDashboard from '../../modules/admin/components/AdminDashboard';
import CustomerDashboard from '../../modules/customer/components/CustomerDashboard';
import RegisterUser from '../../modules/admin/components/RegisterUser';
import ForgotPassword from '../../modules/user/components/ForgotPassword';
import ResetPassword from '../../modules/user/components/ResetPassword';
//Underwriting imports
import Layout from '../../modules/underwriter/components/Layout';
import Dashboard from '../../modules/underwriter/pages/Dashboard';
import UnderwritingCases from '../../modules/underwriter/pages/UnderwriterCases';
import RiskAssessment from '../../modules/underwriter/pages/RiskAssessment';
import Reports from '../../modules/underwriter/pages/Reports';
import Notifications from '../../modules/underwriter/pages/Notifications';
import Settings from '../../modules/underwriter/pages/Settings';

//Analyst imports
import AnalystDashboard from '../../modules/analyst/components/AnalystDashboard';
import BillingDashboard from "../../modules/analyst/components/BillingDashboard";
import PaymentsDashboard from '../../modules/analyst/components/PaymentsDashboard';
import ClaimsDashboard from '../../modules/analyst/components/ClaimsDashboard';
import RefundDashboard from '../../modules/analyst/components/RefundDashboard';
import AnalystLayout from '../../modules/analyst/AnalystLayout';
import AnalystOverview from '../../modules/analyst/components/AnalystOverview';

//Admin

import AdminLayout from '../../modules/admin/components/AdminLayout';
import AdminDashboard from '../../modules/admin/components/AdminDashboard';
import ProductList from '../../modules/admin/components/ProductList';
import CoverageList from '../../modules/admin/components/CoverageList';
import RatingRuleList from '../../modules/admin/components/RatingRuleList';
import UserList from '../../modules/admin/components/UserList'; // Add this import
import AuditLogList from '../../modules/admin/components/AuditLogList';
import AdminSettings from '../../modules/admin/components/AdminSettings';

//Agent
// Import the Agent Module components
import AgentDashboard from '../../modules/agent/AgentDashboard';
import AgentLayout from '../../modules/agent/AgentLayout';
import QuoteManagement from '../../modules/agent/components/QuoteManagement';
import PolicyManagement from '../../modules/agent/components/PolicyManagement';
import EndorsementManagement from '../../modules/agent/components/EndorsementManagement';
import CancellationManagement from '../../modules/agent/components/CancellationManagement';
import RenewalManagement from '../../modules/agent/components/RenewalManagement';

//Adjuster
import { Layout as AdjusterLayout } from '../../modules/adjuster/components/Layout';
import { Dashboard as AdjusterDashboard } from '../../modules/adjuster/pages/AdjusterDashboard';
import { FNOLIntake } from '../../modules/adjuster/pages/FNOLIntake';
import { MyClaims } from '../../modules/adjuster/pages/MyClaims';
import { ClaimTriage } from '../../modules/adjuster/pages/ClaimTriage';
import { Investigation } from '../../modules/adjuster/pages/Investigation';
import { Reserves } from '../../modules/adjuster/pages/Reserves';
import { Settlements } from '../../modules/adjuster/pages/Settlements';
import { Evidence } from '../../modules/adjuster/pages/Evidence';
import { Reports as AdjusterReports } from '../../modules/adjuster/pages/Reports';
import { Notifications as AdjusterNotifications } from '../../modules/adjuster/pages/Notifications';
import { Settings as AdjusterSettings } from '../../modules/adjuster/pages/Settings';
import UnderwriterLayout from '../../modules/underwriter/UnderwriterLayout';
import DashboardStats from '../../modules/agent/components/DashboardStats';


function AppRoutes() {
    const token = localStorage.getItem("token");

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register/user" element={<RegisterUser />} />

                {/* <Route path="/admin-dashboard" element={token ? <AdminDashboard/> : <Navigate to="/login" />} /> */}
                <Route path="/customer-dashboard" element={token ? <CustomerDashboard /> : <Navigate to="/login" />} />
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                {/* --- Underwriter Dashboard Group --- */}
                <Route path="/underwriter-dashboard" element={<UnderwriterLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="cases" element={<UnderwritingCases />} />
                    <Route path="risk-assessment/:id" element={<RiskAssessment />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                {/*Analyst*/}
                <Route element={token ? <AnalystLayout /> : <Navigate to="/login" />}>
                    <Route path="/analyst-dashboard" element={<AnalystOverview />} />
                    <Route path="/billing" element={token ? <BillingDashboard /> : <Navigate to="/" />} />
                    <Route path="/payments" element={token ? <PaymentsDashboard /> : <Navigate to="/" />} />
                    <Route path="/claims" element={token ? <ClaimsDashboard /> : <Navigate to="/" />} />
                    <Route path="/refund" element={token ? <RefundDashboard /> : <Navigate to="/" />} />
                </Route>

                <Route element={token ? <AdminLayout /> : <Navigate to="/login" />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-products" element={<ProductList />} />
                    <Route path="/admin-coverages" element={<CoverageList />} />
                    <Route path="/admin-rules" element={<RatingRuleList />} />
                    <Route path="/admin-users" element={<UserList />} />
                    <Route path="/admin-logs" element={<AuditLogList />} />
                    <Route path="admin-settings" element={<AdminSettings />} />
                </Route>

                {/* Catch-all redirect */}
                {/* <Route path="*" element={<Navigate to="/login" />} /> */}
                {/* --- AGENT ROUTES WRAPPED IN LAYOUT --- */}
                <Route
                    path="/agent-dashboard"
                    element={token ? <AgentLayout /> : <Navigate to="/login" />}
                >
                    {/* These will automatically render inside the AgentLayout Outlet */}
                    <Route index element={token ? <AgentDashboard /> : <Navigate to="/login" />} />
                    <Route path="" element={<DashboardStats />} />
                    <Route path="quotes" element={<QuoteManagement />} />
                    <Route path="policies" element={<PolicyManagement />} />
                    <Route path="endorsements" element={<EndorsementManagement />} />
                    <Route path="renewals" element={<RenewalManagement />} />
                    <Route path="cancellations" element={<CancellationManagement />} />
                    {/* You can easily add endorsements, claims, etc. here later */}
                </Route>
                {/* ── Adjuster ── */}
                <Route
                    path="/adjuster-dashboard"
                    element={
                        <AdjusterLayout />
                    }
                >
                    <Route index element={<AdjusterDashboard />} />
                    <Route path="fnol" element={<FNOLIntake />} />
                    <Route path="myclaims" element={<MyClaims />} />
                    <Route path="triage" element={<ClaimTriage />} />
                    <Route path="investigation" element={<Investigation />} />
                    <Route path="reserves" element={<Reserves />} />
                    <Route path="settlements" element={<Settlements />} />
                    <Route path="evidence" element={<Evidence />} />
                    <Route path="reports" element={<AdjusterReports />} />
                    <Route path="notifications" element={<AdjusterNotifications />} />
                    <Route path="settings" element={<AdjusterSettings />} />
                </Route>

            </Routes>

        </Router>
    );
}
export default AppRoutes;