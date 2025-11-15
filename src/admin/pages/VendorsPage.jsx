import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

// Utility Hook for Search Debouncing
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


// --- Vendor Details/Edit Modal Content Component ---
const VendorDetailsModal = ({ vendor, onClose, refreshVendors }) => {
  const [status, setStatus] = useState(vendor.verification_status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleStatusChange = async (newStatus) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      // API call to update status (assuming an endpoint like /vendors/{id}/status)
      const response = await apiService.put(`/admin/vendors/${vendor.id}/status`, { status: newStatus });
      
      // Check if update was successful
      if(response.success || response.message) {
        setMessage(`Successfully updated status to ${newStatus}.`);
        setStatus(newStatus);
        refreshVendors(); // Refresh the parent list
        // Allow user to see the success message before closing
        setTimeout(onClose, 1500); 
      } else {
         setMessage('Failed to update status. Server response was unexpected.');
      }
      
    } catch (error) {
      console.error('Error updating vendor status:', error);
      setMessage(`Failed to update status: ${error.message || 'Network error'}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusButton = ({ newStatus, icon: Icon, color, label }) => (
    <button
      onClick={() => handleStatusChange(newStatus)}
      disabled={status === newStatus || isSubmitting}
      className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition shadow-md 
        ${color === 'green' ? 'bg-green-500 text-white hover:bg-green-600' : 
          color === 'red' ? 'bg-red-500 text-white hover:bg-red-600' : ''
        }
        disabled:opacity-60 disabled:shadow-none
      `}
    >
      <Icon className="w-4 h-4 mr-2" />
      {isSubmitting && status !== newStatus ? 'Processing...' : label}
    </button>
  );

  const getStatusBadge = (currentStatus) => {
      let icon, colorClasses, label;
      switch (currentStatus) {
          case 'approved':
              icon = CheckCircle;
              colorClasses = 'bg-green-100 text-green-700';
              label = 'APPROVED';
              break;
          case 'rejected':
              icon = XCircle;
              colorClasses = 'bg-red-100 text-red-700';
              label = 'REJECTED';
              break;
          case 'pending':
          default:
              icon = Clock;
              colorClasses = 'bg-yellow-100 text-yellow-700';
              label = 'PENDING';
              break;
      }
      const IconComponent = icon;
      return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${colorClasses}`}>
              <IconComponent className="w-3 h-3 mr-1" />
              {label}
          </span>
      );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-lg font-bold text-gray-800 mb-2">
          Current Status: {getStatusBadge(status)}
        </h4>
        <div className="flex gap-3">
          <StatusButton newStatus="approved" icon={CheckCircle} color="green" label="Approve Vendor" />
          <StatusButton newStatus="rejected" icon={XCircle} color="red" label="Reject Vendor" />
        </div>
        {message && <p className={`text-sm mt-3 font-medium ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <p><strong>Owner:</strong> {vendor.owner_name}</p>
        <p><strong>Email:</strong> {vendor.email}</p>
        <p><strong>Phone:</strong> {vendor.phone_number}</p>
        <p><strong>Shop Name:</strong> <span className="font-semibold text-gray-900">{vendor.shop_name}</span></p>
        <p className="col-span-full"><strong>Address:</strong> {vendor.shop_address}</p>
        <p><strong>City/State:</strong> {vendor.city}, {vendor.state}</p>
        <p><strong>Working Hours:</strong> {vendor.open_time} - {vendor.close_time}</p>
        <p><strong>Seats/Workers:</strong> {vendor.no_of_seats} Seats / {vendor.no_of_workers} Workers</p>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};


// --- Main Vendors Page Component ---

const VendorsPage = ({ token }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    search: '',
    page: 1
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Set the token on the class instance when the prop changes
  useEffect(() => {
      if (token) {
          apiService.setAuthToken(token);
      }
  }, [token]);

  // Apply debounce to the search input value
  const debouncedSearch = useDebounce(filters.search, 400);

  // Function to fetch vendors data
  const fetchVendors = useCallback(async () => {
    if (!token) return; 
    setLoading(true);

    try {
      // The API Service class handles the token internally now.
      const response = await apiService.get(`/admin/vendors/list`, {
        status: filters.status,
        city: filters.city,
        search: debouncedSearch,
        page: filters.page
      });
      
      // Map data to ensure consistency 
      const vendorList = (response.data?.vendors || response.vendors || []).map(v => ({
        // Use 'user_id' from the registration response as the primary ID
        id: v.user_id || v.id, 
        owner_name: v.name || v.owner_name || 'N/A',
        // Ensure shop_address, city, state are present, mocking if needed for the UI fields
        shop_address: v.shop_address || 'N/A',
        city: v.city || 'N/A',
        state: v.state || 'N/A',
        open_time: v.open_time || 'N/A',
        close_time: v.close_time || 'N/A',
        no_of_seats: v.no_of_seats || 0,
        no_of_workers: v.no_of_workers || 0,
        ...v
      }));

      setVendors(vendorList);

    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      // Clear data on error
      setVendors([]); 
    } finally {
      setLoading(false);
    }
  }, [token, filters.status, filters.city, filters.page, debouncedSearch]);

  // Effect to trigger fetch when filters or debounced search change
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // --- Action Handlers ---

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const openDeleteModal = (vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteModalOpen(true);
  }

  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;

    try {
      setLoading(true);
      setIsDeleteModalOpen(false);
      // API call to delete (assuming endpoint /admin/vendors/{id})
      await apiService.delete(`/admin/vendors/${vendorToDelete.id}`);
      setVendorToDelete(null);
      await fetchVendors(); // Refresh the list after successful deletion
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      // Reopen a modal for error feedback instead of alert
      setSelectedVendor({ 
          shop_name: vendorToDelete.shop_name, 
          error: `Failed to delete vendor: ${error.message || 'Check console for details.'}`
      });
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };


  // --- Table Columns Definition ---
  const columns = [
    { header: 'Shop Name', field: 'shop_name' },
    { header: 'Owner', field: 'owner_name' },
    { header: 'City', field: 'city' },
    { header: 'Phone', field: 'phone_number' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
          row.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
          row.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.verification_status}
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
            title="View Details / Manage Status"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-full transition"
            title="Delete Vendor"
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
            Vendor Management
          </h1>
        </header>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-indigo-50 p-4 rounded-xl">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by shop or owner name..."
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-inner"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              className="flex-grow px-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white shadow-sm transition"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* City Filter */}
            <select
              className="flex-grow px-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white shadow-sm transition"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
            >
              <option value="">All Cities</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
            </select>
          </div>
        </div>

        {/* Vendors Table */}
        <section className="min-h-[400px]">
          <Table columns={columns} data={vendors} loading={loading} />
          {/* TODO: Add pagination controls here if the API supports it */}
        </section>
      </div>

      {/* View/Edit/Approve Modal */}
      {selectedVendor && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Manage Vendor: ${selectedVendor.shop_name}`}
        >
          {selectedVendor.error ? (
              <div className="p-4 text-red-700 bg-red-50 rounded-lg">
                  <h4 className="font-bold">Deletion Error</h4>
                  <p>{selectedVendor.error}</p>
              </div>
          ) : (
             <VendorDetailsModal
              vendor={selectedVendor}
              onClose={() => setIsModalOpen(false)}
              refreshVendors={fetchVendors} 
            />
          )}
         
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Confirm Deletion`}
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to <strong className="text-red-600">PERMANENTLY delete</strong> the vendor 
            <span className="font-semibold"> "{vendorToDelete?.shop_name}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteVendor}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Vendor
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorsPage;