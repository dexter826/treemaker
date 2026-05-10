import { useEffect } from 'react';
import { useNodesState, useEdgesState, useReactFlow, Node, Edge } from '@xyflow/react';
import { Person, Relationship } from '@/types';
import { generateNodesAndEdges, getLayoutedElements } from '../utils/layout';

export function useTreeFlow(persons: Person[], relationships: Relationship[], selectedPersonId: string | null) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (persons.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges(persons, relationships);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 800 });
    }, 100);

    return () => clearTimeout(timer);
  }, [persons, relationships, setNodes, setEdges, fitView]);

  useEffect(() => {
    if (!selectedPersonId) return;
    const node = nodes.find((n) => n.id === selectedPersonId);
    if (node) {
      fitView({ nodes: [node], duration: 800, padding: 2, maxZoom: 1.2 });
    }
  }, [selectedPersonId, nodes, fitView]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    fitView,
  };
}
