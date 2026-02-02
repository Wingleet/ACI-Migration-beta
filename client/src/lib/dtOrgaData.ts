/**
 * Données de l'organigramme DT (Direction Technique)
 */

export interface OrgNode {
  id: string;
  name: string;
  type: 'direction' | 'service' | 'unit' | 'role';
  personnel?: PersonnelInfo[];
  processes?: ProcessInfo[];
  children?: OrgNode[];
  color?: string;
}

export interface PersonnelInfo {
  name: string;
  role: string;
  email?: string;
}

export interface ProcessInfo {
  id: string;
  name: string;
  subModuleId?: string; // Lien vers le sous-module AMOS
}

export const DT_ORGA_DATA: OrgNode = {
  id: 'dt',
  name: 'Direction Technique',
  type: 'direction',
  color: '#6366f1',
  personnel: [
    { name: 'E. BOU', role: 'Directeur Technique (CAMO / AMO / LOG)' },
  ],
  children: [
    {
      id: 'bureau-technique',
      name: 'Bureau Technique',
      type: 'service',
      color: '#8b5cf6',
      personnel: [
        { name: 'P. REI', role: 'Responsable Bureau Technique' },
      ],
      children: [
        {
          id: 'engineering',
          name: 'Engineering',
          type: 'unit',
          color: '#a78bfa',
          personnel: [
            { name: 'F. HAR', role: 'Engineering' },
            { name: 'A. JAM', role: 'Engineering' },
            { name: 'L. CAV', role: 'Engineering' },
            { name: 'P. TIR', role: 'Engineering' },
            { name: 'F. THI', role: 'Engineering' },
          ],
          processes: [
            { id: 'p-01.01', name: 'Aircraft Definition', subModuleId: '01.01' },
            { id: 'p-01.02', name: 'Parts Definition', subModuleId: '01.02' },
            { id: 'p-01.03', name: 'Maintenance Program', subModuleId: '01.03' },
            { id: 'p-01.04', name: 'SB & AD Assessment', subModuleId: '01.04' },
            { id: 'p-01.05', name: 'Configuration Management', subModuleId: '01.05' },
            { id: 'p-01.06', name: 'MEL Administration', subModuleId: '01.06' },
            { id: 'p-01.07', name: 'Reliability', subModuleId: '01.07' },
            { id: 'p-01.08', name: 'Weight & Balance', subModuleId: '01.08' },
            { id: 'p-01.09', name: 'Powerplants', subModuleId: '01.09' },
          ],
        },
        {
          id: 'planning',
          name: 'Planning',
          type: 'unit',
          color: '#a78bfa',
          personnel: [
            { name: 'J. BER', role: 'Planning' },
            { name: 'D. HIC', role: 'Planning' },
            { name: 'J. PHA', role: 'Planning' },
          ],
          processes: [
            { id: 'p-03.01', name: 'Planning', subModuleId: '03.01' },
            { id: 'p-03.02', name: 'Work Package Generation', subModuleId: '03.02' },
            { id: 'p-03.05', name: 'Long Term Planning', subModuleId: '03.05' },
          ],
        },
        {
          id: 'docs',
          name: 'DOCS',
          type: 'unit',
          color: '#a78bfa',
          personnel: [
            { name: 'Y. DEV', role: 'Documentation' },
          ],
          processes: [
            { id: 'p-02.05', name: 'Technical Library', subModuleId: '02.05' },
            { id: 'p-02.08', name: 'Digital Records', subModuleId: '02.08' },
          ],
        },
      ],
    },
    {
      id: 'production',
      name: 'Production',
      type: 'service',
      color: '#ec4899',
      personnel: [
        { name: 'J. DES', role: 'Responsable Production' },
      ],
      processes: [
        { id: 'p-07.01', name: 'Shift Planning', subModuleId: '07.01' },
        { id: 'p-07.02', name: 'Hangar & Resources', subModuleId: '07.02' },
        { id: 'p-07.04', name: 'Production Plan Preparation', subModuleId: '07.04' },
        { id: 'p-07.05', name: 'Resource & Staff Allocation', subModuleId: '07.05' },
      ],
      children: [
        {
          id: 'shop-cabin',
          name: 'Shop / Cabin',
          type: 'unit',
          color: '#f472b6',
          personnel: [
            { name: 'N. MAL', role: 'Shop Cabin' },
          ],
          processes: [
            { id: 'p-11.01', name: 'Capability List', subModuleId: '11.01' },
            { id: 'p-11.02', name: 'Shop Card Templates', subModuleId: '11.02' },
            { id: 'p-11.03', name: 'Shop Planner', subModuleId: '11.03' },
            { id: 'p-11.04', name: 'Component Maintenance', subModuleId: '11.04' },
            { id: 'p-11.05', name: 'Closed Loop Repair', subModuleId: '11.05' },
            { id: 'p-11.06', name: 'Component Release', subModuleId: '11.06' },
          ],
        },
        {
          id: 'preparation-work',
          name: 'Preparation Work',
          type: 'unit',
          color: '#f472b6',
          personnel: [
            { name: 'D. BAR', role: 'Preparation Work' },
          ],
          processes: [
            { id: 'p-07.03', name: 'Work Templates', subModuleId: '07.03' },
          ],
        },
        {
          id: 'maintenance',
          name: 'Maintenance',
          type: 'unit',
          color: '#f472b6',
          personnel: [
            { name: 'C. ACK', role: 'Maintenance' },
            { name: 'L. ARN', role: 'Maintenance' },
            { name: 'J. BAC', role: 'Maintenance' },
            { name: 'P. DOR', role: 'Maintenance' },
            { name: 'D. HIG', role: 'Maintenance' },
            { name: 'Y. HNI', role: 'Maintenance' },
            { name: 'R. IEK', role: 'Maintenance' },
            { name: 'J. JEW', role: 'Maintenance' },
            { name: 'I. KAH', role: 'Maintenance' },
            { name: 'L. KEL', role: 'Maintenance' },
            { name: 'M. NGA', role: 'Maintenance' },
            { name: 'G. ROS', role: 'Maintenance' },
            { name: 'R. SIN', role: 'Maintenance' },
            { name: 'A. TID', role: 'Maintenance' },
            { name: 'D. TRO', role: 'Maintenance' },
            { name: 'J. WAH', role: 'Maintenance' },
            { name: 'D. WAI', role: 'Maintenance' },
            { name: 'E. WAM', role: 'Maintenance' },
            { name: 'G. XUM', role: 'Maintenance' },
            { name: 'J. YON', role: 'Maintenance' },
          ],
          processes: [
            { id: 'p-08.01', name: 'Maintenance Check Control', subModuleId: '08.01' },
            { id: 'p-08.02', name: 'Performing Maintenance', subModuleId: '08.02' },
            { id: 'p-08.03', name: 'Deferral Handling', subModuleId: '08.03' },
            { id: 'p-08.04', name: 'Parts Removal & Installation', subModuleId: '08.04' },
            { id: 'p-08.05', name: 'Release to Service', subModuleId: '08.05' },
          ],
        },
      ],
    },
    {
      id: 'logistique',
      name: 'Logistique',
      type: 'service',
      color: '#14b8a6',
      personnel: [
        { name: 'V. TAI', role: 'Responsable Logistique' },
      ],
      children: [
        {
          id: 'store',
          name: 'Store',
          type: 'unit',
          color: '#2dd4bf',
          personnel: [
            { name: 'M. HAU', role: 'Store' },
            { name: 'S. APE', role: 'Store' },
            { name: 'J. JON', role: 'Store' },
            { name: 'F. MOT', role: 'Store' },
            { name: 'G. QUE', role: 'Store' },
            { name: 'A. VAZ', role: 'Store' },
          ],
          processes: [
            { id: 'p-02.04', name: 'Aircraft & Component Counters', subModuleId: '02.04' },
          ],
        },
        {
          id: 'purchasing',
          name: 'Purchasing',
          type: 'unit',
          color: '#2dd4bf',
          personnel: [
            { name: 'L. DO', role: 'Purchasing' },
            { name: 'D. LUE', role: 'Purchasing' },
            { name: 'R. TUF', role: 'Purchasing' },
            { name: 'C. WAL', role: 'Purchasing' },
          ],
          processes: [
            { id: 'p-09.01', name: 'Material Planning', subModuleId: '09.01' },
            { id: 'p-09.02', name: 'Supplier Management', subModuleId: '09.02' },
            { id: 'p-09.03', name: 'Ordering', subModuleId: '09.03' },
          ],
        },
        {
          id: 'import-export',
          name: 'Import / Export',
          type: 'unit',
          color: '#2dd4bf',
          personnel: [
            { name: 'N. BES', role: 'Import Export' },
          ],
          processes: [
            { id: 'p-09.04', name: 'Repair & Exchanges', subModuleId: '09.04' },
            { id: 'p-09.07', name: 'Outstations & MRO', subModuleId: '09.07' },
          ],
        },
        {
          id: 'contrats',
          name: 'Contrats',
          type: 'unit',
          color: '#2dd4bf',
          personnel: [
            { name: 'L. PET', role: 'Contrats' },
          ],
          processes: [
            { id: 'p-09.05', name: 'Warranty', subModuleId: '09.05' },
            { id: 'p-09.06', name: 'Pooling & Consignment', subModuleId: '09.06' },
          ],
        },
      ],
    },
    {
      id: 'mcc',
      name: 'MCC',
      type: 'service',
      color: '#06b6d4',
      personnel: [
        { name: 'O. NYI', role: 'MCC' },
        { name: 'R. DEN', role: 'MCC' },
        { name: 'L. DEN', role: 'MCC' },
        { name: 'S. DUB', role: 'MCC' },
        { name: 'J. YON', role: 'MCC' },
        { name: 'J. PAK', role: 'MCC' },
      ],
      processes: [
        { id: 'p-06.01', name: 'Fleet Status Monitoring', subModuleId: '06.01' },
        { id: 'p-06.02', name: 'Delays & Event Tracking', subModuleId: '06.02' },
        { id: 'p-06.03', name: 'Line Maintenance Oversight', subModuleId: '06.03' },
        { id: 'p-06.04', name: 'Recurrent Defects', subModuleId: '06.04' },
        { id: 'p-06.05', name: 'Aircraft Incidents', subModuleId: '06.05' },
      ],
    },
    {
      id: 'compliance-safety',
      name: 'Compliance & Safety',
      type: 'service',
      color: '#f59e0b',
      personnel: [
        { name: 'E. TAV', role: 'Compliance & Safety' },
      ],
      processes: [
        { id: 'p-04.01', name: 'Company Organisation', subModuleId: '04.01' },
        { id: 'p-04.02', name: 'Organisation Approval', subModuleId: '04.02' },
        { id: 'p-04.03', name: 'Training and Qualifications', subModuleId: '04.03' },
        { id: 'p-04.04', name: 'Approval Control', subModuleId: '04.04' },
        { id: 'p-04.05', name: 'Quality Auditing', subModuleId: '04.05' },
      ],
    },
    {
      id: 'admin',
      name: 'Admin',
      type: 'service',
      color: '#64748b',
      personnel: [
        { name: 'I. RAM', role: 'Admin' },
      ],
      processes: [
        { id: 'p-12.01', name: 'Financial Accounting', subModuleId: '12.01' },
        { id: 'p-12.02', name: 'Invoice Checking', subModuleId: '12.02' },
        { id: 'p-12.03', name: 'Fixed Assets & Depreciation', subModuleId: '12.03' },
        { id: 'p-00.01', name: 'AMOS Application Configuration', subModuleId: '00.01' },
        { id: 'p-00.02', name: 'AMOS Users and Roles', subModuleId: '00.02' },
      ],
    },
  ],
};

// Interface pour les services/unités avec leurs subModuleIds
export interface ServiceUnit {
  id: string;
  name: string;
  type: 'service' | 'unit';
  color: string;
  parentName?: string;
  subModuleIds: string[];
}

// Fonction pour extraire tous les services et unités avec leurs subModuleIds
export const getAllServicesAndUnits = (): ServiceUnit[] => {
  const result: ServiceUnit[] = [];
  
  const extractFromNode = (node: OrgNode, parentName?: string) => {
    if (node.type === 'service' || node.type === 'unit') {
      const subModuleIds = (node.processes || [])
        .map(p => p.subModuleId)
        .filter((id): id is string => !!id);
      
      result.push({
        id: node.id,
        name: node.name,
        type: node.type,
        color: node.color || '#6366f1',
        parentName,
        subModuleIds,
      });
    }
    
    if (node.children) {
      const newParent = node.type === 'service' ? node.name : parentName;
      node.children.forEach(child => extractFromNode(child, newParent));
    }
  };
  
  extractFromNode(DT_ORGA_DATA);
  return result;
};

// Fonction pour obtenir les subModuleIds d'un service/unité donné
export const getSubModuleIdsByServiceId = (serviceId: string): string[] => {
  const services = getAllServicesAndUnits();
  const service = services.find(s => s.id === serviceId);
  return service?.subModuleIds || [];
};

// Fonction pour obtenir le nom du service/unité qui contient un subModuleId
export const getServiceBySubModuleId = (subModuleId: string): ServiceUnit | undefined => {
  const services = getAllServicesAndUnits();
  return services.find(s => s.subModuleIds.includes(subModuleId));
};
