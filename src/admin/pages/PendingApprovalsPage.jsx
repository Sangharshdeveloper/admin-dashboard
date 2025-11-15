import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

const PendingApprovalsPage = ({ token }) => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await apiService.get('/vendors/pending');
        setPendingVendors(data.data.vendors);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();
  }, [token]);

  const handleAction = async () => {
    try {
      const endpoint = actionType === 'approve' 
        ? `/vendors/${selectedVendor.vendor_id}/approve`
        : `/vendors/${selectedVendor.vendor_id}/reject`;
      
      await apiService.put(endpoint, { admin_comments: comments });
      setPendingVendors(pendingVendors.filter(v => v.vendor_id !== selectedVendor.vendor_id));
      setModalOpen(false);
      setComments('');
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (vendor, type) => {
    setSelectedVendor(vendor);
    setActionType(type);
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pending Vendor Approvals</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            {pendingVendors.length} vendor(s) waiting for approval
          </p>
        </div>
        
        <div className="divide-y">
          {pendingVendors.map((vendor) => (
            <div key={vendor.vendor_id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{vendor.shop_name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Owner: {vendor.owner_name}</p>
                    <p>Phone: {vendor.phone_number}</p>
                    <p>Location: {vendor.city}, {vendor.state}</p>
                    <p>Address: {vendor.shop_address}</p>
                    <p>Registered: {new Date(vendor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 lg:mt-0">
                  <button
                    onClick={() => openModal(vendor, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openModal(vendor, 'reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Vendor`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionType === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder={actionType === 'approve' 
                ? 'Enter any comments for the vendor...'
                : 'Please provide a reason for rejection...'}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className={`px-4 py-2 text-white rounded-lg ${
                actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={actionType === 'reject' && !comments}
            >
              Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingApprovalsPage;