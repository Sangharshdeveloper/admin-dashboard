import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/context/AuthContext';
import ProtectedRoute from './admin/components/common/ProtectedRoute';
import LoginPage from './admin/pages/LoginPage';
import AdminDashboard from './admin/AdminDashboard';
import DashboardPage from './admin/pages/DashboardPage';
import CustomersPage from './admin/pages/UsersPage';
import VendorsPage from './admin/pages/VendorsPage';
import NotificationsPage from './admin/pages/NotificationsPage';
import PendingApprovalsPage from './admin/pages/PendingApprovalsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Admin Dashboard */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            {/* Nested routes inside AdminDashboard */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="pending-approvals" element={<PendingApprovalsPage />} />
            
            {/* Default redirect to dashboard */}
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;