// Core data types for HPC resource management

export interface ResourcePool {
  cpu: {
    total: number; // Total CPU cores available
    unit: 'cores';
  };
  memory: {
    total: number; // Total memory in GB
    unit: 'GB';
  };
  gpu: {
    total: number; // Total GPU units available
    unit: 'units';
  };
}

export interface Reservation {
  id: string;
  name: string;
  gpuName?: string; // Optional GPU name (e.g., A100, H100)
  cpu: number; // CPU cores required
  memory: number; // Memory in GB required
  gpu: number; // GPU units required
  color: string; // Color for visualization
  description?: string;
}

export interface ResourceUtilization {
  cpu: {
    used: number;
    available: number;
    percentage: number;
  };
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  gpu: {
    used: number;
    available: number;
    percentage: number;
  };
}

export interface ReservationBreakdown {
  cpu: Array<{
    reservation: Reservation;
    amount: number;
    percentage: number;
  }>;
  memory: Array<{
    reservation: Reservation;
    amount: number;
    percentage: number;
  }>;
  gpu: Array<{
    reservation: Reservation;
    amount: number;
    percentage: number;
  }>;
}

// Color palette for different classes/jobs
export const RESERVATION_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
] as const;
