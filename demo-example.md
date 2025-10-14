# HPC Resource Dashboard - Demonstration Example

## Example Scenario: Adding "Class B requires 50% CPU and 64GB Memory"

This document demonstrates how the HPC Resource Dashboard handles dynamic resource updates when adding new reservations.

### Initial System State
- **Total CPU Cores**: 128
- **Total Memory**: 1024 GB  
- **Total GPU Units**: 16

### Existing Reservations
1. **Machine Learning Class** (ML-101)
   - CPU: 32 cores (25% of total)
   - Memory: 256 GB (25% of total)
   - GPU: 8 units (50% of total)

2. **Research Project Alpha** (RESEARCH)
   - CPU: 16 cores (12.5% of total)
   - Memory: 128 GB (12.5% of total)
   - GPU: 2 units (12.5% of total)

3. **Data Science Workshop** (DS-201)
   - CPU: 24 cores (18.75% of total)
   - Memory: 192 GB (18.75% of total)
   - GPU: 4 units (25% of total)

### Current Utilization
- **CPU**: 72 cores used (56.25% utilization)
- **Memory**: 576 GB used (56.25% utilization)
- **GPU**: 14 units used (87.5% utilization)

### Adding "Class B" Reservation

When you add a new reservation with:
- **Name**: "Advanced Computing Class"
- **Class**: "COMP-401"
- **CPU**: 64 cores (50% of total)
- **Memory**: 64 GB (6.25% of total)
- **GPU**: 0 units

### Updated System State

#### New Utilization
- **CPU**: 136 cores used (106.25% utilization) ⚠️ **OVERALLOCATED**
- **Memory**: 640 GB used (62.5% utilization)
- **GPU**: 14 units used (87.5% utilization)

#### Visual Updates
1. **System Overview Panel**
   - CPU utilization changes from 56.25% to 106.25% (red warning)
   - Memory utilization changes from 56.25% to 62.5% (green)
   - GPU utilization remains at 87.5% (yellow warning)

2. **CPU Resource Card**
   - Progress bar shows 106.25% (extends beyond 100%)
   - Pie chart shows new "Advanced Computing Class" slice
   - Breakdown list includes the new reservation

3. **Memory Resource Card**
   - Progress bar updates to 62.5%
   - New reservation appears in pie chart and breakdown

4. **Reservation List**
   - New "Advanced Computing Class" appears with COMP-401 class tag
   - Shows 64 cores, 64 GB memory, 0 GPU units

### Key Features Demonstrated

#### 1. Real-time Updates
- All visualizations update immediately when reservation is added
- Color coding maintains consistency across all components
- Utilization percentages recalculate automatically

#### 2. Over-allocation Detection
- System clearly shows when resources are over-allocated (CPU > 100%)
- Visual indicators (red colors) highlight potential issues
- Helps administrators identify resource conflicts

#### 3. Color-coded Management
- Each reservation gets a unique color from the palette
- Colors are consistent across all visualizations
- Easy to identify specific classes/jobs in complex systems

#### 4. Intuitive Interface
- Simple form for adding reservations
- Clear visual feedback on resource usage
- Easy deletion of reservations with confirmation

### Integration with HPC Schedulers

The system is designed to easily integrate with real HPC job schedulers:

#### SLURM Integration Example
```bash
# SLURM command to create reservation
scontrol create reservation ReservationName=COMP-401 \
  StartTime=2024-01-15T09:00:00 \
  Duration=04:00:00 \
  Nodes=node[001-008] \
  Users=comp401 \
  Flags=MAINT,IGNORE_JOBS
```

#### PBS Integration Example
```bash
# PBS command to create reservation
pbs_rsub -N COMP-401 \
  -l select=8:ncpus=8:mem=8gb \
  -l walltime=04:00:00 \
  -W group_list=comp401
```

The dashboard can be extended to:
- Fetch active reservations from scheduler APIs
- Display real-time job status
- Show historical utilization trends
- Integrate with monitoring systems (Ganglia, Prometheus)

### Benefits for HPC Administrators

1. **Clear Resource Visibility**: Immediate understanding of resource allocation
2. **Conflict Prevention**: Visual warnings for over-allocation
3. **Planning Support**: Easy to test different reservation scenarios
4. **Communication Tool**: Visual representation for stakeholders
5. **Efficient Management**: Quick addition/removal of reservations
