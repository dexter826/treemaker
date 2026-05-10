import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { MARRIAGE_NODE_SIZE } from '../constants';

export function MarriageNode() {
  return (
    <div className="w-2.5 h-2.5 opacity-0">
      <Handle id="left" type="target" position={Position.Left} />
      <Handle id="right" type="target" position={Position.Right} />
      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
    </div>
  );
}
