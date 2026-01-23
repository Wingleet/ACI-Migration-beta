// Flowchart types for AMOS-style diagrams

export type NodeType = 
  | 'terminator'        // Start/End - circle
  | 'process'           // Process - rectangle (generic blue)
  | 'processAcc'        // Process ACC - grey
  | 'processEngineering' // Process Engineering - red
  | 'processPlanning'   // Process Planning - red
  | 'processProduction' // Process Production - blue
  | 'processMcc'        // Process MCC - blue
  | 'processLogistics'  // Process Logistics - green
  | 'processStore'      // Process Store - green
  | 'processFinance'    // Process Finance - green
  | 'predefinedProcess' // Predefined Process - rectangle with double bars
  | 'decision'          // Decision - diamond
  | 'document'          // Document/Data - document shape
  | 'connector'         // Connector - small circle
  | 'cloud'             // Cloud - other software
  | 'note';             // Note - text only

export type ProcessCategory = 'acc' | 'engineering' | 'production' | 'logistics';

export interface FlowchartNodeData {
  name: string;
  note?: string;
  description?: string;
  category?: ProcessCategory;
}

export interface FlowchartNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: FlowchartNodeData;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowchartDiagram {
  id: string;
  name: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  updatedAt: string;
}

// Symbol definitions for the palette
export const FLOWCHART_SYMBOLS = [
  { 
    type: 'terminator' as NodeType, 
    shape: 'circle', 
    standardName: 'Start / End', 
    amosUsage: 'Début / Fin',
    icon: '○'
  },
  { 
    type: 'processAcc' as NodeType, 
    shape: 'rectangle', 
    standardName: 'ACC', 
    amosUsage: 'Process ACC',
    icon: '▭',
    category: 'acc' as ProcessCategory
  },
  { 
    type: 'processEngineering' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Engineering', 
    amosUsage: 'Engineering',
    icon: '▭',
    category: 'engineering' as ProcessCategory
  },
  { 
    type: 'processPlanning' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Planning', 
    amosUsage: 'Planning',
    icon: '▭',
    category: 'engineering' as ProcessCategory
  },
  { 
    type: 'processProduction' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Production', 
    amosUsage: 'Production',
    icon: '▭',
    category: 'production' as ProcessCategory
  },
  { 
    type: 'processMcc' as NodeType, 
    shape: 'rectangle', 
    standardName: 'MCC', 
    amosUsage: 'MCC',
    icon: '▭',
    category: 'production' as ProcessCategory
  },
  { 
    type: 'processLogistics' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Logistics', 
    amosUsage: 'Logistique',
    icon: '▭',
    category: 'logistics' as ProcessCategory
  },
  { 
    type: 'processStore' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Store', 
    amosUsage: 'Magasin',
    icon: '▭',
    category: 'logistics' as ProcessCategory
  },
  { 
    type: 'processFinance' as NodeType, 
    shape: 'rectangle', 
    standardName: 'Finance', 
    amosUsage: 'Finance',
    icon: '▭',
    category: 'logistics' as ProcessCategory
  },
  { 
    type: 'predefinedProcess' as NodeType, 
    shape: 'rectangle_double_bar', 
    standardName: 'Predefined Process', 
    amosUsage: 'Process AMOS existant',
    icon: '⧈'
  },
  { 
    type: 'decision' as NodeType, 
    shape: 'diamond', 
    standardName: 'Decision', 
    amosUsage: 'Question métier',
    icon: '◇'
  },
  { 
    type: 'document' as NodeType, 
    shape: 'document', 
    standardName: 'Document / Data', 
    amosUsage: 'Donnée ou doc',
    icon: '📄'
  },
  { 
    type: 'cloud' as NodeType, 
    shape: 'cloud', 
    standardName: 'Other Software', 
    amosUsage: 'Autre logiciel',
    icon: '☁'
  },
  { 
    type: 'note' as NodeType, 
    shape: 'note', 
    standardName: 'Note', 
    amosUsage: 'Annotation',
    icon: '📝'
  },
] as const;
