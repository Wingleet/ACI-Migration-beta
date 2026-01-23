// Department colors
export type DepartmentColor = 'red' | 'blue' | 'green' | 'gray';

// Analysis status
export type AnalysisStatus = 'not_started' | 'in_progress' | 'done';

// Verdict
export type Verdict = 'fit' | 'gap' | 'na' | null;

// Criticality
export type Criticality = 'low' | 'medium' | 'high';

// Gap type
export type GapType = 
  | 'process' 
  | 'data' 
  | 'interface' 
  | 'reporting' 
  | 'security_roles' 
  | 'regulatory' 
  | 'other';

// Decision type
export type DecisionType = 
  | 'adopt_standard' 
  | 'configure' 
  | 'custom' 
  | 'develop' 
  | 'retire' 
  | null;

// Action status
export type ActionStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

// Action item
export interface Action {
  id: string;
  description: string;
  status: ActionStatus;
  owner?: string;
  dueDate?: string;
  externalLink?: string;
}

// Risk item
export interface Risk {
  id: string;
  description: string;
  criticality: Criticality;
  mitigation?: string;
}

// Dependency
export interface Dependency {
  subModuleId: string;
  description?: string;
}

// Audit entry
export interface AuditEntry {
  timestamp: string;
  user: string;
  summary: string;
}

// Comment
export interface Comment {
  id: string;
  user: string;
  timestamp: string;
  content: string;
}

// Gap Analysis record
export interface GapRecord {
  asIs: string;
  toBe: string;
  dataScope: string;
  verdict: Verdict;
  gapType: GapType | null;
  decision: DecisionType;
  actions: Action[];
  dependencies: Dependency[];
  risks: Risk[];
  owner: string;
  contributors: string[];
  decisionDate?: string;
  dueDate?: string;
  closureDate?: string;
  attachments: string[];
  auditTrail: AuditEntry[];
  comments: Comment[];
  tags: string[];
  // Process comparison
  aciProcess: string;
  amosProcess: string;
  // ACI Flowchart data (stored as JSON string)
  aciFlowchart?: string;
}

// Sub-module
export interface SubModule {
  id: string;
  name: string;
  status: AnalysisStatus;
  criticality: Criticality;
  isSelected: boolean; // true = vert (sélectionné), false = gris (non sélectionné)
  gapRecord: GapRecord;
}

// Module (top-level)
export interface Module {
  id: string;
  name: string;
  departmentColor: DepartmentColor;
  subModules: SubModule[];
}

// Department info
export interface Department {
  color: DepartmentColor;
  name: string;
  modules: string[];
}

// Filter state
export interface ProcessFilters {
  departmentColor: DepartmentColor | null;
  moduleId: string | null;
  status: AnalysisStatus | null;
  verdict: Verdict | null;
  criticality: Criticality | null;
  owner: string | null;
  search: string;
  isSelected: boolean | null; // true = sélectionné, false = non sélectionné, null = tous
}

// KPIs
export interface ProcessKPIs {
  totalSubModules: number;
  analyzedCount: number;
  analyzedPercent: number;
  fitCount: number;
  gapCount: number;
  naCount: number;
  openDecisionsCount: number;
  highRisksCount: number;
}
