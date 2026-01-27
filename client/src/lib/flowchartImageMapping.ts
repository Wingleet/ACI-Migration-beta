/**
 * Mapping des sous-modules vers les fichiers images des flowcharts AMOS
 * Ce mapping permet de faire correspondre les IDs des sous-modules aux noms de fichiers réels
 */

// Mapping ACI: subModule.id -> nom du fichier image ACI (sans le chemin de base)
// Les fichiers sont dans /Flowchart/ avec le format "{id} {name} ACI.png"
export const ACI_FLOWCHART_IMAGE_MAPPING: Record<string, string> = {
  // Module 01 - Fleet Engineering
  '01.01': '01.01Aircraft Definition ACI.png',
  '01.02': '01.02 Parts Definition ACI.png',
  '01.03': '01.03 Maintenance Program ACI.png',
  '01.04': '01.04 SB & AD Assessment ACI.png',
  '01.05': '01.05 Configuration Management ACI.png',
  '01.06': '01.06 MEL Administration ACI.png',
  '01.07': '01.07 Reliability ACI.png',
  '01.08': '01.08 Weight & Balance ACI.png',
  '01.09': '01.09 Powerplants ACI.png',
  
  // Module 02 - Technical Services
  '02.01': '02.01 Aircraft Phase-in ACI.png',
  '02.02': '02.02 Aircraft Phase-out ACI.png',
  '02.03': '02.03 Multi Operator AC Transfer ACI.png',
  '02.04': '02.04 Aircraft & Component Counters ACI.png',
  '02.05': '02.05 Technical Library ACI.png',
  '02.06': '02.06 Requirement Work Scoping ACI.png',
  '02.07': '02.07 Structural Damages ACI.png',
  '02.08': '02.08 Digital Records ACI.png',
  '02.09': '02.09 Airworthiness Certificate ACI.png',
  
  // Module 03 - Fleet Planning
  '03.01': '03.01 Planning ACI.png',
  '03.02': '03.02 Work Package Generation ACI.png',
  '03.03': '03.03 Reporting Back ACI.png',
  '03.04': '03.04 Modification Campaigns ACI.png',
  '03.05': '03.05 Long Term Planning ACI.png',
  
  // Module 04 - Quality Assurance
  '04.01': '04.01 Company Organisation ACI.png',
  '04.02': '04.02 Organisation Approval ACI.png',
  '04.03': '04.03 Training and Qualifications ACI.png',
  '04.04': '04.04 Approval Control ACI.png',
  '04.05': '04.05 Quality Auditing ACI.png',
  
  // Module 06 - MCC
  '06.01': '06.01 Fleet Status Monitoring ACI.png',
  '06.02': '06.02 Delays & Event Tracking ACI.png',
  '06.03': '06.03 Line Maintenance Oversight ACI.png',
  '06.04': '06.04 Recurrent Defects ACI.png',
  '06.05': '06.05 Aircraft Incidents ACI.png',
  
  // Module 07 - Production Planning
  '07.01': '07.01 Shift Planning ACI.png',
  '07.02': '07.02 Hangar & Resources ACI.png',
  '07.03': '07.03 Work Templates ACI.png',
  '07.04': '07.04 Production Plan Preparation ACI.png',
  '07.05': '07.05 Resource & Staff Allocation ACI.png',
  '07.06': '07.06 Customer MRO Work Packages ACI.png',
  
  // Module 08 - Aircraft Maintenance
  '08.01': '08.01 Maintenance Check Control ACI.png',
  '08.02': '08.02 Performing Maintenance ACI.png',
  '08.03': '08.03 Deferral Handling ACI.png',
  '08.04': '08.04 Parts Removal & Installation ACI.png',
  '08.05': '08.05 Release to Service ACI.png',
  
  // Module 09 - Procurement
  '09.01': '09.01 Material Planning ACI.png',
  '09.02': '09.02 Supplier Management ACI.png',
  '09.03': '09.03 Ordering ACI.png',
  '09.04': '09.04 Repair & Exchanges ACI.png',
  '09.05': '09.05 Warranty ACI.png',
  '09.06': '09.06 Pooling & Consignment ACI.png',
  '09.07': '09.07 Outstations & MRO ACI.png',
  
  // Module 11 - Component Shops
  '11.01': '11.01 Capability List ACI.png',
  '11.02': '11.02 Shop Card Templates ACI.png',
  '11.03': '11.03 Shop Planner ACI.png',
  '11.04': '11.04 Component Maintenance ACI.png',
  '11.05': '11.05 Closed Loop Repair ACI.png',
  '11.06': '11.06 Component Release ACI.png',
  
  // Module 12 - Finance & Commercial
  '12.01': '12.01 Financial Accounting ACI.png',
  '12.02': '12.02 Invoice Checking ACI.png',
  '12.03': '12.03 Fixed Assets & Depreciation ACI.png',
  '12.04': '12.04 Commercial Pricing & Billing ACI.png',
  '12.05': '12.05 Customer Quotations ACI.png',
  '12.06': '12.06 Budgeting & Cost Controlling ACI.png',
  '12.07': '12.07 Financial Multi Entity ACI.png',
  
  // Module 00 - ACC (si applicable)
  '00.01': '00.01 AMOS Application Configuration ACI.png',
  '00.02': '00.02 AMOS Users and Roles ACI.png',
  '00.03': '00.03 Technical Assistance ACI.png',
  '00.04': '00.04 Scheduler Task ACI.png',
  '00.05': '00.05 Interfaces AMOScentral ACI.png',
  '00.06': '00.06 Data and Reports ACI.png',
  '00.08': '00.08 Support Tool ACI.png',
  '00.09': '00.09 AMOS Release Change ACI.png',
};

/**
 * Récupère le chemin de l'image ACI pour un sous-module donné
 * @param subModuleId - L'ID du sous-module (ex: '01.01')
 * @returns Le chemin de l'image ou null si non trouvé
 */
export const getAciFlowchartImage = (subModuleId: string): string | null => {
  const fileName = ACI_FLOWCHART_IMAGE_MAPPING[subModuleId];
  if (!fileName) {
    return null;
  }
  return `/Flowchart/${fileName}`;
};

// Mapping AMOS: subModule.id -> nom du fichier image (sans le chemin de base)
export const FLOWCHART_IMAGE_MAPPING: Record<string, string | string[]> = {
  // Module 00 - ACC
  '00.01': '00.01_AMOS_Application_Configuration-1.png',
  '00.02': '00.02_AMOS_Users_and_Roles-1.png',
  '00.03': '00.03_Technical Assistance-1.png',
  '00.04': '00.04_Scheduler_Task-1.png',
  '00.05': '00.05_Interfaces_AMOScentral-1.png',
  '00.06': '00.06 Data and Reports-1.png',
  // '00.07': pas d'image disponible (eSignature & Certificates)
  '00.08': '00.08 Support Tool-1.png',
  '00.09': '00.09_AMOS_Release_Change-1.png',
  
  // Module 01 - Fleet Engineering
  '01.01': '01.01_Aircraft Definition.png',
  '01.02': '01.02_Parts Definition.png',
  '01.03': '01.03_Maintenance Program.png',
  '01.04': '01.04_SB & AD Assessment.png',
  '01.05': '01.05_Configuration Management.png',
  '01.06': '01.06_MEL Administration.png',
  '01.07': '01.07_Reliability.png',
  '01.08': '01.08_Weight & Balance.png',
  '01.09': '01.09_Powerplants (Engine/APU).png',
  
  // Module 02 - Technical Services
  '02.01': '02.01_Aircraft Phase-in-1.png',
  '02.02': '02.02_Aircraft Phase-out-1.png',
  '02.03': '02.03 Multi Operator AC Transfer-1.png',
  '02.04': '02.04 Aircraft & Component Counters-1.png',
  '02.05': '02.05 Technical_Library-1.png',
  '02.06': '02.06_Requirement Work Scoping-1.png',
  '02.07': '02.07 Structural Damages-1.png',
  '02.08': '02.08 Digital Records-1.png',
  '02.09': '02.09 Airworthiness Certificate-1.png',
  
  // Module 03 - Fleet Planning
  '03.01': '03.01_Planning-1.png',
  '03.02': '03.02_Work_Package_Generation-1.png',
  '03.03': '03.03 Reporting Back-1.png',
  '03.04': '03.04_Modification_Campaigns-1.png',
  '03.05': '03.05 Long Term Planning-1.png',
  
  // Module 04 - Quality Assurance
  '04.01': '04.01 Company Organisation-1.png',
  '04.02': '04.02 Organisation Approval-1.png',
  '04.03': '04.03 Training and Qualifications-1.png',
  '04.04': ['04.04 Approval Control-1.png', '04.04 Approval Control-2.png'],
  '04.05': '04.05 Quality Auditing-1.png',
  
  // Module 06 - MCC
  '06.01': '06.01 - Fleet Status Monitoring-1.png',
  '06.02': '06.02 - Delays & Event Tracking-1.png',
  '06.03': '06.03 - Line Maintenance Oversight-1.png',
  '06.04': '06.04 - Recurrent Defects-1.png',
  '06.05': '06.05 - Aircraft Incidents-1.png',
  
  // Module 07 - Production Planning
  '07.01': '07.01 - Shift Planning-1.png',
  '07.02': '07.02 - Hangar & Resources-1.png',
  '07.03': '07.03 - Work Templates-1.png',
  '07.04': '07.04 - Production Plan Preparation-1.png',
  '07.05': '07.05 - Resource & Staff Allocation-1.png',
  '07.06': '07.06 - Customer MRO Work Packages-1.png',
  
  // Module 08 - Aircraft Maintenance
  '08.01': '08.01 - Maintenance Check Control-1.png',
  '08.02': '08.02 - Performing Maintenance-1.png',
  '08.03': '08.03 - Deferral Handling-1.png',
  '08.04': '08.04 - Parts Removal & Installation-1.png',
  '08.05': '08.05 - Release to Service-1.png',
  
  // Module 09 - Procurement
  '09.01': '09.01_Material_Planning-1.png',
  '09.02': '09.02_Supplier_Management-1.png',
  '09.03': ['09.03_Ordering-1.png', '09.03_Ordering-2.png', '09.03_Ordering-3.png', '09.03_Ordering-4.png'],
  '09.04': '09.04_Repair_&_Exchanges-1.png',
  '09.05': '09.05_Warranty-1.png',
  '09.06': ['09.06_Pooling & Consignment-1.png', '09.06_Pooling & Consignment-2.png', '09.06_Pooling & Consignment-3.png', '09.06_Pooling & Consignment-4.png'],
  '09.07': '09.07_Outstations & MRO-1.png',
  
  // Module 11 - Component Shops
  '11.01': '11.01_Capability_List-1.png',
  '11.02': '11.02_Shop_Card_Templates-1.png',
  '11.03': '11.03_Shop_Planner-1.png',
  '11.04': '11.04_Component_Maintenance-1.png',
  '11.05': '11.05_Closed_Loop_Repair-1.png',
  '11.06': '11.06_Component_Release-1.png',
  
  // Module 12 - Finance & Commercial
  '12.01': '12.01_Financial_Accounting-1.png',
  '12.02': ['12.02_Invoice Checking-1.png', '12.02_Invoice Checking-2.png'],
  '12.03': '12.03_Fixed Assets & Depreciation-1.png',
  '12.04': '12.04_Commercial Pricing & Billing-1.png',
  '12.05': ['12.05_Customer Quotations-1.png', '12.05_Customer Quotations-2.png'],
  '12.06': '12.06_Budgeting & Cost Controlling-1.png',
  '12.07': ['12.07_Financial_Multi_Entity-1.png', '12.07_Financial_Multi_Entity-2.png', '12.07_Financial_Multi_Entity-3.png'],
};

/**
 * Récupère le(s) chemin(s) d'image(s) pour un sous-module donné
 * @param subModuleId - L'ID du sous-module (ex: '02.01')
 * @returns Un tableau de chemins d'images ou un tableau vide si non trouvé
 */
export const getFlowchartImages = (subModuleId: string): string[] => {
  const mapping = FLOWCHART_IMAGE_MAPPING[subModuleId];
  if (!mapping) {
    return [];
  }
  
  const basePath = '/images/flowchart/';
  
  if (Array.isArray(mapping)) {
    return mapping.map(fileName => basePath + fileName);
  }
  
  return [basePath + mapping];
};

/**
 * Récupère le premier chemin d'image pour un sous-module (pour compatibilité)
 * @param subModuleId - L'ID du sous-module (ex: '02.01')
 * @returns Le chemin de la première image ou null si non trouvé
 */
export const getFlowchartImagePath = (subModuleId: string): string | null => {
  const images = getFlowchartImages(subModuleId);
  return images.length > 0 ? images[0] : null;
};

/**
 * Vérifie si un sous-module a plusieurs images de flowchart
 * @param subModuleId - L'ID du sous-module
 * @returns true si le sous-module a plusieurs images
 */
export const hasMultipleFlowchartImages = (subModuleId: string): boolean => {
  const mapping = FLOWCHART_IMAGE_MAPPING[subModuleId];
  return Array.isArray(mapping) && mapping.length > 1;
};
