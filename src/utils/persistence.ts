// Data persistence utilities for HPC Resource Dashboard
import { ResourcePool, Reservation } from '../types';

const STORAGE_KEYS = {
  RESOURCE_POOL: 'hpc-dashboard-resource-pool',
  RESERVATIONS: 'hpc-dashboard-reservations',
  SETTINGS: 'hpc-dashboard-settings'
} as const;

export interface PersistedData {
  resourcePool: ResourcePool;
  reservations: Reservation[];
  lastUpdated: string;
  version: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  notifications: boolean;
  refreshInterval: number;
}

class PersistenceManager {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Save data to localStorage
  saveData(data: Partial<PersistedData>): boolean {
    if (!this.isAvailable) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      const existingData = this.loadData();
      const updatedData: PersistedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };

      localStorage.setItem(STORAGE_KEYS.RESOURCE_POOL, JSON.stringify(updatedData.resourcePool));
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updatedData.reservations));
      
      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  // Load data from localStorage
  loadData(): PersistedData {
    if (!this.isAvailable) {
      return this.getDefaultData();
    }

    try {
      const resourcePoolStr = localStorage.getItem(STORAGE_KEYS.RESOURCE_POOL);
      const reservationsStr = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);

      const resourcePool = resourcePoolStr ? JSON.parse(resourcePoolStr) : this.getDefaultData().resourcePool;
      const reservations = reservationsStr ? JSON.parse(reservationsStr) : this.getDefaultData().reservations;

      return {
        resourcePool,
        reservations,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Failed to load data:', error);
      return this.getDefaultData();
    }
  }

  // Save settings
  saveSettings(settings: Partial<AppSettings>): boolean {
    if (!this.isAvailable) return false;

    try {
      const existingSettings = this.loadSettings();
      const updatedSettings = { ...existingSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  // Load settings
  loadSettings(): AppSettings {
    if (!this.isAvailable) {
      return this.getDefaultSettings();
    }

    try {
      const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsStr ? JSON.parse(settingsStr) : this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Export data for backup
  exportData(): string {
    const data = this.loadData();
    const settings = this.loadSettings();
    
    return JSON.stringify({
      data,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      
      if (imported.data) {
        this.saveData(imported.data);
      }
      
      if (imported.settings) {
        this.saveSettings(imported.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  clearData(): boolean {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(STORAGE_KEYS.RESOURCE_POOL);
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (most browsers have 5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimatedLimit - used);
      const percentage = (used / estimatedLimit) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  private getDefaultData(): PersistedData {
    return {
      resourcePool: {
        cpu: { total: 128, unit: 'cores' },
        memory: { total: 1024, unit: 'GB' },
        gpu: { total: 16, unit: 'units' }
      },
      reservations: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'light',
      autoSave: true,
      notifications: true,
      refreshInterval: 30000 // 30 seconds
    };
  }
}

// Create singleton instance
export const persistenceManager = new PersistenceManager();

// Auto-save functionality
export class AutoSaveManager {
  private intervalId: number | null = null;
  private lastSaveTime: Date | null = null;

  startAutoSave(callback: () => void, interval: number = 30000): void {
    this.stopAutoSave();
    this.intervalId = setInterval(() => {
      callback();
      this.lastSaveTime = new Date();
    }, interval);
  }

  stopAutoSave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getLastSaveTime(): Date | null {
    return this.lastSaveTime;
  }

  isAutoSaveActive(): boolean {
    return this.intervalId !== null;
  }
}

export const autoSaveManager = new AutoSaveManager();
