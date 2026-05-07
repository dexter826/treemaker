import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  Node,
  Edge,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../lib/store';
import { PersonNode } from './person-node';
import { generateNodesAndEdges, getLayoutedElements } from '../../lib/layout';
import { toast } from 'sonner';

const nodeTypes = {
  personNode: PersonNode,
};

export function FamilyTreeCanvas() {
  const persons = useStore((state) => state.persons);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const { fitView } = useReactFlow();

  // Layout the graph when persons change
  useEffect(() => {
    if (persons.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges(persons);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    const styledEdges = layoutedEdges.map(edge => ({
      ...edge,
      type: 'step',
      style: {
        stroke: 'var(--color-foreground)',
        strokeWidth: 2,
        strokeDasharray: '4 4'
      }
    }));

    setNodes(layoutedNodes);
    setEdges(styledEdges);

    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
  }, [persons, setNodes, setEdges, fitView]);

  useEffect(() => {
    if (selectedPersonId) {
      const node = nodes.find(n => n.id === selectedPersonId);
      if (node) {
        fitView({ nodes: [node], duration: 800, padding: 2, maxZoom: 1.2 });
      }
    }
  }, [selectedPersonId, nodes, fitView]);

  return (
    <div className="w-full h-full relative bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Lines} 
          color="var(--color-foreground)" 
          gap={40} 
          size={1} 
          className="opacity-[0.05]" 
        />
        <Controls 
          showInteractive={false} 
          className="bg-background border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)] overflow-hidden !fill-foreground" 
        />
        <MiniMap 
          nodeColor={(n) => {
            const isSelected = n.id === selectedPersonId;
            if (isSelected) return 'var(--color-primary)';
            return 'var(--color-foreground)';
          }}
          maskColor="var(--color-background)" 
          className="bg-background border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)]"
          style={{ backgroundColor: 'var(--color-background)', maskImage: 'none', opacity: 0.8 }}
        />
      </ReactFlow>
    </div>
  );
}
