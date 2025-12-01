import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Store, MapPin, Phone, Mail } from 'lucide-react';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

const PendingApprovalsPage = () => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/vendors', {
        verification_status: 'pending'
      });
      setPendingVendors(response.data.vendors || []);
    } catch (err) {
      console.error('❌ Failed to fetch pending vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !comments.trim()) {
      alert('Please provide rejection comments');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.put(`/admin/vendors/${selectedVendor.user_id}/verification`, {
        verification_status: actionType === 'approve' ? 'approved' : 'rejected',
        admin_comments: comments
      });

      setPendingVendors(pendingVendors.filter(v => v.user_id !== selectedVendor.user_id));
      setModalOpen(false);
      setComments('');
      setSelectedVendor(null);
    } catch (err) {
      console.error('❌ Verification error:', err);
      alert(`Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (vendor, type) => {
    setSelectedVendor(vendor);
    setActionType(type);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Vendor Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve vendor registration requests</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
          <p className="text-yellow-800 font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {pendingVendors.length} Pending
          </p>
        </div>
      </div>

      {/* Pending Vendors List */}
      {pendingVendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">There are no pending vendor approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingVendors.map((vendor) => (
            <div key={vendor.user_id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Vendor Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {vendor.shop_name || 'Shop Name Not Set'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Owner:</span>
                            {vendor.name || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {vendor.phone_number}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {vendor.shop_city}, {vendor.shop_state}
                          </div>
                        </div>
                        {vendor.shop_address && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Address:</span> {vendor.shop_address}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Registered: {new Date(vendor.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 lg:items-end">
                    <button
                      onClick={() => openModal(vendor, 'approve')}
                      className="flex-1 lg:w-32 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => openModal(vendor, 'reject')}
                      className="flex-1 lg:w-32 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {selectedVendor && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setComments('');
          }}
          title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Vendor`}
        >
          <div className="space-y-4">
            
            {/* Vendor Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{selectedVendor.shop_name}</p>
              <p className="text-sm text-gray-600">Owner: {selectedVendor.name}</p>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Comments (Optional)' : 'Rejection Reason (Required)'}
                {actionType === 'reject' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder={actionType === 'approve' 
                  ? 'Add any comments for the vendor...'
                  : 'Please explain why this vendor is being rejected...'}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setComments('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={isSubmitting || (actionType === 'reject' && !comments.trim())}
                className={`px-6 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 ${
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingApprovalsPage;