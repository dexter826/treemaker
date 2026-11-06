import { Handle, Position } from '@xyflow/react';
import { MARRIAGE_NODE_SIZE } from '../../constants';

export function MarriageNode() {
  return (
    <div
      className="border-text-primary bg-surface rounded-full border-2"
      style={{ width: MARRIAGE_NODE_SIZE, height: MARRIAGE_NODE_SIZE }}
    >
      <Handle id="left" type="target" position={Position.Left} />
      <Handle id="right" type="target" position={Position.Right} />
      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
    </div>
  );
}
