// Change Study Builder Types - Part-145 & Part-CAMO

export type StudyStatus = 
  | 'draft'
  | 'in_review'
  | 'risk_assessment'
  | 'approval_in_progress'
  | 'approved'
  | 'implementation'
  | 'post_implementation_review'
  | 'closed'
  | 'cancelled';

export type SectionStatus = 
  | 'not_started'
  | 'in_progress'
  | 'ready_for_review'
  | 'reviewed'
  | 'approved';

export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'closed';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ChangeType = 
  | 'process'
  | 'organizational'
  | 'tool_it'
  | 'scope_rating'
  | 'outsourcing'
  | 'facility_site';

export type RiskCategory = 
  | 'safety'
  | 'regulatory'
  | 'operational'
  | 'human_factors'
  | 'training'
  | 'it_data'
  | 'supplier'
  | 'financial';

export type ImpactArea = 
  | 'continuing_airworthiness'
  | 'maintenance_execution'
  | 'sms'
  | 'qms'
  | 'airworthiness_records'
  | 'tools_calibration'
  | 'flight_ops_interface'
  | 'stores_logistics';

export interface RiskScoring {
  severity: number; // 1-5
  probability: number; // 1-5
  detectability: number; // 1-5
  calculatedScore: number;
  riskLevel: RiskLevel;
}

export interface MitigationAction {
  id: string;
  riskId: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export interface Risk {
  id: string;
  studyId: string;
  title: string;
  description: string;
  category: RiskCategory;
  impactAreas: ImpactArea[];
  scoring: RiskScoring;
  owner: string;
  status: RiskStatus;
  mitigationActions: MitigationAction[];
  linkedSections: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  studyId: string;
  code: string;
  title: string;
  content: string;
  owner: string;
  status: SectionStatus;
  locked: boolean;
  fields: string[];
}

export interface ChangeStudy {
  id: string;
  title: string;
  changeType: ChangeType;
  summary: string;
  status: StudyStatus;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  targetGoLiveDate: string | null;
  sections: Section[];
  risks: Risk[];
}

export interface StudyFilters {
  search: string;
  status: StudyStatus | null;
  changeType: ChangeType | null;
  riskLevel: RiskLevel | null;
}

// Constants
export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  draft: 'Brouillon',
  in_review: 'En revue',
  risk_assessment: 'Évaluation risques',
  approval_in_progress: 'Approbation',
  approved: 'Approuvé',
  implementation: 'Implémentation',
  post_implementation_review: 'Revue post-impl.',
  closed: 'Clôturé',
  cancelled: 'Annulé',
};

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  not_started: 'Non démarré',
  in_progress: 'En cours',
  ready_for_review: 'Prêt pour revue',
  reviewed: 'Revu',
  approved: 'Approuvé',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Ouvert',
  mitigated: 'Atténué',
  accepted: 'Accepté',
  closed: 'Clôturé',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  safety: 'Sécurité',
  regulatory: 'Réglementaire',
  operational: 'Opérationnel',
  human_factors: 'Facteurs humains',
  training: 'Formation',
  it_data: 'IT/Data',
  supplier: 'Fournisseur',
  financial: 'Financier',
};

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  process: 'Processus',
  organizational: 'Organisationnel',
  tool_it: 'Outil/IT',
  scope_rating: 'Scope/Rating',
  outsourcing: 'Sous-traitance',
  facility_site: 'Site/Installation',
};

export const IMPACT_AREA_LABELS: Record<ImpactArea, string> = {
  continuing_airworthiness: 'Navigabilité continue',
  maintenance_execution: 'Exécution maintenance',
  sms: 'SMS',
  qms: 'QMS',
  airworthiness_records: 'Archives navigabilité',
  tools_calibration: 'Outillage & Étalonnage',
  flight_ops_interface: 'Interface Ops Vol',
  stores_logistics: 'Magasins/Logistique',
};

export const DEFAULT_SECTIONS = [
  { code: '0', title: 'Overview', fields: ['change_title', 'background_context', 'objectives', 'scope_in', 'scope_out'] },
  { code: '1', title: 'Project Team', fields: ['project_org_chart', 'roles_responsibilities', 'resource_plan'] },
  { code: '2', title: 'Planning', fields: ['milestones', 'deliverables', 'timeline', 'dependencies'] },
  { code: '3', title: 'Risk Assessment', fields: ['methodology', 'scoring_model', 'risk_register', 'mitigation_plan'] },
  { code: '4', title: 'Impact Analysis', fields: ['processes_impacted', 'manuals_procedures', 'tooling_it_data'] },
  { code: '5', title: 'Compliance Mapping', fields: ['regulatory_requirements', 'means_of_compliance', 'evidence_list'] },
  { code: '6', title: 'Implementation Plan', fields: ['deployment_strategy', 'cutover_plan', 'rollback_plan'] },
  { code: '7', title: 'Verification & Testing', fields: ['test_plan', 'test_cases', 'results_summary'] },
  { code: '8', title: 'Training & Competency', fields: ['training_needs', 'training_materials', 'competency_assessment'] },
  { code: '9', title: 'Documentation Updates', fields: ['document_list', 'revision_plan', 'effective_dates'] },
  { code: '10', title: 'Post-Implementation Review', fields: ['kpis_monitoring', 'lessons_learned', 'closure_statement'] },
  { code: '11', title: 'Annexes', fields: ['glossary', 'reference_documents', 'attachments_index'] },
];
