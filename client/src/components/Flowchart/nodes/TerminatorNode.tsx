import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const TerminatorNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      className={`
        px-2 py-1 min-w-[50px] min-h-[24px]
        bg-white dark:bg-slate-100
        border rounded-full
        flex items-center justify-center
        text-[9px] font-medium text-center text-slate-800
        ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-slate-400'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-1.5 !h-1.5" />
      <span className="truncate max-w-[60px]">{nodeData.name || 'Start/End'}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-1.5 !h-1.5" />
    </div>
  );
};

export default memo(TerminatorNode);
