import React, { useState } from 'react';
import { useResourceStore } from '../store/useResourceStore';
import { Download, Upload, Trash2, Save, Settings, Clock } from 'lucide-react';

export const PersistenceManager: React.FC = () => {
  const { 
    saveData, 
    exportData, 
    importData, 
    clearData, 
    toggleAutoSave, 
    isAutoSaveEnabled, 
    lastSaved 
  } = useResourceStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hpc-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importData(content);
      if (success) {
        alert('Data imported successfully!');
        setImportFile(null);
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(importFile);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearData();
      alert('All data has been cleared.');
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Auto-save Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Auto-save</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isAutoSaveEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAutoSaveEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button
          onClick={toggleAutoSave}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isAutoSaveEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Last Saved */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <Save size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Last Saved</span>
        </div>
        <span className="text-sm text-gray-600">
          {formatLastSaved(lastSaved)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={saveData}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          <span>Save Now</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Import Section */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import Backup
          </label>
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleImport}
              disabled={!importFile}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Clear Data Button */}
        <button
          onClick={handleClearData}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Storage Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Storage Type:</span>
              <span className="font-medium">localStorage</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-save Interval:</span>
              <span className="font-medium">30 seconds</span>
            </div>
            <div className="flex justify-between">
              <span>Data Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Data is stored locally in your browser. 
              Clear your browser data to remove all saved information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
