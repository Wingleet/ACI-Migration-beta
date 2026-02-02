import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Module, 
  SubModule, 
  GapRecord, 
  ProcessFilters, 
  ProcessKPIs,
  Action,
  Risk,
  Comment,
  AnalysisStatus,
  Verdict,
  Criticality,
  DepartmentColor
} from '@/types/process';
import { INITIAL_MODULES } from '@/lib/processData';
import { nanoid } from 'nanoid';

interface ProcessState {
  modules: Module[];
  filters: ProcessFilters;
  selectedSubModuleId: string | null;
  
  // État de synchronisation Netlify
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  
  // Actions
  setModules: (modules: Module[]) => void;
  updateSubModule: (moduleId: string, subModuleId: string, updates: Partial<SubModule>) => void;
  updateGapRecord: (moduleId: string, subModuleId: string, updates: Partial<GapRecord>) => void;
  addAction: (moduleId: string, subModuleId: string, action: Omit<Action, 'id'>) => void;
  updateAction: (moduleId: string, subModuleId: string, actionId: string, updates: Partial<Action>) => void;
  removeAction: (moduleId: string, subModuleId: string, actionId: string) => void;
  addRisk: (moduleId: string, subModuleId: string, risk: Omit<Risk, 'id'>) => void;
  updateRisk: (moduleId: string, subModuleId: string, riskId: string, updates: Partial<Risk>) => void;
  removeRisk: (moduleId: string, subModuleId: string, riskId: string) => void;
  addComment: (moduleId: string, subModuleId: string, userName: string, content: string) => void;
  removeComment: (moduleId: string, subModuleId: string, commentId: string) => void;
  setFilters: (filters: Partial<ProcessFilters>) => void;
  resetFilters: () => void;
  selectSubModule: (subModuleId: string | null) => void;
  
  // Actions de synchronisation Netlify
  saveToNetlify: () => Promise<void>;
  loadFromNetlify: () => Promise<void>;
  
  // Computed
  getKPIs: () => ProcessKPIs;
  getFilteredModules: () => Module[];
  getSubModuleById: (subModuleId: string) => { module: Module; subModule: SubModule } | null;
  getAllOwners: () => string[];
}

const initialFilters: ProcessFilters = {
  departmentColor: null,
  moduleId: null,
  status: null,
  verdict: null,
  criticality: null,
  owner: null,
  search: '',
  isSelected: null,
};

// Debounce helper pour éviter trop de sauvegardes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (saveFn: () => Promise<void>) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveFn().catch(console.error), 500);
};

export const useProcessStore = create<ProcessState>()(
  persist(
    (set, get) => ({
      modules: INITIAL_MODULES,
      filters: initialFilters,
      selectedSubModuleId: null,
      isSyncing: false,
      lastSyncedAt: null,
      syncError: null,

      setModules: (modules) => set({ modules }),

      updateSubModule: (moduleId, subModuleId, updates) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId ? { ...sm, ...updates } : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      updateGapRecord: (moduleId, subModuleId, updates) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            ...updates,
                            auditTrail: [
                              ...sm.gapRecord.auditTrail,
                              {
                                timestamp,
                                user: 'Utilisateur',
                                summary: `Updated: ${Object.keys(updates).join(', ')}`,
                              },
                            ],
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      addAction: (moduleId, subModuleId, action) => {
        const newAction: Action = { ...action, id: nanoid() };
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            actions: [...sm.gapRecord.actions, newAction],
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      updateAction: (moduleId, subModuleId, actionId, updates) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            actions: sm.gapRecord.actions.map((a) =>
                              a.id === actionId ? { ...a, ...updates } : a
                            ),
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      removeAction: (moduleId, subModuleId, actionId) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            actions: sm.gapRecord.actions.filter((a) => a.id !== actionId),
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      addRisk: (moduleId, subModuleId, risk) => {
        const newRisk: Risk = { ...risk, id: nanoid() };
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            risks: [...sm.gapRecord.risks, newRisk],
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      updateRisk: (moduleId, subModuleId, riskId, updates) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            risks: sm.gapRecord.risks.map((r) =>
                              r.id === riskId ? { ...r, ...updates } : r
                            ),
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      removeRisk: (moduleId, subModuleId, riskId) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            risks: sm.gapRecord.risks.filter((r) => r.id !== riskId),
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      addComment: (moduleId, subModuleId, userName, content) => {
        const newComment: Comment = {
          id: nanoid(),
          user: userName,
          timestamp: new Date().toISOString(),
          content,
        };
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            comments: [...sm.gapRecord.comments, newComment],
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      removeComment: (moduleId, subModuleId, commentId) => {
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  subModules: m.subModules.map((sm) =>
                    sm.id === subModuleId
                      ? {
                          ...sm,
                          gapRecord: {
                            ...sm.gapRecord,
                            comments: sm.gapRecord.comments.filter((c) => c.id !== commentId),
                          },
                        }
                      : sm
                  ),
                }
              : m
          ),
        }));
        debouncedSave(() => get().saveToNetlify());
      },

      setFilters: (filters) => {
        set((state) => ({ filters: { ...state.filters, ...filters } }));
      },

      resetFilters: () => set({ filters: initialFilters }),

      selectSubModule: (subModuleId) => set({ selectedSubModuleId: subModuleId }),

      getKPIs: () => {
        const { modules } = get();
        const allSubModules = modules.flatMap((m) => m.subModules);
        const total = allSubModules.length;
        const analyzed = allSubModules.filter((sm) => sm.status === 'done').length;
        const fit = allSubModules.filter((sm) => sm.gapRecord.verdict === 'fit').length;
        const gap = allSubModules.filter((sm) => sm.gapRecord.verdict === 'gap').length;
        const na = allSubModules.filter((sm) => sm.gapRecord.verdict === 'na').length;
        const openDecisions = allSubModules.filter(
          (sm) => sm.gapRecord.verdict === 'gap' && !sm.gapRecord.decision
        ).length;
        const highRisks = allSubModules.reduce(
          (count, sm) => count + sm.gapRecord.risks.filter((r) => r.criticality === 'high').length,
          0
        );

        return {
          totalSubModules: total,
          analyzedCount: analyzed,
          analyzedPercent: total > 0 ? Math.round((analyzed / total) * 100) : 0,
          fitCount: fit,
          gapCount: gap,
          naCount: na,
          openDecisionsCount: openDecisions,
          highRisksCount: highRisks,
        };
      },

      getFilteredModules: () => {
        const { modules, filters } = get();
        
        return modules
          .filter((m) => {
            if (filters.departmentColor && m.departmentColor !== filters.departmentColor) return false;
            if (filters.moduleId && m.id !== filters.moduleId) return false;
            return true;
          })
          .map((m) => ({
            ...m,
            subModules: m.subModules.filter((sm) => {
              if (filters.status && sm.status !== filters.status) return false;
              if (filters.verdict && sm.gapRecord.verdict !== filters.verdict) return false;
              if (filters.criticality && sm.criticality !== filters.criticality) return false;
              if (filters.owner && sm.gapRecord.owner !== filters.owner) return false;
              if (filters.isSelected !== null && sm.isSelected !== filters.isSelected) return false;
              if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesId = sm.id.toLowerCase().includes(searchLower);
                const matchesName = sm.name.toLowerCase().includes(searchLower);
                const matchesAsIs = sm.gapRecord.asIs.toLowerCase().includes(searchLower);
                const matchesToBe = sm.gapRecord.toBe.toLowerCase().includes(searchLower);
                if (!matchesId && !matchesName && !matchesAsIs && !matchesToBe) return false;
              }
              return true;
            }),
          }))
          .filter((m) => m.subModules.length > 0 || !filters.search);
      },

      getSubModuleById: (subModuleId) => {
        const { modules } = get();
        for (const module of modules) {
          const subModule = module.subModules.find((sm) => sm.id === subModuleId);
          if (subModule) {
            return { module, subModule };
          }
        }
        return null;
      },

      getAllOwners: () => {
        const { modules } = get();
        const owners = new Set<string>();
        modules.forEach((m) =>
          m.subModules.forEach((sm) => {
            if (sm.gapRecord.owner) owners.add(sm.gapRecord.owner);
          })
        );
        return Array.from(owners).sort();
      },

      saveToNetlify: async () => {
        const { modules } = get();
        set({ isSyncing: true, syncError: null });
        
        try {
          const response = await fetch('/api/process-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modules }),
          });
          
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erreur de sauvegarde');
          }
          
          set({ 
            isSyncing: false, 
            lastSyncedAt: result.savedAt,
            syncError: null 
          });
        } catch (error) {
          set({ 
            isSyncing: false, 
            syncError: error instanceof Error ? error.message : 'Erreur inconnue' 
          });
          throw error;
        }
      },

      loadFromNetlify: async () => {
        set({ isSyncing: true, syncError: null });
        
        try {
          const response = await fetch('/api/process-save');
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erreur de chargement');
          }
          
          if (result.data?.modules && result.data.modules.length > 0) {
            set({ 
              modules: result.data.modules,
              isSyncing: false, 
              lastSyncedAt: result.savedAt,
              syncError: null 
            });
          } else {
            set({ isSyncing: false });
          }
        } catch (error) {
          set({ 
            isSyncing: false, 
            syncError: error instanceof Error ? error.message : 'Erreur inconnue' 
          });
          console.warn('Impossible de charger depuis Netlify, utilisation du localStorage:', error);
        }
      },
    }),
    {
      name: 'process-storage',
    }
  )
);
