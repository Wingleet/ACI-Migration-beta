import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const CloudNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div className="relative">
      {/* Cloud shape using SVG */}
      <svg width="70" height="40" viewBox="0 0 70 40">
        <path
          d="M 15 30 
             C 6 30 3 24 6 18 
             C 3 12 9 6 18 9 
             C 21 3 33 0 42 6 
             C 51 3 60 6 63 15 
             C 69 18 69 27 60 30 
             Z"
          fill="#cffafe"
          stroke={selected ? '#3b82f6' : '#06b6d4'}
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-medium text-center max-w-[55px] px-1 text-gray-800 leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {nodeData.name || 'Software'}
        </span>
      </div>
      
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-1.5 !h-1.5" style={{ top: 4 }} />
      <Handle type="target" position={Position.Left} id="left-in" className="!bg-cyan-500 !w-1.5 !h-1.5" style={{ left: 4 }} />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-1.5 !h-1.5" style={{ bottom: 4 }} />
      <Handle type="source" position={Position.Right} id="right-out" className="!bg-cyan-500 !w-1.5 !h-1.5" style={{ right: 4 }} />
    </div>
  );
};

export default memo(CloudNode);
