# HPC Resource Dashboard

An interactive web-based visualization tool for High Performance Computing (HPC) system administrators to visualize and manage resource reservations across CPU, Memory, and GPU resources.

## Features

- **Real-time Resource Visualization**: Interactive charts showing CPU, Memory, and GPU utilization
- **Dynamic Reservation Management**: Add, edit, and remove resource reservations
- **Color-coded Class/Job Tracking**: Visual distinction between different classes and research projects
- **Data Persistence**: Automatic saving and loading of reservations and settings
- **Export/Import Functionality**: Backup and restore your data
- **Responsive Design**: Works on desktop and tablet devices
- **Intuitive Interface**: Designed specifically for HPC administrators
- **Docker Support**: Full containerization with development and production configurations
- **CI/CD Pipeline**: Automated testing, building, and deployment

## Technology Stack

- **React 18** with TypeScript for type-safe component development
- **Tailwind CSS** for rapid, consistent styling
- **Recharts** for professional data visualizations
- **Zustand** for lightweight state management
- **Vite** for fast development and building

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

### Docker Development

1. **Start Development Environment**
   ```bash
   docker-compose --profile dev up
   ```

2. **Access Application**
   Navigate to `http://localhost:3000`

### Docker Production

1. **Start Production Environment**
   ```bash
   docker-compose --profile prod up
   ```

2. **Access Application**
   Navigate to `http://localhost:8080`

## Usage

### Adding Reservations
1. Click the "Add Reservation" button in the header
2. Fill in the reservation details:
   - **Name**: Descriptive name (e.g., "Machine Learning Class")
   - **Class/Job ID**: Identifier (e.g., "ML-101", "RESEARCH-001")
   - **Resource Requirements**: Specify CPU cores, Memory (GB), and GPU units
   - **Description**: Optional details about the reservation

### Viewing Resource Utilization
- **System Overview**: High-level utilization percentages and status
- **Resource Cards**: Detailed breakdowns with pie charts and progress bars
- **Reservation List**: Complete list of active reservations with management options

### Managing Reservations
- View all active reservations in the reservation list
- Delete reservations using the trash icon
- Monitor real-time utilization updates

### Data Persistence
- **Auto-save**: Data is automatically saved every 30 seconds
- **Manual Save**: Click "Save Now" in the Data Management panel
- **Export**: Download your data as a JSON backup file
- **Import**: Upload a previously exported backup file
- **Clear Data**: Reset all data to default state
- **Storage Info**: View storage usage and settings

## Data Structure

The application uses a clean separation between:
- **Resource Pool**: Total available system resources
- **Reservations**: Individual class/job resource requirements
- **Utilization**: Calculated usage across all resource types

## Future Integration

The system is designed to easily integrate with HPC job schedulers:

### SLURM Integration
```typescript
// Example: Fetch reservations from SLURM
const fetchSLURMReservations = async () => {
  const response = await fetch('/api/slurm/reservations');
  const slurmData = await response.json();
  // Transform SLURM data to our reservation format
  return transformSLURMData(slurmData);
};
```

### PBS Integration
```typescript
// Example: Fetch reservations from PBS
const fetchPBSReservations = async () => {
  const response = await fetch('/api/pbs/reservations');
  const pbsData = await response.json();
  // Transform PBS data to our reservation format
  return transformPBSData(pbsData);
};
```

## Customization

### Resource Pool Configuration
Modify the default resource pool in `src/store/useResourceStore.ts`:

```typescript
const defaultResourcePool: ResourcePool = {
  cpu: { total: 128, unit: 'cores' },
  memory: { total: 1024, unit: 'GB' },
  gpu: { total: 16, unit: 'units' }
};
```

### Color Scheme
Update reservation colors in `src/types/index.ts`:

```typescript
export const RESERVATION_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  // Add more colors as needed
] as const;
```

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ResourceCard.tsx
│   ├── ReservationForm.tsx
│   ├── ReservationList.tsx
│   ├── SystemOverview.tsx
│   └── PersistenceManager.tsx
├── store/              # State management
│   └── useResourceStore.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── persistence.ts
├── App.tsx             # Main application
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### Testing

#### Local Testing (without Docker)
```bash
# Run comprehensive local tests
./scripts/test-local.sh

# Run specific tests
npm run lint          # ESLint
npm run build         # Build test
npm run preview       # Production preview
```

#### Docker Testing
```bash
# Test Docker configuration
./scripts/test-docker.sh

# Test Kubernetes deployment
./scripts/test-k8s.sh
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License - Feel free to use and modify for your HPC environment.
