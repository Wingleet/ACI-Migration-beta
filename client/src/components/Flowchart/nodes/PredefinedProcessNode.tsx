import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const PredefinedProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#f3e8ff', // purple-100
        border: `1px solid ${selected ? '#3b82f6' : '#a855f7'}`,
        boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
        borderRadius: '4px',
        padding: '4px 12px',
        minWidth: '70px',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Double vertical bars */}
      <div style={{ position: 'absolute', left: '4px', top: 0, bottom: 0, width: '1px', backgroundColor: '#a855f7' }} />
      <div style={{ position: 'absolute', right: '4px', top: 0, bottom: 0, width: '1px', backgroundColor: '#a855f7' }} />
      
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ backgroundColor: '#a855f7', width: '6px', height: '6px' }} 
      />
      <span 
        style={{ 
          fontSize: '10px', 
          fontWeight: 500, 
          textAlign: 'center',
          color: '#1f2937',
          maxWidth: '55px',
          padding: '0 4px',
          wordBreak: 'break-word',
          lineHeight: '1.2',
        }}
      >
        {nodeData.name || 'Predefined'}
      </span>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ backgroundColor: '#a855f7', width: '6px', height: '6px' }} 
      />
    </div>
  );
};

export default memo(PredefinedProcessNode);
