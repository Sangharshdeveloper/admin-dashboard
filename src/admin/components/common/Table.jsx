import React from 'react';
import { Loader2 } from 'lucide-react'; // Using a more modern loading icon

const Table = ({ columns, data, loading }) => {
  if (loading) {
    return (
      <div className="text-center p-8 text-gray-500 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-500 mb-3" />
        Loading vendor data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg font-medium">No vendors found.</p>
        <p className="text-sm">Adjust your filters or search terms and try again.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-indigo-50/30 transition duration-150">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {/* Render the custom component if provided, otherwise render the field value */}
                  {column.render ? column.render(row) : (row[column.field] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;