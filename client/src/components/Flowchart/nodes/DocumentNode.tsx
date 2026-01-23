import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const DocumentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div className="relative">
      {/* Document shape with wavy bottom */}
      <svg width="60" height="40" viewBox="0 0 60 40">
        <path
          d="M 0 3 
             Q 0 0 3 0 
             L 57 0 
             Q 60 0 60 3 
             L 60 32 
             Q 45 29 30 32 
             Q 15 35 0 32 
             L 0 3 Z"
          fill="#ffedd5"
          stroke={selected ? '#3b82f6' : '#f97316'}
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pb-1">
        <span className="text-[9px] font-medium text-center max-w-[50px] px-1 text-gray-800 leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflow: 'visible' }}>
          {nodeData.name || 'Doc'}
        </span>
      </div>
      
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-1.5 !h-1.5" style={{ bottom: 6 }} />
    </div>
  );
};

export default memo(DocumentNode);
