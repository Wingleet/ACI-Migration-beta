import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const PredefinedProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      className={`
        relative px-3 py-1 min-w-[70px] min-h-[28px]
        bg-purple-100 dark:bg-purple-900/50
        border rounded
        flex items-center justify-center
        text-[10px] font-medium text-center
        ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-purple-500'}
      `}
    >
      {/* Double vertical bars */}
      <div className="absolute left-1 top-0 bottom-0 w-px bg-purple-500" />
      <div className="absolute right-1 top-0 bottom-0 w-px bg-purple-500" />
      
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-1.5 !h-1.5" />
      <span className="truncate max-w-[55px] px-1">{nodeData.name || 'Predefined'}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-1.5 !h-1.5" />
    </div>
  );
};

export default memo(PredefinedProcessNode);
