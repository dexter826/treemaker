import { BaseEdge, EdgeProps, getSimpleBezierPath } from '@xyflow/react';

export function FamilyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Tính toán điểm rẽ nhánh (75% quãng đường dọc)
  const verticalDistance = targetY - sourceY;
  const splitY = sourceY + verticalDistance * 0.75;

  // Tạo đường dẫn SVG dạng Fork: Dọc -> Ngang -> Dọc
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
        strokeWidth: 2,
        stroke: style.stroke || 'var(--color-foreground)',
      }} 
    />
  );
}
