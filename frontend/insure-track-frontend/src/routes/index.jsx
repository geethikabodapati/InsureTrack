import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { Layout }        from "../modules/adjuster/components/Layout";
import Login             from "../modules/user/components/Login";
import Register          from "../modules/user/components/Register";
import ForgotPassword    from "../modules/user/components/ForgotPassword";
import ResetPassword     from "../modules/user/components/ResetPassword";

import { Dashboard }     from "../modules/adjuster/pages/Dashboard";
import { FNOLIntake }    from "../modules/adjuster/pages/FNOLIntake";
import { MyClaims }      from "../modules/adjuster/pages/MyClaims";
import { ClaimTriage }   from "../modules/adjuster/pages/ClaimTriage";
import { Investigation } from "../modules/adjuster/pages/Investigation";
import { Reserves }      from "../modules/adjuster/pages/Reserves";
import { Settlements }   from "../modules/adjuster/pages/Settlements";
import { Evidence }      from "../modules/adjuster/pages/Evidence";
import { Reports }       from "../modules/adjuster/pages/Reports";
import { Notifications } from "../modules/adjuster/pages/Notifications";
import { Settings }      from "../modules/adjuster/pages/Settings";


import AdminLayout from "../modules/admin/components/AdminLayout";
import AdminDashboard from "../modules/admin/components/AdminDashboard";
import ProductList from "../modules/admin/components/ProductList";
import CoverageList from "../modules/admin/components/CoverageList";
import RatingRuleList from "../modules/admin/components/RatingRuleList";
import UserList from "../modules/admin/components/UserList";
import AuditLogList from "../modules/admin/components/AuditLogList";
import AdminSettings from "../modules/admin/components/AdminSettings";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const role  = localStorage.getItem("role");
//   if (!token)              return <Navigate to="/login" replace />;
//   if (role == "ADJUSTER") return <Navigate to="/adjuster" replace />;
//   if (role == "ADMIN") return <Navigate to="/admin" replace />;
//   return children;
// };
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  // 1. No token? Go to login
  if (!token) return <Navigate to="/login" replace />;

  // 2. Role Check: If a specific role is required for this route (like ADMIN)
  // but the user's role doesn't match, kick them out.
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. If everything is fine, show the page!
  return children;
};
//In previous versions, navigation was "Component-Based" (React had to render to find out what the routes were). Now, it is "Object-Based."
//createBrowserRouter creates a static map of your entire app before it even renders. This allows the router to handle things like "Loaders" and "Actions" (fetching data before the page shows up).
//it is a lookup table 
//protectedroute is the security and the Layout is the wrapper 
export const router = createBrowserRouter([
  { path: "/login",           element: <Login /> },
  { path: "/register",        element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password",  element: <ResetPassword /> },
  {
    path: "/adjuster",
    element: <ProtectedRoute allowedRole="ADJUSTER"><Layout /></ProtectedRoute>,
    children: [
      { index: true,           element: <Dashboard />    },
      { path: "fnol",          element: <FNOLIntake />   },
      { path: "myclaims",      element: <MyClaims />     },
      { path: "triage",        element: <ClaimTriage />  },
      { path: "investigation", element: <Investigation />},
      { path: "reserves",      element: <Reserves />     },
      { path: "settlements",   element: <Settlements />  },
      { path: "evidence",      element: <Evidence />     },
      { path: "reports",       element: <Reports />      },
      { path: "notifications", element: <Notifications />},
      { path: "settings",      element: <Settings />     },
    ],
  },

  //-------ADMIN SECTION ----------------
  {
    path:"/admin",
    element:<ProtectedRoute allowedRole="ADMIN"><AdminLayout/></ProtectedRoute>,
    children:[
      {index:true, element:<AdminDashboard/>},
      {path:"products", element:<ProductList/>},
      {path:"coverages",element:<CoverageList/>},
      {path:"rules",element:<RatingRuleList/>},
      {path:"users",element:<UserList/>},
      {path:"logs",element:<AuditLogList/>},
      { path: "settings",      element: <AdminSettings /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },

]);


