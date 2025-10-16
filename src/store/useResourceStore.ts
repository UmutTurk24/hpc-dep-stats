import { create } from 'zustand';
import { ResourcePool, Reservation, ResourceUtilization, ReservationBreakdown } from '../types';
import { RESERVATION_COLORS } from '../types';
import { persistenceManager, autoSaveManager } from '../utils/persistence';

interface ResourceStore {
  // State
  resourcePool: ResourcePool;
  reservations: Reservation[];
  
  // Computed values
  utilization: ResourceUtilization;
  breakdown: ReservationBreakdown;
  
  // Persistence state
  isAutoSaveEnabled: boolean;
  lastSaved: Date | null;
  
  // Actions
  updateResourcePool: (pool: Partial<ResourcePool>) => void;
  addReservation: (reservation: Omit<Reservation, 'id' | 'color'>) => void;
  removeReservation: (id: string) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  
  // Persistence actions
  saveData: () => void;
  loadData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
  toggleAutoSave: () => void;
  
  // Computed getters
  getNextColor: () => string;
  calculateUtilization: () => ResourceUtilization;
  calculateBreakdown: () => ReservationBreakdown;
}

// Default resource pool configuration
const defaultResourcePool: ResourcePool = {
  cpu: { total: 240, unit: 'cores' },
  memory: { total: 1536, unit: 'GB' },
  gpu: { total: 16, unit: 'units' }
};

// Sample reservations for demonstration
const sampleReservations: Reservation[] = [
  {
    id: '1',
    name: 'Machine Learning Class',
    gpuName: 'NVIDIA A100',
    cpu: 32,
    memory: 256,
    gpu: 8,
    color: RESERVATION_COLORS[0],
    description: 'Deep learning coursework requiring GPU acceleration'
  },
  {
    id: '2',
    name: 'Research Project Alpha',
    gpuName: 'NVIDIA V100',
    cpu: 16,
    memory: 128,
    gpu: 2,
    color: RESERVATION_COLORS[1],
    description: 'Computational biology research project'
  },
  {
    id: '3',
    name: 'Data Science Workshop',
    gpuName: 'NVIDIA H100',
    cpu: 24,
    memory: 192,
    gpu: 4,
    color: RESERVATION_COLORS[2],
    description: 'Big data processing and analysis workshop'
  }
];

export const useResourceStore = create<ResourceStore>((set, get) => ({
  // Initial state
  resourcePool: defaultResourcePool,
  reservations: sampleReservations,
  utilization: {
    cpu: { used: 0, available: 0, percentage: 0 },
    memory: { used: 0, available: 0, percentage: 0 },
    gpu: { used: 0, available: 0, percentage: 0 }
  },
  breakdown: {
    cpu: [],
    memory: [],
    gpu: []
  },
  isAutoSaveEnabled: true,
  lastSaved: null,

  // Actions
  updateResourcePool: (pool) => {
    set((state) => ({
      resourcePool: { ...state.resourcePool, ...pool }
    }));
    // Recalculate utilization after pool update
    const store = get();
    set({
      utilization: store.calculateUtilization(),
      breakdown: store.calculateBreakdown()
    });
    
    // Auto-save if enabled
    if (store.isAutoSaveEnabled) {
      store.saveData();
    }
  },

  addReservation: (reservationData) => {
    const store = get();
    const newReservation: Reservation = {
      ...reservationData,
      id: Date.now().toString(),
      color: store.getNextColor()
    };
    
    set((state) => ({
      reservations: [...state.reservations, newReservation]
    }));
    
    // Recalculate utilization and breakdown
    const updatedStore = get();
    set({
      utilization: updatedStore.calculateUtilization(),
      breakdown: updatedStore.calculateBreakdown()
    });
    
    // Auto-save if enabled
    if (updatedStore.isAutoSaveEnabled) {
      updatedStore.saveData();
    }
  },

  removeReservation: (id) => {
    set((state) => ({
      reservations: state.reservations.filter(r => r.id !== id)
    }));
    
    // Recalculate utilization and breakdown
    const store = get();
    set({
      utilization: store.calculateUtilization(),
      breakdown: store.calculateBreakdown()
    });
    
    // Auto-save if enabled
    if (store.isAutoSaveEnabled) {
      store.saveData();
    }
  },

  updateReservation: (id, updates) => {
    set((state) => ({
      reservations: state.reservations.map(r => 
        r.id === id ? { ...r, ...updates } : r
      )
    }));
    
    // Recalculate utilization and breakdown
    const store = get();
    set({
      utilization: store.calculateUtilization(),
      breakdown: store.calculateBreakdown()
    });
    
    // Auto-save if enabled
    if (store.isAutoSaveEnabled) {
      store.saveData();
    }
  },

  // Persistence actions
  saveData: () => {
    const { resourcePool, reservations } = get();
    const success = persistenceManager.saveData({ resourcePool, reservations });
    if (success) {
      set({ lastSaved: new Date() });
    }
  },

  loadData: () => {
    const persistedData = persistenceManager.loadData();
    set({
      resourcePool: persistedData.resourcePool,
      reservations: persistedData.reservations
    });
    
    // Recalculate utilization and breakdown
    const store = get();
    set({
      utilization: store.calculateUtilization(),
      breakdown: store.calculateBreakdown()
    });
  },

  exportData: () => {
    return persistenceManager.exportData();
  },

  importData: (jsonData) => {
    const success = persistenceManager.importData(jsonData);
    if (success) {
      get().loadData();
    }
    return success;
  },

  clearData: () => {
    const success = persistenceManager.clearData();
    if (success) {
      set({
        resourcePool: defaultResourcePool,
        reservations: [],
        lastSaved: null
      });
      
      // Recalculate utilization and breakdown
      const store = get();
      set({
        utilization: store.calculateUtilization(),
        breakdown: store.calculateBreakdown()
      });
    }
    return success;
  },

  toggleAutoSave: () => {
    const { isAutoSaveEnabled } = get();
    const newState = !isAutoSaveEnabled;
    
    set({ isAutoSaveEnabled: newState });
    
    if (newState) {
      autoSaveManager.startAutoSave(() => {
        get().saveData();
      });
    } else {
      autoSaveManager.stopAutoSave();
    }
  },

  // Computed getters
  getNextColor: () => {
    const { reservations } = get();
    const usedColors = new Set(reservations.map(r => r.color));
    const availableColor = RESERVATION_COLORS.find(color => !usedColors.has(color));
    return availableColor || RESERVATION_COLORS[reservations.length % RESERVATION_COLORS.length];
  },

  calculateUtilization: () => {
    const { resourcePool, reservations } = get();
    
    const totalUsed = reservations.reduce(
      (acc, reservation) => ({
        cpu: acc.cpu + reservation.cpu,
        memory: acc.memory + reservation.memory,
        gpu: acc.gpu + reservation.gpu
      }),
      { cpu: 0, memory: 0, gpu: 0 }
    );

    return {
      cpu: {
        used: totalUsed.cpu,
        available: resourcePool.cpu.total - totalUsed.cpu,
        percentage: (totalUsed.cpu / resourcePool.cpu.total) * 100
      },
      memory: {
        used: totalUsed.memory,
        available: resourcePool.memory.total - totalUsed.memory,
        percentage: (totalUsed.memory / resourcePool.memory.total) * 100
      },
      gpu: {
        used: totalUsed.gpu,
        available: resourcePool.gpu.total - totalUsed.gpu,
        percentage: (totalUsed.gpu / resourcePool.gpu.total) * 100
      }
    };
  },

  calculateBreakdown: () => {
    const { resourcePool, reservations } = get();
    
    return {
      cpu: reservations.map(reservation => ({
        reservation,
        amount: reservation.cpu,
        percentage: (reservation.cpu / resourcePool.cpu.total) * 100
      })),
      memory: reservations.map(reservation => ({
        reservation,
        amount: reservation.memory,
        percentage: (reservation.memory / resourcePool.memory.total) * 100
      })),
      gpu: reservations.map(reservation => ({
        reservation,
        amount: reservation.gpu,
        percentage: (reservation.gpu / resourcePool.gpu.total) * 100
      }))
    };
  }
}));

// Initialize computed values and load persisted data on store creation
const store = useResourceStore.getState();

// Load persisted data if available
const persistedData = persistenceManager.loadData();
if (persistedData.reservations.length > 0 || 
    persistedData.resourcePool.cpu.total !== defaultResourcePool.cpu.total) {
  store.resourcePool = persistedData.resourcePool;
  store.reservations = persistedData.reservations;
}

// Recalculate computed values
store.utilization = store.calculateUtilization();
store.breakdown = store.calculateBreakdown();

// Start auto-save if enabled
if (store.isAutoSaveEnabled) {
  autoSaveManager.startAutoSave(() => {
    store.saveData();
  });
}
