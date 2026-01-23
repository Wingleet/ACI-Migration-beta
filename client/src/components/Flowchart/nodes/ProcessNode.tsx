import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData, ProcessCategory } from '@/types/flowchart';

interface ProcessColors {
  bg: string;
  darkBg: string;
  border: string;
  handle: string;
}

const categoryColors: Record<ProcessCategory | 'default', ProcessColors> = {
  acc: {
    bg: 'bg-slate-200',
    darkBg: 'dark:bg-slate-700/50',
    border: 'border-slate-500',
    handle: '!bg-slate-500',
  },
  engineering: {
    bg: 'bg-red-100',
    darkBg: 'dark:bg-red-900/50',
    border: 'border-red-500',
    handle: '!bg-red-500',
  },
  production: {
    bg: 'bg-blue-100',
    darkBg: 'dark:bg-blue-900/50',
    border: 'border-blue-500',
    handle: '!bg-blue-500',
  },
  logistics: {
    bg: 'bg-green-100',
    darkBg: 'dark:bg-green-900/50',
    border: 'border-green-500',
    handle: '!bg-green-500',
  },
  default: {
    bg: 'bg-blue-100',
    darkBg: 'dark:bg-blue-900/50',
    border: 'border-blue-500',
    handle: '!bg-blue-500',
  },
};

interface ProcessNodeBaseProps extends NodeProps {
  category?: ProcessCategory;
}

const ProcessNodeBase: React.FC<ProcessNodeBaseProps> = ({ data, selected, category = 'default' }) => {
  const nodeData = data as FlowchartNodeData;
  const colors = categoryColors[category];
  
  return (
    <div
      className={`
        px-2 py-1 min-w-[60px] min-h-[28px]
        ${colors.bg} ${colors.darkBg}
        border rounded
        flex items-center justify-center
        text-[10px] font-medium text-center
        ${selected ? 'border-primary ring-2 ring-primary/30' : colors.border}
      `}
    >
      <Handle type="target" position={Position.Top} className={`${colors.handle} !w-1.5 !h-1.5`} />
      <span className="truncate max-w-[80px]">{nodeData.name || 'Process'}</span>
      <Handle type="source" position={Position.Bottom} className={`${colors.handle} !w-1.5 !h-1.5`} />
    </div>
  );
};

// Default Process node (blue - for backwards compatibility)
const ProcessNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="production" />
);

// ACC Process node (grey)
export const ProcessAccNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="acc" />
);

// Engineering Process node (red)
export const ProcessEngineeringNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="engineering" />
);

// Planning Process node (red)
export const ProcessPlanningNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="engineering" />
);

// Production Process node (blue)
export const ProcessProductionNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="production" />
);

// MCC Process node (blue)
export const ProcessMccNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="production" />
);

// Logistics Process node (green)
export const ProcessLogisticsNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="logistics" />
);

// Store Process node (green)
export const ProcessStoreNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="logistics" />
);

// Finance Process node (green)
export const ProcessFinanceNode: React.FC<NodeProps> = (props) => (
  <ProcessNodeBase {...props} category="logistics" />
);

export default memo(ProcessNode);
