import { Module, SubModule, GapRecord, Department } from '@/types/process';

// IDs des sous-modules NON sélectionnés (gris)
export const UNSELECTED_SUBMODULES = new Set([
  '02.03', // Multi-Operator A/C Transfer
  '04.05', // Quality Auditing
  '05.01', // Aircraft Acceptance
  '05.02', // Pilot Reports (PIREPS)
  '05.03', // Cabin Defects
  '05.04', // Flight Closing
  '05.05', // Flight Simulators
  '07.02', // Hangar & Resources
  '07.03', // Work Templates
  '07.04', // Production Plan Preparation
  '07.06', // Customer MRO Work Packages
  '08.01', // Maintenance Check Control
  '12.04', // Commercial Pricing & Billing
  '12.05', // Customer Quotations
  '12.07', // Financial Multi-Entity
]);

// Default empty gap record
const createEmptyGapRecord = (isUnselected: boolean = false): GapRecord => ({
  asIs: '',
  toBe: '',
  dataScope: '',
  verdict: isUnselected ? 'na' : null,
  gapType: null,
  decision: null,
  actions: [],
  dependencies: [],
  risks: [],
  owner: '',
  contributors: [],
  attachments: [],
  auditTrail: [],
  comments: [],
  tags: [],
  aciProcess: '',
  amosProcess: '',
  aciFlowchart: undefined,
});

// Helper to create submodule
const createSubModule = (id: string, name: string): SubModule => {
  const isUnselected = UNSELECTED_SUBMODULES.has(id);
  return {
    id,
    name,
    status: 'not_started',
    criticality: 'medium',
    isSelected: !isUnselected,
    gapRecord: createEmptyGapRecord(isUnselected),
  };
};

// Departments definition
export const DEPARTMENTS: Department[] = [
  {
    color: 'red',
    name: 'Airworthiness & Engineering',
    modules: ['01', '02', '03', '04'],
  },
  {
    color: 'blue',
    name: 'Ops & Maintenance Execution',
    modules: ['05', '06', '07', '08'],
  },
  {
    color: 'green',
    name: 'Supply Chain / Finance / Shops',
    modules: ['09', '10', '11', '12'],
  },
  {
    color: 'gray',
    name: 'Core / Transverse / ACC',
    modules: ['00'],
  },
];

// Initial modules catalog
export const INITIAL_MODULES: Module[] = [
  {
    id: '00',
    name: 'ACC',
    departmentColor: 'gray',
    subModules: [
      createSubModule('00.01', 'Application Configuration'),
      createSubModule('00.02', 'Users & Roles'),
      createSubModule('00.03', 'Technical Assistance'),
      createSubModule('00.04', 'Scheduler Tasks'),
      createSubModule('00.05', 'Interfaces & AMOScentral'),
      createSubModule('00.06', 'Data & Reports'),
      createSubModule('00.07', 'eSignature & Certificates'),
      createSubModule('00.08', 'Support Tool'),
      createSubModule('00.09', 'AMOS Release Change'),
    ],
  },
  {
    id: '01',
    name: 'Fleet Engineering',
    departmentColor: 'red',
    subModules: [
      createSubModule('01.01', 'Aircraft Definition'),
      createSubModule('01.02', 'Parts Definition'),
      createSubModule('01.03', 'Maintenance Program'),
      createSubModule('01.04', 'SB & AD Assessment'),
      createSubModule('01.05', 'Configuration Management'),
      createSubModule('01.06', 'MEL Administration'),
      createSubModule('01.07', 'Reliability'),
      createSubModule('01.08', 'Weight & Balance'),
      createSubModule('01.09', 'Powerplants (Engine/APU)'),
    ],
  },
  {
    id: '02',
    name: 'Technical Services',
    departmentColor: 'red',
    subModules: [
      createSubModule('02.01', 'Aircraft Phase-in'),
      createSubModule('02.02', 'Aircraft Phase-out'),
      createSubModule('02.03', 'Multi-Operator A/C Transfer'),
      createSubModule('02.04', 'Aircraft & Comp. Counters'),
      createSubModule('02.05', 'Technical Library'),
      createSubModule('02.06', 'Requirements Work Scoping'),
      createSubModule('02.07', 'Structural Damages'),
      createSubModule('02.08', 'Digital Records'),
      createSubModule('02.09', 'Airworthiness Certificate'),
    ],
  },
  {
    id: '03',
    name: 'Fleet Planning',
    departmentColor: 'red',
    subModules: [
      createSubModule('03.01', 'Planning'),
      createSubModule('03.02', 'Work Package Generation'),
      createSubModule('03.03', 'Reporting Back'),
      createSubModule('03.04', 'Modification Campaigns'),
      createSubModule('03.05', 'Long-Term Planning'),
    ],
  },
  {
    id: '04',
    name: 'Quality Assurance',
    departmentColor: 'red',
    subModules: [
      createSubModule('04.01', 'Company Organization'),
      createSubModule('04.02', 'Maintenance Agreements'),
      createSubModule('04.03', 'Training & Qualifications'),
      createSubModule('04.04', 'Approval Control'),
      createSubModule('04.05', 'Quality Auditing'),
    ],
  },
  {
    id: '05',
    name: 'Flight Ops (CAMO/SETL)',
    departmentColor: 'blue',
    subModules: [
      createSubModule('05.01', 'Aircraft Acceptance'),
      createSubModule('05.02', 'Pilot Reports (PIREPS)'),
      createSubModule('05.03', 'Cabin Defects'),
      createSubModule('05.04', 'Flight Closing'),
      createSubModule('05.05', 'Flight Simulators'),
    ],
  },
  {
    id: '06',
    name: 'MCC',
    departmentColor: 'blue',
    subModules: [
      createSubModule('06.01', 'Fleet Status Monitoring'),
      createSubModule('06.02', 'Delays & Event Tracking'),
      createSubModule('06.03', 'Line Maintenance Oversight'),
      createSubModule('06.04', 'Recurrent Defects'),
      createSubModule('06.05', 'Aircraft Incidents'),
    ],
  },
  {
    id: '07',
    name: 'Production Planning',
    departmentColor: 'blue',
    subModules: [
      createSubModule('07.01', 'Shift Planning'),
      createSubModule('07.02', 'Hangar & Resources'),
      createSubModule('07.03', 'Work Templates'),
      createSubModule('07.04', 'Production Plan Preparation'),
      createSubModule('07.05', 'Resource & Staff Allocation'),
      createSubModule('07.06', 'Customer MRO Work Packages'),
    ],
  },
  {
    id: '08',
    name: 'Aircraft Maintenance',
    departmentColor: 'blue',
    subModules: [
      createSubModule('08.01', 'Maintenance Check Control'),
      createSubModule('08.02', 'Performing Maintenance'),
      createSubModule('08.03', 'Deferral Handling'),
      createSubModule('08.04', 'Parts Removal & Installation'),
      createSubModule('08.05', 'Release to Service'),
    ],
  },
  {
    id: '09',
    name: 'Procurement',
    departmentColor: 'green',
    subModules: [
      createSubModule('09.01', 'Material Planning'),
      createSubModule('09.02', 'Supplier Management'),
      createSubModule('09.03', 'Ordering'),
      createSubModule('09.04', 'Repair & Exchanges'),
      createSubModule('09.05', 'Warranty'),
      createSubModule('09.06', 'Pooling & Consignment'),
      createSubModule('09.07', 'Outstations & MRO\'s'),
    ],
  },
  {
    id: '10',
    name: 'Stores & Logistics',
    departmentColor: 'green',
    subModules: [
      createSubModule('10.01', 'Logistics'),
      createSubModule('10.02', 'Goods Receiving & Inspection'),
      createSubModule('10.03', 'Major Assemblies'),
      createSubModule('10.04', 'Part Request Fulfillment'),
      createSubModule('10.05', 'Tools'),
      createSubModule('10.06', 'Inventory & Shelf-Life Control'),
      createSubModule('10.07', 'Customer Material'),
    ],
  },
  {
    id: '11',
    name: 'Component Shops',
    departmentColor: 'green',
    subModules: [
      createSubModule('11.01', 'Capability List'),
      createSubModule('11.02', 'Shop Card Templates'),
      createSubModule('11.03', 'Shop Planner'),
      createSubModule('11.04', 'Component Maintenance'),
      createSubModule('11.05', 'Closed-Loop Repair'),
      createSubModule('11.06', 'Component Release'),
    ],
  },
  {
    id: '12',
    name: 'Finance & Commercial',
    departmentColor: 'green',
    subModules: [
      createSubModule('12.01', 'Financial Accounting'),
      createSubModule('12.02', 'Invoice Checking'),
      createSubModule('12.03', 'Fixed Assets Depreciation'),
      createSubModule('12.04', 'Commercial Pricing & Billing'),
      createSubModule('12.05', 'Customer Quotations'),
      createSubModule('12.06', 'Budgeting & Cost Controlling'),
      createSubModule('12.07', 'Financial Multi-Entity'),
    ],
  },
];

// Sort modules by ID
export const getSortedModules = (modules: Module[]): Module[] => {
  return [...modules].sort((a, b) => a.id.localeCompare(b.id));
};
