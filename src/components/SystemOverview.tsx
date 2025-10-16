import React from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { Cpu, MemoryStick, Zap } from 'lucide-react';

export const SystemOverview: React.FC = () => {
  const { resourcePool, utilization, reservations } = useResourceStore();

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-700';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-200';
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">HPC System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Overview */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Cpu className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">CPU Cores</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getUtilizationBgColor(utilization.cpu.percentage)} ${getUtilizationColor(utilization.cpu.percentage)}`}>
            {utilization.cpu.percentage.toFixed(1)}% Used
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {utilization.cpu.used} / {resourcePool.cpu.total} cores
          </p>
        </div>

        {/* Memory Overview */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <MemoryStick className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Memory</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getUtilizationBgColor(utilization.memory.percentage)} ${getUtilizationColor(utilization.memory.percentage)}`}>
            {utilization.memory.percentage.toFixed(1)}% Used
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {utilization.memory.used} / {resourcePool.memory.total} GB
          </p>
        </div>

        {/* GPU Overview */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">GPU Units</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getUtilizationBgColor(utilization.gpu.percentage)} ${getUtilizationColor(utilization.gpu.percentage)}`}>
            {utilization.gpu.percentage.toFixed(1)}% Used
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {utilization.gpu.used} / {resourcePool.gpu.total} units
          </p>
        </div>
      </div>

      {/* Overall System Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">System Status</h4>
            <p className="text-sm text-gray-600">
              {reservations.length} active reservation{reservations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Overall Utilization</div>
            <div className="text-lg font-semibold text-gray-900">
              {((utilization.cpu.percentage + utilization.memory.percentage + utilization.gpu.percentage) / 3).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
