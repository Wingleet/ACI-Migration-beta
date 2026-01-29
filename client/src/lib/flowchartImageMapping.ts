/**
 * Mapping des sous-modules vers les fichiers images des flowcharts AMOS
 * Ce mapping permet de faire correspondre les IDs des sous-modules aux noms de fichiers réels
 */

// Mapping ACI Drawio: subModule.id -> nom du fichier .drawio (sans le chemin de base)
export const ACI_FLOWCHART_DRAWIO_MAPPING: Record<string, string> = {
  // Module 00 - ACC
  '00.01': '00.01_AMOS_Application_Configuration.drawio',
  '00.02': '00.02_AMOS_Users_and_Roles.drawio',
  '00.03': '00.03_Technical Assistance.drawio',
  '00.04': '00.04_Scheduler_Task.drawio',
  '00.05': '00.05_Interfaces_AMOScentral.drawio',
  '00.06': '00.06 Data and Reports.drawio',
  '00.07': '00.07_eSignature & Certificates.drawio',
  '00.08': '00.08 Support Tool.drawio',
  '00.09': '00.09_AMOS_Release_Change.drawio',
  
  // Module 01 - Fleet Engineering
  '01.01': '01.01Aircraft Definition.drawio',
  '01.02': '01.02 Parts Definition.drawio',
  '01.03': '01.03 Maintenance Program.drawio',
  '01.04': '01.04 SB & AD Assessment.drawio',
  '01.05': '01.05 Configuration Management.drawio',
  '01.06': '01.06 MEL Administration.drawio',
  '01.07': '01.07 Reliability .drawio',
  '01.08': '01.08 Weight & Balance.drawio',
  '01.09': '01.09 Powerplants.drawio',
  
  // Module 02 - Technical Services
  '02.01': '02.01 Aircraft Phase-in.drawio',
  '02.02': '02.02_Aircraft Phase-out.drawio',
  '02.03': '02.03 Multi-Operator AC Transfer.drawio',
  '02.04': '02.04 Aircraft & Component counters.drawio',
  '02.05': '02.05 Technical Library.drawio',
  '02.06': '02.06 Requirement Work Scoping.drawio',
  '02.07': '02.07 Structural Damages.drawio',
  '02.08': '02.08 Digital Records.drawio',
  '02.09': '02.09 Airworthiness Certificate.drawio',
  
  // Module 03 - Fleet Planning
  '03.01': '03.01 Planning.drawio',
  '03.02': '03.02 Work Package Generation.drawio',
  '03.03': '03.03 Reporting Back.drawio',
  '03.04': '03.04 Modification Campaigns.drawio',
  '03.05': '03.05 Long Term Planning.drawio',
  
  // Module 04 - Quality Assurance
  '04.01': '04.01 Company Organisation.drawio',
  '04.03': '04.03 Training and Qualifications.drawio',
  '04.04': '04.04 Approval Control.drawio',
  '04.05': '04.05 Quality Auditing.drawio',
  
  // Module 06 - MCC
  '06.01': '06.01 - Fleet Status Monitoring.vsdx.drawio',
  '06.02': '06.02 - Delays & Event Tracking.drawio',
  '06.03': '06.03 - Line Maintenance Oversight.vsdx.drawio',
  '06.04': '06.04 - Recurrent Defects.drawio',
  '06.05': '06.05 - Aircraft Incidents.drawio',
  
  // Module 07 - Production Planning
  '07.01': '07.01 - Shift Planning.drawio',
  '07.02': '07.02 - Hangar & Resources.drawio',
  '07.03': '07.03 - Work Templates.drawio',
  '07.04': '07.04 - Production Plan Preparation.drawio',
  '07.05': '07.05 - Resource & Staff Allocation.drawio',
  '07.06': '07.06 - Customer MRO Work Packages.drawio',
  
  // Module 08 - Aircraft Maintenance
  '08.01': '08.01 - Maintenance Check Control.drawio',
  '08.02': '08.02 - Performing Maintenance.drawio',
  '08.03': '08.03 - Deferral Handling.drawio',
  '08.04': '08.04 - Parts Removal & Installation.drawio',
  '08.05': '08.05 - Release to Service.drawio',
  
  // Module 09 - Procurement
  '09.01': '09.01_Material_Planning.drawio',
  '09.02': '09.02 Supplier Management_Visio.drawio',
  '09.03': '09.03_Ordering.drawio',
  '09.04': '09.04 Repair_&_Exchanges_Visio.drawio',
  '09.05': '09.05_Warranty.drawio',
  '09.06': '09.06_Pooling & Consignment.drawio',
  '09.07': '09.07_Outstations & MRO.drawio',
  
  // Module 10 - Stores
  '10.01': '10.01_Logistics.drawio',
  '10.02': '10.02_Goods_Receiving_&_Inspection.drawio',
  '10.03': '10.03_Major_Assemblies.drawio',
  '10.04': '10.04 Part_Request_Fulfilment_Visio.drawio',
  '10.05': '10.05 Tools.drawio',
  '10.06': '10.06_Inventory_and_Shelf-Life_Control.drawio',
  '10.07': '10.07_Customer_Material.drawio',
  
  // Module 11 - Component Shops
  '11.01': '11.01_Capability_List.drawio',
  '11.02': '11.02_Shop_Card_Templates.drawio',
  '11.03': '11.03_Shop_Planner.drawio',
  '11.05': '11.05_Closed_Loop_Repair.drawio',
  '11.06': '11.06_Component_Release.drawio',
  
  // Module 12 - Finance & Commercial
  '12.01': '12.01_Financial_Accounting.drawio',
  '12.02': '12.02_Invoice Checking.drawio',
  '12.03': '12.03_Fixed Assets & Depreciation.drawio',
  '12.04': '12.04_Commercial Pricing & Billing.drawio',
  '12.05': '12.05_Customer Quotations.drawio',
  '12.06': '12.06_Budgeting & Cost Controlling.drawio',
  '12.07': '12.07_Financial_Multi_Entity.drawio',
};

/**
 * Récupère le chemin du fichier .drawio pour un sous-module donné
 */
export const getAciDrawioFile = (subModuleId: string): string | null => {
  const fileName = ACI_FLOWCHART_DRAWIO_MAPPING[subModuleId];
  if (!fileName) {
    return null;
  }
  return `/Flowchart/${fileName}`;
};

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
  '02.02': '02.02_Aircraft Phase-out ACI.png',
  '02.03': '02.03 Multi-Operator AC Transfer ACI.png',
  '02.04': '02.04 Aircraft & Component counters ACI.png',
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
  
  // Module 10 - Stores
  '10.01': '10.01_Logistics.png',
  '10.02': '10.02_Goods_Receiving_&_Inspection.png',
  '10.03': '10.03_Major_Assemblies.png',
  '10.04': '10.04_Part_Request_Fulfilment.png',
  '10.05': '10.05_Tools.png',
  '10.06': '10.06_Inventory_and_Shelf-Life_Control.png',
  '10.07': '10.07_Customer_Material.png',
  
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

// Mapping Process Design Word documents: subModule.id -> nom du fichier .docx
export const PROCESS_DESIGN_MAPPING: Record<string, string> = {
  // Module 00 - ACC
  '00.01': '00.01_AMOS_Application_Configuration_ProcessDesign.docx',
  '00.02': '00.02_AMOS_Users_and_Roles_ProcessDesign.docx',
  '00.03': '00.03_Technical Assistance_ProcessDesign.docx',
  '00.04': '00.04_Scheduler_Task_ProcessDesign.docx',
  '00.05': '00.05_Interfaces_AMOScentral_ProcessDesign.docx',
  '00.06': '00.06 Data and Reports_ProcessDesign.docx',
  '00.07': '00.07 eSignature & Certificates_ProcessDesign.docx',
  '00.08': '00.08 Support Tool_ProcessDesign.docx',
  '00.09': '00.09_AMOS_Release_Change_ProcessDesign.docx',
  
  // Module 01 - Fleet Engineering
  '01.01': '01.01 Aircraft Definition.docx',
  '01.02': '01.02 Parts Definition.docx',
  '01.03': '01.03 Maintenance Program.docx',
  '01.04': '01.04 SB & AD Assessment.docx',
  '01.05': '01.05 Configuration Management.docx',
  '01.06': '01.06 MEL Administration.docx',
  '01.07': '01.07 Reliability.docx',
  '01.08': '01.08 Weight And Balance.docx',
  '01.09': '01.09 Powerplants (Engine_APU).docx',
  
  // Module 02 - Technical Services
  '02.01': '02.01 Aircraft Phase-in_ProcessDesign.docx',
  '02.02': '02.02 Aircraft Phase-out_ProcessDesign.docx',
  '02.03': '02.03 Multi-Operator AC Transfer_ProcessDesign.docx',
  '02.04': '02.04 Aircraft & Comp Counters_ProcessDesign.docx',
  '02.05': '02.05 Technical Library_ProcessDesign.docx',
  '02.06': '02.06 Requirement Work Scoping_ProcessDesign.docx',
  '02.07': '02.07 Stuctural Damage_ProcessDesign.docx',
  '02.08': '02.08 Digital Records_ProcessDesign.docx',
  '02.09': '02.09 Airworthiness Certificate.docx',
  
  // Module 03 - Fleet Planning
  '03.01': '03.01 Planning_ProcessDesign.docx',
  '03.02': '03.02 Work Package Generation_ProcessDesign.docx',
  '03.03': '03.03 Reporting Back_ProcessDesign.docx',
  '03.04': '03.04 Modification Campaigns_ProcessDesign.docx',
  '03.05': '03.05 Long Term Planning_ProcessDesign.docx',
  
  // Module 04 - Quality Assurance
  '04.01': '04.01_Company Organisation_ProcessDesign.docx',
  '04.02': '04.02 Maintenance Agreements_ProcessDesign.docx',
  '04.03': '04.03 Training and Qualification.docx',
  '04.04': '04.04 Approval Control.docx',
  '04.05': '04.05 Quality Auditing.docx',
  
  // Module 06 - MCC
  '06.01': '06.01 - Fleet Status Monitoring_ProcessDesign.docx',
  '06.02': '06.02 Delays_Event tracking_ProcessDesign.docx',
  '06.03': '06.03 - Line Maintenance Oversight_ProcessDesign.docx',
  '06.04': '06.04 - Recurrent Defects_ProcessDesign.docx',
  '06.05': '06.05 - Aircraft Incidents_ProcessDesign.docx',
  
  // Module 07 - Production Planning
  '07.01': '07.01 - Shift_Planning_ProcessDesign.docx',
  '07.02': '07.02 - Hangar & Resources_ProcessDesign.docx',
  '07.03': '07.03 - Work Templates_ProcessDesign.docx',
  '07.04': '07.04 - Production Plan Preparation_ProcessDesign.docx',
  '07.05': '07.05 - Resource & Staff Allocation_ProcessDesign.docx',
  '07.06': '07.06 - Customer MRO Workpackages_ProcessDesign.docx',
  
  // Module 08 - Aircraft Maintenance
  '08.01': '08.01 - Maintenance Check Control_ProcessDesign.docx',
  '08.02': '08.02 - Performing Maintenance_ProcessDesign.docx',
  '08.03': '08.03 - Deferral Handling_ProcessDesign.docx',
  '08.04': '08.04 - Parts Removal & Installation_ProcessDesign.docx',
  '08.05': '08.05 - Release to Service_ProcessDesign.docx',
  
  // Module 09 - Procurement
  '09.01': '09.01_Material Planning_ProcessDesign.docx',
  '09.02': '09.02_Supplier Management_ProcessDesign.docx',
  '09.03': '09.03_Ordering_ProcessDesign.docx',
  '09.04': '09.04_Repair_&_Exchange_ProcessDesign.docx',
  '09.05': '09.05_Warranty_ProcessDesign.docx',
  '09.06': '09.06_Pooling & Consignment_ProcessDesign.docx',
  '09.07': '09.07_Outstation & MRO_ProcessDesign.docx',
  
  // Module 10 - Stores
  '10.01': '10.01_Logistics_ProcessDesign.docx',
  '10.02': '10.02_Goods_Receiving_&_Inspection_ProcessDesign.docx',
  '10.03': '10.03_Major_Assemblies_ProcessDesign.docx',
  '10.04': '10.04_Part Request Fulfilment_ProcessDesign.docx',
  '10.05': '10.05_Tools_ProcessDesign.docx',
  '10.06': '10.06_Inventory & Shelf Life Control_ProcessDesign.docx',
  '10.07': '10.07_Customer Material_ProcessDesign.docx',
  
  // Module 11 - Component Shops
  '11.01': '11.01_Capability List_ProcessDesign.docx',
  '11.02': '11.02_Shop Card Templates_ProcessDesign.docx',
  '11.03': '11.03_Shop Planner_ProcessDesign.docx',
  '11.04': '11.04_Component Maintenance_ProcessDesign.docx',
  '11.05': '11.05_Closed Loop_ProcessDesign.docx',
  '11.06': '11.06_Component Release_ProcessDesign.docx',
  
  // Module 12 - Finance & Commercial
  '12.01': '12.01_Financial Accounting_ProcessDesign.docx',
  '12.02': '12.02_Invoice Checking_ProcessDesign.docx',
  '12.03': '12.03_Fixed Assets & Depreciation_ProcessDesign.docx',
  '12.04': '12.04_Commercial Pricing & Billing_ProcessDesign.docx',
  '12.05': '12.05_Customer Quotations_ProcessDesign.docx',
  '12.06': '12.06_Budgeting&CostControlling_ProcessDesign.docx',
  '12.07': '12.07_Financial Multi Entity_ProcessDesign.docx',
};

/**
 * Récupère le chemin du fichier Process Design Word pour un sous-module donné
 * @param subModuleId - L'ID du sous-module (ex: '02.01')
 * @returns Le chemin du fichier Word ou null si non trouvé
 */
export const getProcessDesignFile = (subModuleId: string): string | null => {
  const fileName = PROCESS_DESIGN_MAPPING[subModuleId];
  if (!fileName) {
    return null;
  }
  return `/Words/${fileName}`;
};
