import { create } from 'zustand';
import { temporal } from 'zundo';
import { Project, ViewSettings, Task, Dependency } from '@/types/gantt';
import { recalculateSchedule } from '@/lib/planningEngine';
// date-fns imports removed - using fixed project dates

interface GanttState {
  project: Project;
  viewSettings: ViewSettings;
  selectedTaskId: string | null;
  
  // Actions
  setProject: (project: Project) => void;
  updateTask: (taskId: string, updates: Partial<Task>, skipRecalculate?: boolean) => void;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
  selectTask: (taskId: string | null) => void;
  recalculate: () => void;
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

export const useGanttStore = create<GanttState>()(
  temporal(
    (set, get) => ({
  project: initialProject,
  viewSettings: initialViewSettings,
  selectedTaskId: null,

  setProject: (project) => set({ project }),
  
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
  },

  updateViewSettings: (settings) => set((state) => ({
    viewSettings: { ...state.viewSettings, ...settings }
  })),

  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  recalculate: () => {
    const { project } = get();
    const recalculatedProject = recalculateSchedule(project);
    set({ project: recalculatedProject });
  }
    }),
    {
      limit: 100,
      partialize: (state) => ({ project: state.project }), // Only track project state changes
    }
  )
);
