import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowchartNodeData } from '@/types/flowchart';

const ConnectorNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as FlowchartNodeData;
  
  return (
    <div
      className={`
        w-[30px] h-[30px]
        bg-slate-200 dark:bg-slate-700
        border-2 rounded-full
        flex items-center justify-center
        text-[8px] font-bold
        ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-slate-500'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Left} id="left-in" className="!bg-slate-500 !w-1.5 !h-1.5" />
      <span>{nodeData.name || '1'}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="right-out" className="!bg-slate-500 !w-1.5 !h-1.5" />
    </div>
  );
};

export default memo(ConnectorNode);
