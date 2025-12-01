import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store, Search, Eye, Edit, Trash2, Plus, X, Save,
  MapPin, Phone, Mail, Clock, Users, Calendar, CheckCircle, XCircle,
  Image as ImageIcon, FileText, AlertCircle
} from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import ShopDocumentsModal from '../components/shops/ShopDocumentsModal';
import ShopImagesManager from '../components/shops/ShopImagesManager';
import apiService from '../services/api.service';

// Utility hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Shop Form Component
const ShopForm = ({ shop, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    user_id: shop?.user_id || '',
    shop_name: shop?.shop_name || '',
    shop_address: shop?.shop_address || '',
    city: shop?.city || '',
    state: shop?.state || '',
    latitude: shop?.latitude || '',
    longitude: shop?.longitude || '',
    open_time: shop?.open_time || '09:00',
    close_time: shop?.close_time || '20:00',
    break_start_time: shop?.break_start_time || '',
    break_end_time: shop?.break_end_time || '',
    weekly_holiday: shop?.weekly_holiday || '',
    no_of_seats: shop?.no_of_seats || 1,
    no_of_workers: shop?.no_of_workers || 1,
    business_license: shop?.business_license || '',
    tax_number: shop?.tax_number || '',
    bank_account_number: shop?.bank_account_number || '',
    bank_ifsc_code: shop?.bank_ifsc_code || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!shop && !formData.user_id) newErrors.user_id = 'Vendor is required';
    if (!formData.shop_name.trim()) newErrors.shop_name = 'Shop name is required';
    if (!formData.shop_address.trim()) newErrors.shop_address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.open_time) newErrors.open_time = 'Opening time is required';
    if (!formData.close_time) newErrors.close_time = 'Closing time is required';

    // Validate opening hours
    if (formData.open_time && formData.close_time && formData.open_time >= formData.close_time) {
      newErrors.close_time = 'Closing time must be after opening time';
    }

    // Validate break times if provided
    if (formData.break_start_time && formData.break_end_time) {
      if (formData.break_start_time >= formData.break_end_time) {
        newErrors.break_end_time = 'Break end time must be after break start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
        
        {/* Vendor ID (only for new shops) */}
        {!shop && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.user_id ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter vendor user ID"
            />
            {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
            <p className="text-xs text-gray-500 mt-1">Enter the user_id of the vendor who owns this shop</p>
          </div>
        )}

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.shop_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter shop name"
          />
          {errors.shop_name && <p className="text-red-500 text-xs mt-1">{errors.shop_name}</p>}
        </div>

        {/* Shop Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="shop_address"
            value={formData.shop_address}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.shop_address ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="Enter complete shop address"
          />
          {errors.shop_address && <p className="text-red-500 text-xs mt-1">{errors.shop_address}</p>}
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter state"
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        {/* Latitude and Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Optional)
            </label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 18.5204"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Optional)
            </label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 73.8567"
            />
          </div>
        </div>
      </div>

      {/* Timing Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Operating Hours</h4>

        {/* Opening and Closing Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="open_time"
              value={formData.open_time}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.open_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.open_time && <p className="text-red-500 text-xs mt-1">{errors.open_time}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Closing Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="close_time"
              value={formData.close_time}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.close_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.close_time && <p className="text-red-500 text-xs mt-1">{errors.close_time}</p>}
          </div>
        </div>

        {/* Break Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Start Time (Optional)
            </label>
            <input
              type="time"
              name="break_start_time"
              value={formData.break_start_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break End Time (Optional)
            </label>
            <input
              type="time"
              name="break_end_time"
              value={formData.break_end_time}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.break_end_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.break_end_time && <p className="text-red-500 text-xs mt-1">{errors.break_end_time}</p>}
          </div>
        </div>

        {/* Weekly Holiday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weekly Holiday (Optional)
          </label>
          <select
            name="weekly_holiday"
            value={formData.weekly_holiday}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No weekly holiday</option>
            {weekDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Capacity Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Capacity</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Seats
            </label>
            <input
              type="number"
              name="no_of_seats"
              value={formData.no_of_seats}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Workers
            </label>
            <input
              type="number"
              name="no_of_workers"
              value={formData.no_of_workers}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Business Details (Optional)</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business License Number
            </label>
            <input
              type="text"
              name="business_license"
              value={formData.business_license}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter license number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Number (GST/PAN)
            </label>
            <input
              type="text"
              name="tax_number"
              value={formData.tax_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter tax number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account Number
            </label>
            <input
              type="text"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank IFSC Code
            </label>
            <input
              type="text"
              name="bank_ifsc_code"
              value={formData.bank_ifsc_code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter IFSC code"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {shop ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {shop ? 'Update Shop' : 'Create Shop'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Shop Details Modal Component
const ShopDetailsModal = ({ shop, onClose, onEdit }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Shop Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{shop.shop_name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                {shop.city}, {shop.state}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                {shop.phone_number || 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Address */}
      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-600" />
          Shop Address
        </h5>
        <p className="text-sm text-gray-700">{shop.shop_address}</p>
      </div>

      {/* Status Information */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white border rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">Shop Status</p>
          {getStatusBadge(shop.status)}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Verification Status</p>
          {getVerificationBadge(shop.verification_status)}
        </div>
      </div>

      {/* Operating Hours */}
      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-600" />
          Operating Hours
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Opening Time</p>
            <p className="font-medium">{shop.open_time}</p>
          </div>
          <div>
            <p className="text-gray-600">Closing Time</p>
            <p className="font-medium">{shop.close_time}</p>
          </div>
          {shop.break_start_time && shop.break_end_time && (
            <>
              <div>
                <p className="text-gray-600">Break Start</p>
                <p className="font-medium">{shop.break_start_time}</p>
              </div>
              <div>
                <p className="text-gray-600">Break End</p>
                <p className="font-medium">{shop.break_end_time}</p>
              </div>
            </>
          )}
          {shop.weekly_holiday && (
            <div className="col-span-2">
              <p className="text-gray-600">Weekly Holiday</p>
              <p className="font-medium">{shop.weekly_holiday}</p>
            </div>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-600" />
          Capacity
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Number of Seats</p>
            <p className="font-medium">{shop.no_of_seats}</p>
          </div>
          <div>
            <p className="text-gray-600">Number of Workers</p>
            <p className="font-medium">{shop.no_of_workers}</p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      {(shop.business_license || shop.tax_number || shop.bank_account_number) && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-3">Business Details</h5>
          <div className="space-y-2 text-sm">
            {shop.business_license && (
              <div>
                <p className="text-gray-600">Business License</p>
                <p className="font-medium">{shop.business_license}</p>
              </div>
            )}
            {shop.tax_number && (
              <div>
                <p className="text-gray-600">Tax Number</p>
                <p className="font-medium">{shop.tax_number}</p>
              </div>
            )}
            {shop.bank_account_number && (
              <div>
                <p className="text-gray-600">Bank Account</p>
                <p className="font-medium">{shop.bank_account_number}</p>
              </div>
            )}
            {shop.bank_ifsc_code && (
              <div>
                <p className="text-gray-600">IFSC Code</p>
                <p className="font-medium">{shop.bank_ifsc_code}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">{new Date(shop.created_at).toLocaleDateString()}</p>
          </div>
          {shop.verified_at && (
            <div>
              <p className="text-gray-600">Verified</p>
              <p className="font-medium">{new Date(shop.verified_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Shop
        </button>
      </div>
    </div>
  );
};

// Main Shops Page Component
const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verification_status: '',
    city: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedShop, setSelectedShop] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // New state for document and image management
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch vendors which contain shop details
      const response = await apiService.getAllVendors({
        page: filters.page,
        limit: filters.limit,
        verification_status: filters.verification_status,
        city: filters.city,
        search: debouncedSearch
      });
      
      // Transform vendor data to shop data format
      const vendorData = response.data?.vendors || response.vendors || [];
      const shopsData = vendorData.map(vendor => ({
        shop_id: vendor.shop_details?.shop_id || vendor.vendor_shop_id || vendor.user_id,
        user_id: vendor.user_id,
        shop_name: vendor.shop_details?.shop_name || vendor.shop_name || 'Not Set',
        shop_address: vendor.shop_details?.shop_address || vendor.shop_address || '',
        city: vendor.shop_details?.city || vendor.city || '',
        state: vendor.shop_details?.state || vendor.state || '',
        latitude: vendor.shop_details?.latitude || vendor.latitude,
        longitude: vendor.shop_details?.longitude || vendor.longitude,
        open_time: vendor.shop_details?.open_time || vendor.open_time || '09:00',
        close_time: vendor.shop_details?.close_time || vendor.close_time || '20:00',
        break_start_time: vendor.shop_details?.break_start_time || vendor.break_start_time,
        break_end_time: vendor.shop_details?.break_end_time || vendor.break_end_time,
        weekly_holiday: vendor.shop_details?.weekly_holiday || vendor.weekly_holiday,
        no_of_seats: vendor.shop_details?.no_of_seats || vendor.no_of_seats || 1,
        no_of_workers: vendor.shop_details?.no_of_workers || vendor.no_of_workers || 1,
        business_license: vendor.shop_details?.business_license || vendor.business_license,
        tax_number: vendor.shop_details?.tax_number || vendor.tax_number,
        bank_account_number: vendor.shop_details?.bank_account_number || vendor.bank_account_number,
        bank_ifsc_code: vendor.shop_details?.bank_ifsc_code || vendor.bank_ifsc_code,
        status: vendor.shop_details?.status || vendor.status || 'active',
        verification_status: vendor.shop_details?.verification_status || vendor.verification_status || 'pending',
        owner_name: vendor.full_name || vendor.name || 'Unknown',
        phone_number: vendor.phone_number || vendor.phone || '',
        email: vendor.email || '',
        created_at: vendor.shop_details?.created_at || vendor.created_at,
        verified_at: vendor.shop_details?.verified_at || vendor.verified_at
      }));
      
      setShops(shopsData);
      setPagination(response.data?.pagination || response.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: shopsData.length,
        totalPages: Math.ceil(shopsData.length / filters.limit)
      });
    } catch (err) {
      console.error('❌ Failed to fetch shops:', err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleViewDetails = async (shop) => {
    try {
      // Fetch vendor details which includes shop information
      const response = await apiService.getVendorById(shop.user_id);
      const vendorData = response.data || response;
      
      // Transform to shop format
      const shopData = {
        ...shop,
        shop_details: vendorData.shop_details || {},
        documents: vendorData.documents || [],
        services: vendorData.services || []
      };
      
      setSelectedShop(shopData);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('❌ Failed to fetch shop details:', err);
      alert('Failed to load shop details. Please try again.');
    }
  };

  const handleCreateShop = () => {
    setSelectedShop(null);
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleEditShop = (shop) => {
    setSelectedShop(shop);
    setEditMode(true);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      // Sanitize form data - convert empty strings to null for numeric/optional fields
      const sanitizedData = {
        ...formData,
        latitude: formData.latitude?.trim() || null,
        longitude: formData.longitude?.trim() || null,
        break_start_time: formData.break_start_time?.trim() || null,
        break_end_time: formData.break_end_time?.trim() || null,
        weekly_holiday: formData.weekly_holiday?.trim() || null,
        business_license: formData.business_license?.trim() || null,
        tax_number: formData.tax_number?.trim() || null,
        bank_account_number: formData.bank_account_number?.trim() || null,
        bank_ifsc_code: formData.bank_ifsc_code?.trim() || null,
        no_of_seats: formData.no_of_seats ? parseInt(formData.no_of_seats) : 1,
        no_of_workers: formData.no_of_workers ? parseInt(formData.no_of_workers) : 1
      };
      
      if (editMode && selectedShop) {
        // Update existing shop
        try {
          await apiService.updateVendorShopDetails(selectedShop.user_id, sanitizedData);
          setIsFormModalOpen(false);
          setSelectedShop(null);
          fetchShops();
          alert('Shop updated successfully!');
        } catch (err) {
          console.log('Direct update failed, trying alternative...', err);
          
          throw new Error(
            'The backend API needs the shop update endpoint.\n\n' +
            'To fix this, add this endpoint to your backend:\n' +
            'PUT /admin/vendors/:id/shop\n\n' +
            'See SHOP_ERROR_FIX.md for implementation details.\n\n' +
            'Alternative: You can update shop details through the Vendors page for now.'
          );
        }
      } else {
        // Create new shop
        if (!sanitizedData.user_id) {
          throw new Error('Vendor ID is required to create a shop');
        }
        
        try {
          await apiService.updateVendorShopDetails(sanitizedData.user_id, sanitizedData);
          setIsFormModalOpen(false);
          setSelectedShop(null);
          fetchShops();
          alert('Shop created successfully!');
        } catch (err) {
          console.log('Direct creation failed, trying alternative...', err);
          
          throw new Error(
            'The backend API needs the shop management endpoint.\n\n' +
            'To fix this, add this endpoint to your backend:\n' +
            'PUT /admin/vendors/:id/shop\n\n' +
            'See SHOP_ERROR_FIX.md for implementation details.\n\n' +
            'Alternative: You can add shop details when creating/editing the vendor through the Vendors page.'
          );
        }
      }
    } catch (error) {
      console.error('❌ Failed to save shop:', error);
      alert(error.message || `Failed to ${editMode ? 'update' : 'create'} shop`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!shopToDelete) return;

    try {
      // Since shops are part of vendors, we'll mark as inactive instead of deleting
      await apiService.updateVendorVerification(shopToDelete.user_id, {
        verification_status: 'rejected',
        status: 'inactive',
        admin_comments: 'Shop deleted by admin'
      });
      
      setIsDeleteModalOpen(false);
      setShopToDelete(null);
      fetchShops();
      alert('Shop has been deactivated successfully');
    } catch (error) {
      console.error('❌ Failed to delete shop:', error);
      alert(`Failed to delete shop: ${error.message}\n\nNote: This operation marks the shop as inactive.`);
    }
  };

  // ============================================
  // DOCUMENT MANAGEMENT HANDLERS
  // ============================================

  const handleViewDocuments = async (shop) => {
    try {
      setSelectedShop(shop);
      setIsDocumentsModalOpen(true);
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
      alert('Failed to load documents. Please try again.');
    }
  };

  const handleApproveShop = async (approvalData) => {
    setIsSubmitting(true);
    try {
      await apiService.updateVendorVerification(selectedShop.user_id, {
        verification_status: 'approved',
        admin_comments: approvalData.admin_comments
      });
      
      setIsDocumentsModalOpen(false);
      fetchShops();
      alert('Shop approved successfully!');
    } catch (error) {
      console.error('❌ Failed to approve shop:', error);
      alert(`Failed to approve shop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectShop = async (rejectionData) => {
    setIsSubmitting(true);
    try {
      await apiService.updateVendorVerification(selectedShop.user_id, {
        verification_status: 'rejected',
        admin_comments: rejectionData.admin_comments
      });
      
      setIsDocumentsModalOpen(false);
      fetchShops();
      alert('Shop rejected.');
    } catch (error) {
      console.error('❌ Failed to reject shop:', error);
      alert(`Failed to reject shop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // IMAGE MANAGEMENT HANDLERS
  // ============================================

  const handleManageImages = async (shop) => {
    try {
      // Fetch fresh shop details with images
      const response = await apiService.getVendorById(shop.user_id);
      const shopData = response.data || response;
      
      setSelectedShop({
        ...shop,
        profile_image: shopData.profile_image,
        gallery_images: shopData.gallery_images || shopData.documents?.filter(d => d.document_type?.includes('image')) || []
      });
      setIsImagesModalOpen(true);
    } catch (error) {
      console.error('❌ Failed to load shop images:', error);
      alert('Failed to load images. Please try again.');
    }
  };

  const handleUploadProfileImage = async (file) => {
    if (!selectedShop) return;
    
    setIsUploading(true);
    try {
      await apiService.uploadShopProfileImage(selectedShop.user_id, file);
      
      // Refresh shop data
      const response = await apiService.getVendorById(selectedShop.user_id);
      const shopData = response.data || response;
      
      setSelectedShop({
        ...selectedShop,
        profile_image: shopData.profile_image
      });
      
      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('❌ Failed to upload profile image:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadGalleryImages = async (files) => {
    if (!selectedShop) return;
    
    setIsUploading(true);
    try {
      await apiService.uploadShopGalleryImages(selectedShop.user_id, files);
      
      // Refresh shop data
      const response = await apiService.getVendorById(selectedShop.user_id);
      const shopData = response.data || response;
      
      setSelectedShop({
        ...selectedShop,
        gallery_images: shopData.gallery_images || shopData.documents?.filter(d => d.document_type?.includes('image')) || []
      });
      
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('❌ Failed to upload gallery images:', error);
      alert(`Failed to upload images: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId, imageType) => {
    if (!selectedShop) return;
    
    if (!window.confirm(`Are you sure you want to delete this ${imageType} image?`)) {
      return;
    }
    
    setIsUploading(true);
    try {
      await apiService.deleteShopImage(selectedShop.user_id, imageId, imageType);
      
      // Refresh shop data
      const response = await apiService.getVendorById(selectedShop.user_id);
      const shopData = response.data || response;
      
      setSelectedShop({
        ...selectedShop,
        profile_image: imageType === 'profile' ? null : selectedShop.profile_image,
        gallery_images: imageType === 'gallery' 
          ? (shopData.gallery_images || shopData.documents?.filter(d => d.document_type?.includes('image')) || [])
          : selectedShop.gallery_images
      });
      
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      alert(`Failed to delete image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    if (!selectedShop) return;
    
    setIsUploading(true);
    try {
      await apiService.setShopPrimaryImage(selectedShop.user_id, imageId);
      
      // Refresh shop data
      const response = await apiService.getVendorById(selectedShop.user_id);
      const shopData = response.data || response;
      
      setSelectedShop({
        ...selectedShop,
        gallery_images: shopData.gallery_images || shopData.documents?.filter(d => d.document_type?.includes('image')) || []
      });
      
      alert('Primary image updated successfully!');
    } catch (error) {
      console.error('❌ Failed to set primary image:', error);
      alert(`Failed to set primary image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    { 
      header: 'ID', 
      field: 'shop_id',
      render: (row) => <span className="font-mono text-xs">{row.shop_id}</span>
    },
    {
      header: 'Shop Name',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{row.shop_name || 'Not Set'}</span>
        </div>
      )
    },
    {
      header: 'Owner',
      render: (row) => row.owner_name || 'Unknown'
    },
    { 
      header: 'Location',
      render: (row) => (
        <span className="text-sm">{row.city || 'N/A'}</span>
      )
    },
    {
      header: 'Hours',
      render: (row) => (
        <span className="text-sm">
          {row.open_time} - {row.close_time}
        </span>
      )
    },
    {
      header: 'Verification',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
          row.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.verification_status || 'pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewDocuments(row)}
            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition"
            title="View Documents"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManageImages(row)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
            title="Manage Images"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditShop(row)}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
            title="Edit Shop"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShopToDelete(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete Shop"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const pendingCount = shops.filter(s => s.verification_status === 'pending').length;
  const approvedCount = shops.filter(s => s.verification_status === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600 mt-1">Manage shop details and information</p>
        </div>
        <button
          onClick={handleCreateShop}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Shop
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Shops</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by shop name or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Verification Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.verification_status}
            onChange={(e) => setFilters({...filters, verification_status: e.target.value, page: 1})}
          >
            <option value="">All Verifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* City Filter */}
          <input
            type="text"
            placeholder="Filter by city..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={shops} loading={loading} />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} shops
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedShop && isDetailsModalOpen && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Shop Details: ${selectedShop.shop_name}`}
          size="large"
        >
          <ShopDetailsModal
            shop={selectedShop}
            onClose={() => setIsDetailsModalOpen(false)}
            onEdit={() => handleEditShop(selectedShop)}
          />
        </Modal>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editMode ? 'Edit Shop' : 'Create New Shop'}
        size="large"
      >
        <ShopForm
          shop={editMode ? selectedShop : null}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete shop <strong>{shopToDelete?.shop_name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteShop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Shop
            </button>
          </div>
        </div>
      </Modal>

      {/* Documents Review Modal */}
      <ShopDocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        shop={selectedShop}
        onApprove={handleApproveShop}
        onReject={handleRejectShop}
        isSubmitting={isSubmitting}
      />

      {/* Images Management Modal */}
      <Modal
        isOpen={isImagesModalOpen}
        onClose={() => setIsImagesModalOpen(false)}
        title={`Manage Images: ${selectedShop?.shop_name || 'Shop'}`}
        size="large"
      >
        <ShopImagesManager
          shop={selectedShop}
          profileImage={selectedShop?.profile_image}
          galleryImages={selectedShop?.gallery_images || []}
          onUploadProfile={handleUploadProfileImage}
          onUploadGallery={handleUploadGalleryImages}
          onDeleteImage={handleDeleteImage}
          onSetPrimary={handleSetPrimaryImage}
          isUploading={isUploading}
        />
      </Modal>
    </div>
  );
};

export default ShopsPage;