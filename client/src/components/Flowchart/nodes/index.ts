import TerminatorNode from './TerminatorNode';
import ProcessNode, { 
  ProcessAccNode, 
  ProcessEngineeringNode, 
  ProcessPlanningNode,
  ProcessProductionNode, 
  ProcessMccNode,
  ProcessLogisticsNode,
  ProcessStoreNode,
  ProcessFinanceNode,
} from './ProcessNode';
import PredefinedProcessNode from './PredefinedProcessNode';
import DecisionNode from './DecisionNode';
import DocumentNode from './DocumentNode';
import ConnectorNode from './ConnectorNode';
import CloudNode from './CloudNode';
import NoteNode from './NoteNode';

export const nodeTypes = {
  terminator: TerminatorNode,
  process: ProcessNode,
  processAcc: ProcessAccNode,
  processEngineering: ProcessEngineeringNode,
  processPlanning: ProcessPlanningNode,
  processProduction: ProcessProductionNode,
  processMcc: ProcessMccNode,
  processLogistics: ProcessLogisticsNode,
  processStore: ProcessStoreNode,
  processFinance: ProcessFinanceNode,
  predefinedProcess: PredefinedProcessNode,
  decision: DecisionNode,
  document: DocumentNode,
  connector: ConnectorNode,
  cloud: CloudNode,
  note: NoteNode,
};

export {
  TerminatorNode,
  ProcessNode,
  ProcessAccNode,
  ProcessEngineeringNode,
  ProcessPlanningNode,
  ProcessProductionNode,
  ProcessMccNode,
  ProcessLogisticsNode,
  ProcessStoreNode,
  ProcessFinanceNode,
  PredefinedProcessNode,
  DecisionNode,
  DocumentNode,
  ConnectorNode,
  CloudNode,
  NoteNode,
};
