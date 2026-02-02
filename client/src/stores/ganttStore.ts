import { create } from 'zustand';
import { temporal } from 'zundo';
import { Project, ViewSettings, Task, Dependency, Lane } from '@/types/gantt';
import { recalculateSchedule } from '@/lib/planningEngine';
// date-fns imports removed - using fixed project dates

interface GanttState {
  project: Project;
  viewSettings: ViewSettings;
  selectedTaskId: string | null;
  
  // État de synchronisation Netlify
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  
  // Actions Project
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  
  // Actions Tasks
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>, skipRecalculate?: boolean) => void;
  deleteTask: (taskId: string) => void;
  
  // Actions Lanes (Services impactés)
  addLane: (lane: { id: string; name: string; color?: string }) => void;
  updateLane: (laneId: string, updates: Partial<{ name: string; color: string; order: number }>) => void;
  deleteLane: (laneId: string) => void;
  
  // Actions Dependencies
  addDependency: (dependency: Dependency) => void;
  deleteDependency: (dependencyId: string) => void;
  
  // Other Actions
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
  selectTask: (taskId: string | null) => void;
  recalculate: () => void;
  
  // Actions de synchronisation Netlify
  saveToNetlify: () => Promise<void>;
  loadFromNetlify: () => Promise<void>;
}

// Project timeline: January 2026 to January 2027
const PROJECT_VIEW_START = new Date(2026, 0, 1); // January 1, 2026
const PROJECT_VIEW_END = new Date(2027, 0, 31);  // January 31, 2027

const initialViewSettings: ViewSettings = {
  zoomLevel: 'week',
  startDate: PROJECT_VIEW_START,
  endDate: PROJECT_VIEW_END,
  rowHeight: 40,
  columnWidth: 60, // Width per day/week/month depending on zoom
};

const initialProject: Project = {
  id: 'proj-001',
  name: 'New Aviation Project',
  startDate: new Date(),
  lanes: [],
  tasks: [],
  dependencies: []
};

// Debounce helper
let ganttSaveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedGanttSave = (saveFn: () => Promise<void>) => {
  if (ganttSaveTimeout) clearTimeout(ganttSaveTimeout);
  ganttSaveTimeout = setTimeout(() => saveFn().catch(console.error), 1000);
};

export const useGanttStore = create<GanttState>()(
  temporal(
    (set, get) => ({
  project: initialProject,
  viewSettings: initialViewSettings,
  selectedTaskId: null,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,

  setProject: (project) => {
    set({ project });
    debouncedGanttSave(() => get().saveToNetlify());
  },

  updateProject: (updates) => {
    set((state) => ({
      project: { ...state.project, ...updates }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  // =============================================
  // TASK ACTIONS
  // =============================================
  addTask: (task) => {
    set((state) => ({
      project: {
        ...state.project,
        tasks: [...state.project.tasks, task]
      }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },
  
  updateTask: (taskId, updates, skipRecalculate = false) => {
    const { project } = get();
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };

    set({
      project: {
        ...project,
        tasks: updatedTasks
      }
    });
    
    // Trigger recalculation if dates or duration changed (unless skipped during drag)
    if (!skipRecalculate && (updates.start || updates.duration || updates.dependencies)) {
      get().recalculate();
    }
    
    // Auto-save to Netlify
    debouncedGanttSave(() => get().saveToNetlify());
  },

  deleteTask: (taskId) => {
    set((state) => ({
      project: {
        ...state.project,
        tasks: state.project.tasks.filter(t => t.id !== taskId),
        // Also remove dependencies involving this task
        dependencies: state.project.dependencies.filter(
          d => d.sourceId !== taskId && d.targetId !== taskId
        )
      },
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  // =============================================
  // LANE ACTIONS (Services impactés)
  // =============================================
  addLane: (lane) => {
    const { project } = get();
    const maxOrder = project.lanes.length > 0 
      ? Math.max(...project.lanes.map(l => l.order)) 
      : 0;
    
    set((state) => ({
      project: {
        ...state.project,
        lanes: [...state.project.lanes, { ...lane, order: maxOrder + 1 }]
      }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  updateLane: (laneId, updates) => {
    set((state) => ({
      project: {
        ...state.project,
        lanes: state.project.lanes.map(l => 
          l.id === laneId ? { ...l, ...updates } : l
        )
      }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  deleteLane: (laneId) => {
    set((state) => ({
      project: {
        ...state.project,
        lanes: state.project.lanes.filter(l => l.id !== laneId),
        // Also remove tasks in this lane
        tasks: state.project.tasks.filter(t => t.laneId !== laneId)
      }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  // =============================================
  // DEPENDENCY ACTIONS
  // =============================================
  addDependency: (dependency) => {
    set((state) => ({
      project: {
        ...state.project,
        dependencies: [...state.project.dependencies, dependency]
      }
    }));
    get().recalculate();
  },

  deleteDependency: (dependencyId) => {
    set((state) => ({
      project: {
        ...state.project,
        dependencies: state.project.dependencies.filter(d => d.id !== dependencyId)
      }
    }));
    debouncedGanttSave(() => get().saveToNetlify());
  },

  updateViewSettings: (settings) => set((state) => ({
    viewSettings: { ...state.viewSettings, ...settings }
  })),

  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  recalculate: () => {
    const { project } = get();
    const recalculatedProject = recalculateSchedule(project);
    set({ project: recalculatedProject });
    debouncedGanttSave(() => get().saveToNetlify());
  },

  saveToNetlify: async () => {
    const { project } = get();
    set({ isSyncing: true, syncError: null });
    
    try {
      const response = await fetch('/api/gantt-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, project }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur de sauvegarde');
      }
      
      set({ isSyncing: false, lastSyncedAt: result.savedAt, syncError: null });
    } catch (error) {
      set({ isSyncing: false, syncError: error instanceof Error ? error.message : 'Erreur' });
      throw error;
    }
  },

  loadFromNetlify: async () => {
    set({ isSyncing: true, syncError: null });
    
    try {
      // Utiliser l'ID du projet aviation par défaut
      const projectId = 'aviation-impl-001';
      const response = await fetch(`/api/gantt-save?projectId=${projectId}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur de chargement');
      }
      
      if (result.data) {
        // Reconvertir les dates ISO en objets Date
        const projectData = result.data;
        if (projectData.startDate) projectData.startDate = new Date(projectData.startDate);
        if (projectData.tasks) {
          projectData.tasks = projectData.tasks.map((t: any) => ({
            ...t,
            start: t.start ? new Date(t.start) : new Date(),
            end: t.end ? new Date(t.end) : new Date(),
            baselineStart: t.baselineStart ? new Date(t.baselineStart) : undefined,
            baselineEnd: t.baselineEnd ? new Date(t.baselineEnd) : undefined,
          }));
        }
        set({ project: projectData, isSyncing: false, lastSyncedAt: result.savedAt, syncError: null });
      } else {
        set({ isSyncing: false });
      }
    } catch (error) {
      set({ isSyncing: false, syncError: error instanceof Error ? error.message : 'Erreur' });
      console.warn('Impossible de charger depuis Netlify:', error);
    }
  },
    }),
    {
      limit: 100,
      partialize: (state) => ({ project: state.project }), // Only track project state changes
    }
  )
);
