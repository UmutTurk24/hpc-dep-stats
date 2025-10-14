import React from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { Trash2 } from 'lucide-react';

export const ReservationList: React.FC = () => {
  const { reservations, removeReservation } = useResourceStore();

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the reservation "${name}"?`)) {
      removeReservation(id);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reservations</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No active reservations</p>
          <p className="text-sm">Add a new reservation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reservations</h3>
      
      <div className="space-y-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: reservation.color }}
                  />
                  <h4 className="font-medium text-gray-900">{reservation.name}</h4>
                  {reservation.gpuName && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {reservation.gpuName}
                    </span>
                  )}
                </div>
                
                {reservation.description && (
                  <p className="text-sm text-gray-600 mb-3">{reservation.description}</p>
                )}
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">CPU:</span>
                    <span className="font-medium text-gray-900">{reservation.cpu} cores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Memory:</span>
                    <span className="font-medium text-gray-900">{reservation.memory} GB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">GPU:</span>
                    <span className="font-medium text-gray-900">{reservation.gpu} units</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleDelete(reservation.id, reservation.name)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete reservation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
