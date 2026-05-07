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
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../lib/store';
import { PersonNode } from './person-node';
import { generateNodesAndEdges, getLayoutedElements } from '../../lib/layout';
import { Button } from '../ui/button';
import { Plus, Maximize, ZoomIn, ZoomOut, Save } from 'lucide-react';
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

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Give it a moment to render then fit view
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
  }, [persons, setNodes, setEdges, fitView]);

  // Focus node logic
  useEffect(() => {
    if (selectedPersonId) {
      const node = nodes.find(n => n.id === selectedPersonId);
      if (node) {
        fitView({ nodes: [node], duration: 800, padding: 2, maxZoom: 1.2 });
      }
    }
  }, [selectedPersonId, nodes, fitView]);

  return (
    <div className="w-full h-full relative" style={{ background: 'var(--background)' }}>
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
        <Background color="#ef4444" gap={16} size={1} />
        <Controls showInteractive={false} className="bg-background border shadow-sm rounded-md overflow-hidden" />
        <MiniMap 
          nodeColor={(n) => {
            const p = n.data?.person as any;
            if (p?.gender === 'male') return '#93c5fd';
            if (p?.gender === 'female') return '#f9a8d4';
            return '#e2e8f0';
          }}
          maskColor="rgba(0,0,0,0.1)" 
          className="bg-background border shadow-sm rounded-md"
        />
        
        {/* We can place additional custom panels here if needed */}
      </ReactFlow>
    </div>
  );
}
