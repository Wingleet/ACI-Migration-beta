import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const NoteNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1px dashed ${selected ? '#3b82f6' : '#9ca3af'}`,
        boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
        borderRadius: '4px',
        padding: '6px 10px',
        minWidth: '60px',
        maxWidth: '150px',
      }}
    >
      <span 
        style={{ 
          fontSize: '9px', 
          color: '#374151',
          lineHeight: '1.3',
          display: 'block',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {nodeData.name || 'Note...'}
      </span>
    </div>
  );
};

export default memo(NoteNode);
