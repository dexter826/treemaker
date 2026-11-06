import { BaseEdge, EdgeProps } from '@xyflow/react';

export function FamilyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const verticalDistance = targetY - sourceY;
  const splitY = sourceY + verticalDistance * 0.75;

  const edgePath = `M ${sourceX},${sourceY} 
                    L ${sourceX},${splitY} 
                    L ${targetX},${splitY} 
                    L ${targetX},${targetY}`;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: selected ? 3 : 2,
        stroke: selected ? 'var(--color-primary)' : 'var(--color-text-primary)',
      }}
    />
  );
}
