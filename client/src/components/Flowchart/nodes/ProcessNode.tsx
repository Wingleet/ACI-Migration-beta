import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData, ProcessCategory } from '@/types/flowchart';

interface ProcessColors {
  bg: string;
  border: string;
  handle: string;
}

const categoryColors: Record<ProcessCategory | 'default', ProcessColors> = {
  acc: {
    bg: '#e2e8f0', // slate-200
    border: '#64748b', // slate-500
    handle: '#64748b',
  },
  engineering: {
    bg: '#fee2e2', // red-100
    border: '#ef4444', // red-500
    handle: '#ef4444',
  },
  production: {
    bg: '#dbeafe', // blue-100
    border: '#3b82f6', // blue-500
    handle: '#3b82f6',
  },
  logistics: {
    bg: '#dcfce7', // green-100
    border: '#22c55e', // green-500
    handle: '#22c55e',
  },
  default: {
    bg: '#dbeafe',
    border: '#3b82f6',
    handle: '#3b82f6',
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
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${selected ? '#3b82f6' : colors.border}`,
        boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
        borderRadius: '4px',
        padding: '4px 8px',
        minWidth: '60px',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ backgroundColor: colors.handle, width: '6px', height: '6px' }} 
      />
      <span 
        style={{ 
          fontSize: '10px', 
          fontWeight: 500, 
          textAlign: 'center',
          color: '#1f2937',
          maxWidth: '80px',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {nodeData.name || 'Process'}
      </span>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ backgroundColor: colors.handle, width: '6px', height: '6px' }} 
      />
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
