import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types simplifiés
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  service: string;
  company?: string; // Pour les partners
}

interface ServicesState {
  members: TeamMember[];
  
  // État de synchronisation Netlify
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  
  // Actions
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, data: Partial<TeamMember>) => void;
  resetMembers: () => void;
  
  // Actions de synchronisation Netlify
  saveToNetlify: () => Promise<void>;
  loadFromNetlify: () => Promise<void>;
}

// Liste initiale des membres de l'équipe (anonymisée RGPD)
const INITIAL_MEMBERS: TeamMember[] = [
  // Projet
  { id: 'hr-1', firstName: 'G.', lastName: 'MAH', role: 'Chef de projet', service: 'Projet' },
  { id: 'hr-2', firstName: 'A.', lastName: 'GAN', role: 'BA', service: 'BA DTN' },
  
  // Key Users
  { id: 'hr-3', firstName: 'V.', lastName: 'TAI', role: 'Key User', service: 'Logistique' },
  { id: 'hr-4', firstName: 'V.', lastName: 'MON', role: 'Key User', service: 'Partners', company: 'Wingleet' },
  { id: 'hr-5', firstName: 'E.', lastName: 'TAV', role: 'Key User', service: 'Production - SGS' },
  { id: 'hr-6', firstName: 'M.', lastName: 'NGA', role: 'Key User', service: 'Production' },
  
  // Business Specialists
  { id: 'hr-7', firstName: 'P.', lastName: 'REI', role: 'Business Specialist', service: 'Technical Office' },
  { id: 'hr-8', firstName: 'F.', lastName: 'THI', role: 'Business Specialist', service: 'Technical Office - Engineering' },
  { id: 'hr-9', firstName: 'D.', lastName: 'HIC', role: 'Business Specialist', service: 'Technical Office - Planning' },
  { id: 'hr-10', firstName: 'J.', lastName: 'DES', role: 'Business Specialist', service: 'Production' },
  { id: 'hr-11', firstName: 'O.', lastName: 'NYP', role: 'Business Specialist', service: 'Production - MCC' },
  { id: 'hr-12', firstName: 'N.', lastName: 'MAL', role: 'Business Specialist', service: 'Production - Cabine' },
  { id: 'hr-13', firstName: 'D.', lastName: 'BAR', role: 'Business Specialist', service: 'Production - Preparator' },
  { id: 'hr-14', firstName: 'M.', lastName: 'HAU', role: 'Business Specialist', service: 'Logistique - Magasin' },
  { id: 'hr-15', firstName: 'N.', lastName: 'BES', role: 'Business Specialist', service: 'Logistique - Import' },
  { id: 'hr-16', firstName: 'I.', lastName: 'DO', role: 'Business Specialist', service: 'Logistique - Achats' },
  { id: 'hr-17', firstName: 'L.', lastName: 'PET', role: 'Business Specialist', service: 'Logistique - Contrats' },
  { id: 'hr-18', firstName: 'C.', lastName: 'BER', role: 'Business Specialist', service: 'Logistique - Finance' },
  
  // IT
  { id: 'hr-19', firstName: 'R.', lastName: 'NAD', role: 'Référent IT', service: 'IT' },
  
  // Partners
  { id: 'hr-20', firstName: 'O.', lastName: 'CHA', role: 'PMO', service: 'Partners', company: 'NEO Conseil' },
  { id: 'hr-21', firstName: 'P.', lastName: 'STI', role: 'Intégrateur', service: 'Partners', company: 'ADRex' },
];

// Debounce helper
let servicesSaveTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedServicesSave = (saveFn: () => Promise<void>) => {
  if (servicesSaveTimeout) clearTimeout(servicesSaveTimeout);
  servicesSaveTimeout = setTimeout(() => saveFn().catch(console.error), 500);
};

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      members: INITIAL_MEMBERS,
      isSyncing: false,
      lastSyncedAt: null,
      syncError: null,
      
      addMember: (member) => {
        set((state) => ({
          members: [
            ...state.members,
            {
              ...member,
              id: `hr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        }));
        debouncedServicesSave(() => get().saveToNetlify());
      },
      
      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
        debouncedServicesSave(() => get().saveToNetlify());
      },
      
      updateMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }));
        debouncedServicesSave(() => get().saveToNetlify());
      },
      
      resetMembers: () => {
        set({ members: INITIAL_MEMBERS });
        debouncedServicesSave(() => get().saveToNetlify());
      },

      saveToNetlify: async () => {
        const { members } = get();
        set({ isSyncing: true, syncError: null });
        
        try {
          const response = await fetch('/api/services-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members }),
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
          const response = await fetch('/api/services-save');
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Erreur de chargement');
          }
          
          if (result.data?.members && result.data.members.length > 0) {
            set({ members: result.data.members, isSyncing: false, lastSyncedAt: result.savedAt, syncError: null });
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
      name: 'services-storage-v6', // v6 - Vincent MONTESANO as Partner
    }
  )
);

// Helper pour grouper par service
export const groupMembersByService = (members: TeamMember[]) => {
  const groups: Record<string, TeamMember[]> = {};
  members.forEach((member) => {
    const mainService = member.service.split(' - ')[0];
    if (!groups[mainService]) {
      groups[mainService] = [];
    }
    groups[mainService].push(member);
  });
  return groups;
};

// Couleurs des services
export const SERVICE_COLORS: Record<string, string> = {
  'Projet': '#0ea5e9',
  'BA DTN': '#06b6d4',
  'Logistique': '#22c55e',
  'Technical Office': '#ef4444',
  'Production': '#3b82f6',
  'IT': '#8b5cf6',
  'HR': '#f59e0b',
  'Partners': '#ec4899',
};
