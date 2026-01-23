import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ChangeStudy,
  Risk,
  RiskScoring,
  RiskLevel,
  StudyFilters,
  StudyStatus,
  ChangeType,
  RiskCategory,
  RiskStatus,
  SectionStatus,
  MitigationAction,
  DEFAULT_SECTIONS,
} from '@/types/risk';

// Helper to calculate risk level from scoring
const calculateRiskLevel = (scoring: Omit<RiskScoring, 'calculatedScore' | 'riskLevel'>): RiskScoring => {
  const score = (scoring.severity * 0.4 + scoring.probability * 0.4 + scoring.detectability * 0.2);
  let riskLevel: RiskLevel = 'low';
  if (score >= 3.5) riskLevel = 'high';
  else if (score >= 2.0) riskLevel = 'medium';
  
  return {
    ...scoring,
    calculatedScore: Math.round(score * 10) / 10,
    riskLevel,
  };
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial sample data
const createSampleStudy = (): ChangeStudy => ({
  id: generateId(),
  title: 'Migration AMASIS → AMOS',
  changeType: 'tool_it',
  summary: 'Migration complète du système de gestion de maintenance AMASIS vers AMOS MRO.',
  status: 'risk_assessment',
  version: '1.2',
  createdBy: 'Jean Dupont',
  createdAt: '2026-01-10',
  updatedAt: '2026-01-20',
  targetGoLiveDate: '2026-06-01',
  sections: DEFAULT_SECTIONS.map((s) => ({
    id: generateId(),
    studyId: '',
    code: s.code,
    title: s.title,
    content: '',
    owner: '',
    status: 'not_started' as SectionStatus,
    locked: false,
    fields: s.fields,
  })),
  risks: [
    {
      id: generateId(),
      studyId: '',
      title: 'Perte de données historiques',
      description: 'Risque de perte ou corruption des données lors de la migration des archives de maintenance.',
      category: 'it_data',
      impactAreas: ['airworthiness_records', 'continuing_airworthiness'],
      scoring: calculateRiskLevel({ severity: 5, probability: 2, detectability: 3 }),
      owner: 'Marc Tech',
      status: 'open',
      mitigationActions: [
        {
          id: generateId(),
          riskId: '',
          title: 'Backup complet avant migration',
          description: 'Effectuer une sauvegarde complète de la base AMASIS',
          owner: 'Marc Tech',
          dueDate: '2026-02-15',
          status: 'completed',
          completedAt: '2026-02-10',
        },
        {
          id: generateId(),
          riskId: '',
          title: 'Tests de réconciliation',
          description: 'Comparer les données migrées avec les originales',
          owner: 'Sophie QA',
          dueDate: '2026-03-01',
          status: 'in_progress',
          completedAt: null,
        },
      ],
      linkedSections: ['3', '4'],
      createdAt: '2026-01-12',
      updatedAt: '2026-01-18',
    },
    {
      id: generateId(),
      studyId: '',
      title: 'Formation utilisateurs insuffisante',
      description: 'Les utilisateurs pourraient ne pas être suffisamment formés sur le nouveau système AMOS.',
      category: 'training',
      impactAreas: ['maintenance_execution', 'qms'],
      scoring: calculateRiskLevel({ severity: 3, probability: 3, detectability: 2 }),
      owner: 'Claire Formation',
      status: 'mitigated',
      mitigationActions: [
        {
          id: generateId(),
          riskId: '',
          title: 'Plan de formation complet',
          description: 'Élaborer un plan de formation par rôle',
          owner: 'Claire Formation',
          dueDate: '2026-02-01',
          status: 'completed',
          completedAt: '2026-01-28',
        },
      ],
      linkedSections: ['8'],
      createdAt: '2026-01-14',
      updatedAt: '2026-01-22',
    },
    {
      id: generateId(),
      studyId: '',
      title: 'Non-conformité réglementaire temporaire',
      description: 'Risque de non-conformité Part-145/CAMO pendant la période de transition.',
      category: 'regulatory',
      impactAreas: ['continuing_airworthiness', 'qms', 'sms'],
      scoring: calculateRiskLevel({ severity: 5, probability: 2, detectability: 2 }),
      owner: 'Paul Compliance',
      status: 'open',
      mitigationActions: [],
      linkedSections: ['5', '6'],
      createdAt: '2026-01-15',
      updatedAt: '2026-01-15',
    },
    {
      id: generateId(),
      studyId: '',
      title: 'Interruption opérationnelle',
      description: 'Risque d\'interruption des opérations de maintenance pendant le cutover.',
      category: 'operational',
      impactAreas: ['maintenance_execution', 'stores_logistics'],
      scoring: calculateRiskLevel({ severity: 4, probability: 3, detectability: 3 }),
      owner: 'Luc Ops',
      status: 'open',
      mitigationActions: [
        {
          id: generateId(),
          riskId: '',
          title: 'Plan de rollback',
          description: 'Préparer un plan de retour arrière documenté',
          owner: 'Luc Ops',
          dueDate: '2026-03-15',
          status: 'pending',
          completedAt: null,
        },
      ],
      linkedSections: ['6'],
      createdAt: '2026-01-16',
      updatedAt: '2026-01-20',
    },
  ],
});

interface RiskStoreState {
  studies: ChangeStudy[];
  selectedStudyId: string | null;
  selectedRiskId: string | null;
  filters: StudyFilters;
  
  // Actions
  selectStudy: (id: string | null) => void;
  selectRisk: (id: string | null) => void;
  setFilters: (filters: Partial<StudyFilters>) => void;
  resetFilters: () => void;
  
  // Study actions
  createStudy: (title: string, changeType: ChangeType) => void;
  updateStudy: (id: string, updates: Partial<ChangeStudy>) => void;
  deleteStudy: (id: string) => void;
  
  // Risk actions
  createRisk: (studyId: string, risk: Omit<Risk, 'id' | 'studyId' | 'createdAt' | 'updatedAt' | 'scoring'> & { scoring: Omit<RiskScoring, 'calculatedScore' | 'riskLevel'> }) => void;
  updateRisk: (studyId: string, riskId: string, updates: Partial<Risk>) => void;
  deleteRisk: (studyId: string, riskId: string) => void;
  updateRiskScoring: (studyId: string, riskId: string, scoring: Omit<RiskScoring, 'calculatedScore' | 'riskLevel'>) => void;
  
  // Mitigation actions
  addMitigationAction: (studyId: string, riskId: string, action: Omit<MitigationAction, 'id' | 'riskId'>) => void;
  updateMitigationAction: (studyId: string, riskId: string, actionId: string, updates: Partial<MitigationAction>) => void;
  
  // Computed
  getSelectedStudy: () => ChangeStudy | null;
  getSelectedRisk: () => Risk | null;
  getFilteredStudies: () => ChangeStudy[];
  getKPIs: () => {
    totalStudies: number;
    openRisks: number;
    highRisks: number;
    pendingApprovals: number;
    overdueTasks: number;
  };
  getRiskHeatmapData: (studyId: string) => { severity: number; probability: number; count: number }[];
}

const initialFilters: StudyFilters = {
  search: '',
  status: null,
  changeType: null,
  riskLevel: null,
};

export const useRiskStore = create<RiskStoreState>()(
  persist(
    (set, get) => ({
      studies: [createSampleStudy()],
      selectedStudyId: null,
      selectedRiskId: null,
      filters: initialFilters,
      
      selectStudy: (id) => set({ selectedStudyId: id, selectedRiskId: null }),
      selectRisk: (id) => set({ selectedRiskId: id }),
      
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: initialFilters }),
      
      createStudy: (title, changeType) => {
        const newStudy: ChangeStudy = {
          id: generateId(),
          title,
          changeType,
          summary: '',
          status: 'draft',
          version: '1.0',
          createdBy: 'Current User',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          targetGoLiveDate: null,
          sections: DEFAULT_SECTIONS.map((s) => ({
            id: generateId(),
            studyId: '',
            code: s.code,
            title: s.title,
            content: '',
            owner: '',
            status: 'not_started' as SectionStatus,
            locked: false,
            fields: s.fields,
          })),
          risks: [],
        };
        set((state) => ({ studies: [...state.studies, newStudy] }));
      },
      
      updateStudy: (id, updates) => set((state) => ({
        studies: state.studies.map((s) => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : s),
      })),
      
      deleteStudy: (id) => set((state) => ({
        studies: state.studies.filter((s) => s.id !== id),
        selectedStudyId: state.selectedStudyId === id ? null : state.selectedStudyId,
      })),
      
      createRisk: (studyId, risk) => {
        const scoring = calculateRiskLevel(risk.scoring);
        const newRisk: Risk = {
          ...risk,
          id: generateId(),
          studyId,
          scoring,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          studies: state.studies.map((s) => s.id === studyId ? { ...s, risks: [...s.risks, newRisk] } : s),
        }));
      },
      
      updateRisk: (studyId, riskId, updates) => set((state) => ({
        studies: state.studies.map((s) => s.id === studyId ? {
          ...s,
          risks: s.risks.map((r) => r.id === riskId ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : r),
        } : s),
      })),
      
      deleteRisk: (studyId, riskId) => set((state) => ({
        studies: state.studies.map((s) => s.id === studyId ? {
          ...s,
          risks: s.risks.filter((r) => r.id !== riskId),
        } : s),
        selectedRiskId: state.selectedRiskId === riskId ? null : state.selectedRiskId,
      })),
      
      updateRiskScoring: (studyId, riskId, scoring) => {
        const calculatedScoring = calculateRiskLevel(scoring);
        set((state) => ({
          studies: state.studies.map((s) => s.id === studyId ? {
            ...s,
            risks: s.risks.map((r) => r.id === riskId ? { ...r, scoring: calculatedScoring, updatedAt: new Date().toISOString().split('T')[0] } : r),
          } : s),
        }));
      },
      
      addMitigationAction: (studyId, riskId, action) => {
        const newAction: MitigationAction = {
          ...action,
          id: generateId(),
          riskId,
        };
        set((state) => ({
          studies: state.studies.map((s) => s.id === studyId ? {
            ...s,
            risks: s.risks.map((r) => r.id === riskId ? { ...r, mitigationActions: [...r.mitigationActions, newAction] } : r),
          } : s),
        }));
      },
      
      updateMitigationAction: (studyId, riskId, actionId, updates) => set((state) => ({
        studies: state.studies.map((s) => s.id === studyId ? {
          ...s,
          risks: s.risks.map((r) => r.id === riskId ? {
            ...r,
            mitigationActions: r.mitigationActions.map((a) => a.id === actionId ? { ...a, ...updates } : a),
          } : r),
        } : s),
      })),
      
      getSelectedStudy: () => {
        const { studies, selectedStudyId } = get();
        return studies.find((s) => s.id === selectedStudyId) || null;
      },
      
      getSelectedRisk: () => {
        const study = get().getSelectedStudy();
        if (!study) return null;
        return study.risks.find((r) => r.id === get().selectedRiskId) || null;
      },
      
      getFilteredStudies: () => {
        const { studies, filters } = get();
        return studies.filter((study) => {
          if (filters.search && !study.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
          if (filters.status && study.status !== filters.status) return false;
          if (filters.changeType && study.changeType !== filters.changeType) return false;
          if (filters.riskLevel) {
            const hasRiskLevel = study.risks.some((r) => r.scoring.riskLevel === filters.riskLevel);
            if (!hasRiskLevel) return false;
          }
          return true;
        });
      },
      
      getKPIs: () => {
        const { studies } = get();
        const allRisks = studies.flatMap((s) => s.risks);
        const allActions = allRisks.flatMap((r) => r.mitigationActions);
        const today = new Date().toISOString().split('T')[0];
        
        return {
          totalStudies: studies.length,
          openRisks: allRisks.filter((r) => r.status === 'open').length,
          highRisks: allRisks.filter((r) => r.scoring.riskLevel === 'high' && r.status === 'open').length,
          pendingApprovals: studies.filter((s) => s.status === 'approval_in_progress').length,
          overdueTasks: allActions.filter((a) => a.status !== 'completed' && a.dueDate && a.dueDate < today).length,
        };
      },
      
      getRiskHeatmapData: (studyId) => {
        const study = get().studies.find((s) => s.id === studyId);
        if (!study) return [];
        
        const heatmap: Map<string, number> = new Map();
        study.risks.forEach((risk) => {
          const key = `${risk.scoring.severity}-${risk.scoring.probability}`;
          heatmap.set(key, (heatmap.get(key) || 0) + 1);
        });
        
        return Array.from(heatmap.entries()).map(([key, count]) => {
          const [severity, probability] = key.split('-').map(Number);
          return { severity, probability, count };
        });
      },
    }),
    {
      name: 'risk-store',
    }
  )
);
