import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import CustomersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token] = useState('demo-token'); // Replace with actual auth token

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage token={token} />;
      case 'vendors':
        return <VendorsPage token={token} />;
      case 'approvals':
        return <PendingApprovalsPage token={token} />;
      case 'customers':
        return <CustomersPage token={token} />;
      case 'notifications':
        return <NotificationsPage token={token} />;
      default:
        return <DashboardPage token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-x-hidden">{renderPage()}</main>
      </div>
    </div>
  );
}
