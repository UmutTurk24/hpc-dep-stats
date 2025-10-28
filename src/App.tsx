import { useState } from 'react';
import { useResourceStore } from './store/useResourceStore';
import { SystemOverview } from './components/SystemOverview';
import { ResourceCard } from './components/ResourceCard';
import { ReservationForm } from './components/ReservationForm';
import { ReservationList } from './components/ReservationList';
import { PersistenceManager } from './components/PersistenceManager';
import { Plus, Cpu, MemoryStick, Zap } from 'lucide-react';

function App() {
  const { resourcePool, utilization, breakdown } = useResourceStore();
  const [showReservationForm, setShowReservationForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HPC Commitments Dashboard</h1>
              <p className="text-sm text-gray-600">High Performance Computing Resource Management</p>
            </div>
            <button
              onClick={() => setShowReservationForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Reservation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <SystemOverview />

        {/* Resource Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ResourceCard
            title="CPU Cores"
            unit="cores"
            total={resourcePool.cpu.total}
            utilization={utilization.cpu}
            breakdown={breakdown.cpu}
            icon={<Cpu className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          
          <ResourceCard
            title="Memory"
            unit="GB"
            total={resourcePool.memory.total}
            utilization={utilization.memory}
            breakdown={breakdown.memory}
            icon={<MemoryStick className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          
          <ResourceCard
            title="GPU Units"
            unit="units"
            total={resourcePool.gpu.total}
            utilization={utilization.gpu}
            breakdown={breakdown.gpu}
            icon={<Zap className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
        </div>

        {/* Reservation Management */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <ReservationList />
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Reservations</span>
                <span className="text-lg font-bold text-gray-900">
                  {useResourceStore.getState().reservations.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">CPU Utilization</span>
                <span className="text-lg font-bold text-blue-600">
                  {utilization.cpu.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Memory Utilization</span>
                <span className="text-lg font-bold text-green-600">
                  {utilization.memory.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">GPU Utilization</span>
                <span className="text-lg font-bold text-purple-600">
                  {utilization.gpu.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Resource Pool Configuration */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resource Pool Configuration</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>CPU Cores:</span>
                  <span className="font-medium">{resourcePool.cpu.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-medium">{resourcePool.memory.total} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU Units:</span>
                  <span className="font-medium">{resourcePool.gpu.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <PersistenceManager />
        </div>
      </main>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <ReservationForm onClose={() => setShowReservationForm(false)} />
      )}
    </div>
  );
}

export default App;
