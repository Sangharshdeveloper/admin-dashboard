import React from 'react';

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-2 font-medium ${
            change.startsWith('+') || change.includes('↑') 
              ? 'text-green-600' 
              : change.startsWith('-') || change.includes('↓')
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-10 flex-shrink-0`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

export default StatCard;