import { useEffect, useCallback } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  useReactFlow, 
  Node, 
  Edge 
} from '@xyflow/react';
import { Person } from '@/types';
import { generateNodesAndEdges, getLayoutedElements } from '../utils/layout';

// Quản lý hiển thị và tự động sắp xếp sơ đồ cây.
export function useTreeFlow(persons: Person[], selectedPersonId: string | null) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (persons.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges(persons);

    const styledEdges = initialEdges.map(edge => ({
      ...edge,
      type: 'step',
      style: {
        stroke: 'var(--color-foreground)',
        strokeWidth: 2,
        strokeDasharray: '4 4'
      }
    }));

    setNodes(initialNodes);
    setEdges(styledEdges);

    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);

    return () => clearTimeout(timer);
  }, [persons.length, setNodes, setEdges, fitView]); 

  useEffect(() => {
    if (selectedPersonId) {
      const node = nodes.find(n => n.id === selectedPersonId);
      if (node) {
        fitView({ nodes: [node], duration: 800, padding: 2, maxZoom: 1.2 });
      }
    }
  }, [selectedPersonId, nodes, fitView]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    fitView
  };
}
