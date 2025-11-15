import React, { useState } from 'react';
import apiService from '../services/api.service';

const NotificationsPage = ({ token }) => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    recipient_type: 'all_users',
    recipient_id: ''
  });

  const handleSend = async () => {
    try {
      await apiService.post('/send-notification', notification);
      alert('Notification sent successfully!');
      setNotification({ title: '', message: '', recipient_type: 'all_users', recipient_id: '' });
    } catch (err) {
      alert('Failed to send notification');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Send Notifications</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => setNotification({...notification, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({...notification, message: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Notification message..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select
              value={notification.recipient_type}
              onChange={(e) => setNotification({...notification, recipient_type: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all_users">All Users</option>
              <option value="all_vendors">All Vendors</option>
              <option value="specific_user">Specific User</option>
              <option value="specific_vendor">Specific Vendor</option>
            </select>
          </div>
          
          {(notification.recipient_type === 'specific_user' || notification.recipient_type === 'specific_vendor') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient ID</label>
              <input
                type="number"
                value={notification.recipient_id}
                onChange={(e) => setNotification({...notification, recipient_id: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user/vendor ID..."
              />
            </div>
          )}
          
          <button
            onClick={handleSend}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;