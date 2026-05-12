import { useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, useReactFlow, Node, Edge } from '@xyflow/react';
import { Person, Relationship } from '@/types';
import { generateNodesAndEdges, getLayoutedElements } from '../utils/layout';
import { ANIMATION_DURATION } from '../constants';

export function useTreeFlow(persons: Person[], relationships: Relationship[], selectedPersonId: string | null) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  
  const prevCounts = useRef({ persons: 0, relationships: 0 });

  useEffect(() => {
    if (persons.length === 0) {
      setNodes([]);
      setEdges([]);
      prevCounts.current = { persons: 0, relationships: 0 };
      return;
    }

    const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges(persons, relationships);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    const hasStructureChanged = 
      persons.length !== prevCounts.current.persons || 
      relationships.length !== prevCounts.current.relationships;

    if (hasStructureChanged) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.1, duration: ANIMATION_DURATION.CANVAS_FIT_VIEW });
      }, 100);
      
      prevCounts.current = { persons: persons.length, relationships: relationships.length };
      return () => clearTimeout(timer);
    }
  }, [persons, relationships, setNodes, setEdges, fitView]);

  useEffect(() => {
    if (!selectedPersonId) return;
    const node = nodes.find((n) => n.id === selectedPersonId);
    if (node) {
      fitView({ nodes: [node], duration: ANIMATION_DURATION.CANVAS_FIT_VIEW, padding: 2, maxZoom: 1.2 });
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
