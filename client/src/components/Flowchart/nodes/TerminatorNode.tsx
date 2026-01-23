import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const TerminatorNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${selected ? '#3b82f6' : '#94a3b8'}`,
        boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
        borderRadius: '9999px',
        padding: '4px 8px',
        minWidth: '50px',
        minHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ backgroundColor: '#64748b', width: '6px', height: '6px' }} 
      />
      <span 
        style={{ 
          fontSize: '9px', 
          fontWeight: 500, 
          textAlign: 'center',
          color: '#1f2937',
          maxWidth: '60px',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {nodeData.name || 'Start/End'}
      </span>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ backgroundColor: '#64748b', width: '6px', height: '6px' }} 
      />
    </div>
  );
};

export default memo(TerminatorNode);
