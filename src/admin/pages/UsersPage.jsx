import StatCard from '../components/common/StatCard';
import React, { useState, useEffect, useCallback } from 'react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';
import { enZA } from 'date-fns/locale';
import { 
   Users, TrendingUp,
    Search, 
    Eye, 
    Trash2, 
    CheckCircle, 
    User, 
    Phone, 
    Mail, 
    Loader2, 
    ArrowUpRight, 
    ArrowDownRight 
} from 'lucide-react';


// Utility Hook for Search Debouncing (copied from VendorsPage)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


// --- User Details Modal Content Component ---
const UserDetailsModal = ({ user, onClose, refreshUsers }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Example: Handle Status/Role Change (if implemented)
  const handleStatusChange = async (newStatus) => {
    setIsSubmitting(true);
    setMessage('');
    
    // NOTE: This PUT endpoint is assumed. If your API supports status change, use the correct endpoint.
    try {
      await apiService.put(`/admin/users/${user.user_id}/status`, { status: newStatus });
      setMessage(`Successfully updated status to ${newStatus}.`);
      refreshUsers();
      setTimeout(onClose, 1500); 
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage(`Failed to update status: ${error.message || 'Network error'}.`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const getStatusBadge = (currentStatus) => {
      let icon, colorClasses, label;
      switch (currentStatus) {
          case 'active':
              icon = ArrowUpRight;
              colorClasses = 'bg-green-100 text-green-700';
              label = 'Active';
              break;
          case 'inactive':
              icon = ArrowDownRight;
              colorClasses = 'bg-yellow-100 text-yellow-700';
              label = 'Inactive';
              break;
          default:
              icon = null;
              colorClasses = 'bg-gray-100 text-gray-700';
              label = 'Unknown';
              break;
      }
      const IconComponent = icon;
      return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${colorClasses}`}>
              {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
              {label}
          </span>
      );
  };

  return (
    <div className="space-y-6">
      
      {/* Basic Info */}
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h4 className="text-xl font-bold text-indigo-800 flex items-center mb-2">
            <User className="w-5 h-5 mr-2" />
            {user.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                <strong>Email:</strong> {user.email}
            </p>
            <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                <strong>Phone:</strong> {user.phone_number}
            </p>
            <p><strong>User ID:</strong> <span className="font-mono text-xs text-gray-600">{user.user_id}</span></p>
            <p><strong>Role:</strong> <span className="font-semibold capitalize">{user.role}</span></p>
            <p><strong>Location:</strong> {user.city || 'N/A'}, {user.state || 'N/A'}</p>
            <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
        </div>
      </div>

      {/* Status & Verification */}
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 mb-3">Account Status & Dates</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Account Status:</strong> {getStatusBadge(user.status)}</p>
          <p>
            <strong>Is Verified (Admin):</strong> 
            <span className={`font-semibold ml-2 ${user.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                {user.is_verified ? <CheckCircle className="w-4 h-4 inline mr-1" /> : ''}{user.is_verified ? 'Yes' : 'No'}
            </span>
          </p>
          <p className="col-span-2">
            <strong>Last Login:</strong> 
            <span className="ml-2 font-medium">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</span>
          </p>
          <p className="col-span-2">
            <strong>Created On:</strong> 
            <span className="ml-2 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
          </p>
        </div>
      </div>
      
      {/* Message Area and Close Button */}
      {message && <p className={`text-sm font-medium mt-3 p-3 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{message}</p>}

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};


// --- Main Users Page Component ---

const UsersPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1 // Assuming pagination support
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Set the token on the class instance
  useEffect(() => {
      if (token) {
          apiService.setAuthToken(token);
      }
  }, [token]);

  // Apply debounce to the search input value
  const debouncedSearch = useDebounce(filters.search, 400);

  // Function to fetch users data
  const fetchUsers = useCallback(async () => {
    if (!token) return; 
    setLoading(true);

    try {
      // Endpoint /admin/users uses 'data' array in the sample response
      const response = await apiService.get(`/admin/users`, {
        status: filters.status,
        search: debouncedSearch,
        page: filters.page
      });
      
      const userList = (response.data || response.users || []).map(u => ({
        id: u.user_id, // Use user_id as the primary ID
        ...u
      }));

      setUsers(userList);

    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  }, [token, filters.status, filters.page, debouncedSearch]);

  // Effect to trigger fetch when filters or debounced search change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Action Handlers ---

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      setIsDeleteModalOpen(false);
      // API call to delete (assuming endpoint /admin/users/{id})
      await apiService.delete(`/admin/users/${userToDelete.id}`);
      setUserToDelete(null);
      await fetchUsers(); // Refresh the list after successful deletion
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Display error feedback
      setSelectedUser({ 
          name: userToDelete.name, 
          error: `Failed to delete user: ${error.message || 'Check console for details.'}`
      });
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };


  // --- Table Columns Definition ---
  const columns = [
    { header: 'ID', field: 'user_id' },
    { header: 'Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'Phone', field: 'phone_number' },
    { header: 'Role', field: 'role' },
    { header: 'City', field: 'city' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-full transition"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-full transition"
            title="Delete User"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900 border-b-2 border-indigo-100 pb-4">
            Customer Management
          </h1>
        </header>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-indigo-50 p-4 rounded-xl">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-inner"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Status Filter (Example) */}
            <select
              className="flex-grow px-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white shadow-sm transition"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <section className="min-h-[400px]">
          <Table columns={columns} data={users} loading={loading} />
          {/* TODO: Add pagination controls here */}
        </section>
      </div>

      {/* View/Edit Modal */}
      {selectedUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`User Details: ${selectedUser.name}`}
        >
          {selectedUser.error ? (
              <div className="p-4 text-red-700 bg-red-50 rounded-lg">
                  <h4 className="font-bold">Error</h4>
                  <p>{selectedUser.error}</p>
              </div>
          ) : (
             <UserDetailsModal
              user={selectedUser}
              onClose={() => setIsModalOpen(false)}
              refreshUsers={fetchUsers} 
            />
          )}
         
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Confirm User Deletion`}
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to <strong className="text-red-600">PERMANENTLY delete</strong> the user 
            <span className="font-semibold"> "{userToDelete?.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;