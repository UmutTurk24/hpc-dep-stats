import React from 'react';
import { ReservationBreakdown, ResourceUtilization } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResourceCardProps {
  title: string;
  unit: string;
  total: number;
  utilization: ResourceUtilization['cpu' | 'memory' | 'gpu'];
  breakdown: ReservationBreakdown['cpu' | 'memory' | 'gpu'];
  icon: React.ReactNode;
  color: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  unit,
  total,
  utilization,
  breakdown,
  icon,
  color
}) => {
  // Prepare data for pie chart
  const chartData = [
    ...breakdown.map(item => ({
      name: item.reservation.name,
      value: item.amount,
      color: item.reservation.color,
      gpuName: item.reservation.gpuName
    })),
    {
      name: 'Available',
      value: utilization.available,
      color: '#e5e7eb',
      gpuName: 'Available'
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">
            {data.name}
          </p>
          {data.gpuName && data.gpuName !== 'Available' && (
            <p className="text-xs text-gray-600 mb-1">GPU: {data.gpuName}</p>
          )}
          <p className="text-sm text-gray-600">{data.value} {unit}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Total: {total} {unit}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {utilization.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">
            {utilization.used} / {total} {unit}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Used</span>
          <span>Available</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${utilization.percentage}%` }}
          />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="h-64 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{ right: 8, left: 8, bottom: 20 }}
          >
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown List */}
      {breakdown.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Reservations:</h4>
          <div className="space-y-1">
            {breakdown.map((item) => (
              <div key={item.reservation.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.reservation.color }}
                  />
                  <span className="text-gray-600">{item.reservation.name}</span>
                </div>
                <span className="text-gray-500">
                  {item.amount} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
