import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DT_ORGA_DATA, OrgNode, ServiceUnit, getAllServicesAndUnits as getStaticServicesAndUnits } from '@/lib/dtOrgaData';

// Store pour les associations dynamiques entre services/unités et processus
interface ServiceProcessAssociation {
  serviceId: string;
  subModuleIds: string[];
}

interface DTOrgaState {
  // Associations personnalisées (override les associations statiques)
  customAssociations: ServiceProcessAssociation[];
  
  // État de synchronisation
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  
  // Actions
  addProcessToService: (serviceId: string, subModuleId: string) => void;
  removeProcessFromService: (serviceId: string, subModuleId: string) => void;
  setServiceProcesses: (serviceId: string, subModuleIds: string[]) => void;
  getServicesForProcess: (subModuleId: string) => ServiceUnit[];
  getAllServicesAndUnits: () => ServiceUnit[];
  
  // Actions de synchronisation Netlify
  saveToNetlify: () => Promise<void>;
  loadFromNetlify: () => Promise<void>;
}

export const useDTOrgaStore = create<DTOrgaState>()(
  persist(
    (set, get) => ({
      customAssociations: [],
      isSyncing: false,
      lastSyncedAt: null,
      syncError: null,

      addProcessToService: (serviceId, subModuleId) => {
        set((state) => {
          const existingAssoc = state.customAssociations.find(a => a.serviceId === serviceId);
          if (existingAssoc) {
            if (existingAssoc.subModuleIds.includes(subModuleId)) {
              return state; // Already exists
            }
            return {
              customAssociations: state.customAssociations.map(a => 
                a.serviceId === serviceId 
                  ? { ...a, subModuleIds: [...a.subModuleIds, subModuleId] }
                  : a
              )
            };
          }
          // Create new association starting from static data
          const staticServices = getStaticServicesAndUnits();
          const staticService = staticServices.find(s => s.id === serviceId);
          const baseSubModuleIds = staticService?.subModuleIds || [];
          
          return {
            customAssociations: [
              ...state.customAssociations,
              { 
                serviceId, 
                subModuleIds: [...baseSubModuleIds, subModuleId].filter((v, i, a) => a.indexOf(v) === i)
              }
            ]
          };
        });
        // Auto-save to Netlify after change
        setTimeout(() => get().saveToNetlify().catch(console.error), 100);
      },

      removeProcessFromService: (serviceId, subModuleId) => {
        set((state) => {
          const existingAssoc = state.customAssociations.find(a => a.serviceId === serviceId);
          if (existingAssoc) {
            return {
              customAssociations: state.customAssociations.map(a => 
                a.serviceId === serviceId 
                  ? { ...a, subModuleIds: a.subModuleIds.filter(id => id !== subModuleId) }
                  : a
              )
            };
          }
          // Create new association without the subModuleId
          const staticServices = getStaticServicesAndUnits();
          const staticService = staticServices.find(s => s.id === serviceId);
          const baseSubModuleIds = (staticService?.subModuleIds || []).filter(id => id !== subModuleId);
          
          return {
            customAssociations: [
              ...state.customAssociations,
              { serviceId, subModuleIds: baseSubModuleIds }
            ]
          };
        });
        // Auto-save to Netlify after change
        setTimeout(() => get().saveToNetlify().catch(console.error), 100);
      },

      setServiceProcesses: (serviceId, subModuleIds) => {
        set((state) => {
          const existingAssoc = state.customAssociations.find(a => a.serviceId === serviceId);
          if (existingAssoc) {
            return {
              customAssociations: state.customAssociations.map(a => 
                a.serviceId === serviceId 
                  ? { ...a, subModuleIds }
                  : a
              )
            };
          }
          return {
            customAssociations: [
              ...state.customAssociations,
              { serviceId, subModuleIds }
            ]
          };
        });
      },

      getServicesForProcess: (subModuleId) => {
        const { customAssociations, getAllServicesAndUnits } = get();
        const allServices = getAllServicesAndUnits();
        
        return allServices.filter(service => service.subModuleIds.includes(subModuleId));
      },

      getAllServicesAndUnits: () => {
        const { customAssociations } = get();
        const staticServices = getStaticServicesAndUnits();
        
        // Merge static services with custom associations
        return staticServices.map(service => {
          const customAssoc = customAssociations.find(a => a.serviceId === service.id);
          if (customAssoc) {
            return {
              ...service,
              subModuleIds: customAssoc.subModuleIds
            };
          }
          return service;
        });
      },

      saveToNetlify: async () => {
        const { customAssociations } = get();
        set({ isSyncing: true, syncError: null });
        
        try {
          const response = await fetch('/api/dt-orga-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customAssociations }),
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
          const response = await fetch('/api/dt-orga-save');
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erreur de chargement');
          }
          
          if (result.data?.customAssociations) {
            set({ 
              customAssociations: result.data.customAssociations,
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
          // Ne pas throw ici pour permettre le fallback sur localStorage
          console.warn('Impossible de charger depuis Netlify, utilisation du localStorage:', error);
        }
      },
    }),
    {
      name: 'dt-orga-storage',
    }
  )
);

// Helper function exportée pour une utilisation facile
export const getServiceBySubModuleIdDynamic = (subModuleId: string): ServiceUnit | undefined => {
  const store = useDTOrgaStore.getState();
  const services = store.getAllServicesAndUnits();
  return services.find(s => s.subModuleIds.includes(subModuleId));
};
