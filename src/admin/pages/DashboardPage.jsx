import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, DollarSign, Star } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import apiService from '../services/api.service';

const DashboardPage = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.get('/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.stats.totalUsers || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Store}
          title="Active Vendors"
          value={stats?.stats.activeVendors || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Bookings"
          value={stats?.stats.totalBookings || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          title="Monthly Revenue"
          value={`₹${(stats?.stats.monthlyRevenue || 0).toLocaleString()}`}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {stats?.recentActivity.recentBookings.slice(0, 5).map((booking, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{booking.user.name}</p>
                  <p className="text-sm text-gray-600">{booking.vendor.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{booking.totalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.bookingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Vendors</h2>
          <div className="space-y-3">
            {stats?.topVendors.slice(0, 5).map((vendor, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{vendor.shopName}</p>
                  <p className="text-sm text-gray-600">{vendor.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{parseFloat(vendor.totalRevenue).toLocaleString()}</p>
                  <div className="flex items-center text-sm text-yellow-600">
                    <Star className="w-4 h-4 mr-1" />
                    {vendor.avgRating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;