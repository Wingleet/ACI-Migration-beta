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
  
  // Actions
  addMember: (member: Omit<TeamMember, 'id'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, data: Partial<TeamMember>) => void;
  resetMembers: () => void;
}

// Liste initiale des membres de l'équipe
const INITIAL_MEMBERS: TeamMember[] = [
  // Projet
  { id: 'hr-1', firstName: 'Gaétan', lastName: 'MAHON', role: 'Chef de projet', service: 'Projet' },
  { id: 'hr-2', firstName: 'Arielle', lastName: 'GANTELET', role: 'BA', service: 'BA DTN' },
  
  // Key Users
  { id: 'hr-3', firstName: 'Vaïana', lastName: 'TAIRIO', role: 'Key User', service: 'Logistique' },
  { id: 'hr-4', firstName: 'Vincent', lastName: 'MONTESANO', role: 'Key User', service: 'Partners', company: 'Wingleet' },
  { id: 'hr-5', firstName: 'Elodie', lastName: 'TAVONG', role: 'Key User', service: 'Production - SGS' },
  { id: 'hr-6', firstName: 'Marcel', lastName: 'NGAIOHNI', role: 'Key User', service: 'Production' },
  
  // Business Specialists
  { id: 'hr-7', firstName: 'Philippe', lastName: 'REITER', role: 'Business Specialist', service: 'Technical Office' },
  { id: 'hr-8', firstName: 'Florentin', lastName: 'THIBEAUX', role: 'Business Specialist', service: 'Technical Office - Engineering' },
  { id: 'hr-9', firstName: 'Dean', lastName: 'HICKSON', role: 'Business Specialist', service: 'Technical Office - Planning' },
  { id: 'hr-10', firstName: 'Jérome', lastName: 'DESCOTES', role: 'Business Specialist', service: 'Production' },
  { id: 'hr-11', firstName: 'Olivier', lastName: 'NYPIE', role: 'Business Specialist', service: 'Production - MCC' },
  { id: 'hr-12', firstName: 'Nancy', lastName: 'MALAU', role: 'Business Specialist', service: 'Production - Cabine' },
  { id: 'hr-13', firstName: 'David', lastName: 'BARBIER', role: 'Business Specialist', service: 'Production - Preparator' },
  { id: 'hr-14', firstName: 'Mélodie', lastName: 'HAUPUNI', role: 'Business Specialist', service: 'Logistique - Magasin' },
  { id: 'hr-15', firstName: 'Nathalie', lastName: 'BESANCON', role: 'Business Specialist', service: 'Logistique - Import' },
  { id: 'hr-16', firstName: 'Isabelle', lastName: 'DO', role: 'Business Specialist', service: 'Logistique - Achats' },
  { id: 'hr-17', firstName: 'Léonore', lastName: 'PETIT', role: 'Business Specialist', service: 'Logistique - Contrats' },
  { id: 'hr-18', firstName: 'Charlotte', lastName: 'BERNARD', role: 'Business Specialist', service: 'Logistique - Finance' },
  
  // IT
  { id: 'hr-19', firstName: 'Rudy', lastName: 'NADIMIN', role: 'Référent IT', service: 'IT' },
  
  // Partners
  { id: 'hr-20', firstName: 'Olivier', lastName: 'CHARDIN', role: 'PMO', service: 'Partners', company: 'NEO Conseil' },
  { id: 'hr-21', firstName: 'Patrice', lastName: 'STIMPFLING', role: 'Intégrateur', service: 'Partners', company: 'ADRex' },
];

export const useServicesStore = create<ServicesState>()(
  persist(
    (set) => ({
      members: INITIAL_MEMBERS,
      
      addMember: (member) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              ...member,
              id: `hr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        })),
      
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      
      updateMember: (id, data) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),
      
      resetMembers: () => set({ members: INITIAL_MEMBERS }),
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
