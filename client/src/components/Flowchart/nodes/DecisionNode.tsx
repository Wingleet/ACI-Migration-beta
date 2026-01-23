import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const DecisionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div className="relative w-[50px] h-[50px]">
      {/* Diamond shape using CSS transform */}
      <div
        className="absolute inset-0 transform rotate-45"
        style={{ 
          margin: '6px',
          backgroundColor: '#fef3c7',
          border: `1px solid ${selected ? '#3b82f6' : '#f59e0b'}`,
          boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none'
        }}
      />
      
      {/* Text container (not rotated) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-medium text-center max-w-[35px] px-0.5 text-gray-800 leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {nodeData.name || '?'}
        </span>
      </div>
      
      {/* Handles positioned at diamond points */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-amber-500 !w-1.5 !h-1.5"
        style={{ top: 2 }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-amber-500 !w-1.5 !h-1.5"
        style={{ bottom: 2 }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left"
        className="!bg-amber-500 !w-1.5 !h-1.5"
        style={{ left: 2 }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        className="!bg-amber-500 !w-1.5 !h-1.5"
        style={{ right: 2 }}
      />
    </div>
  );
};

export default memo(DecisionNode);
