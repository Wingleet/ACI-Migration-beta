export type TaskType = 'task' | 'milestone';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface Dependency {
  id: string;
  sourceId: string;
  targetId: string;
  type: DependencyType;
  lag?: number; // in days
}

export interface Task {
  id: string;
  name: string;
  laneId: string;
  start: Date;
  end: Date; // For milestones, start === end
  duration: number; // in days
  progress: number; // 0-100
  type: TaskType;
  dependencies: string[]; // IDs of dependencies where this task is the target
  
  // Constraints & Flags
  isLocked?: boolean; // If true, cannot be moved manually
  isScopeFreeze?: boolean; // Special flag for scope freeze
  
  // Meta
  owner?: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'delayed';
  tags?: string[];
  
  // Baseline tracking
  baselineStart?: Date;
  baselineEnd?: Date;
}

export interface Lane {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: Date;
  lanes: Lane[];
  tasks: Task[];
  dependencies: Dependency[];
}

export interface ViewSettings {
  zoomLevel: 'year' | 'month' | 'week' | 'day';
  startDate: Date;
  endDate: Date;
  rowHeight: number;
  columnWidth: number;
}
