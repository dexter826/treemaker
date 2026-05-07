import dagre from 'dagre';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { Person } from '../types';

const nodeWidth = 220;
const nodeHeight = 100;

export const generateNodesAndEdges = (persons: Person[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  persons.forEach((person) => {
    nodes.push({
      id: person.id,
      type: 'personNode',
      position: { x: 0, y: 0 },
      data: { person },
    });

    if (person.father_id) {
      edges.push({
        id: `e-father-${person.father_id}-${person.id}`,
        source: person.father_id,
        target: person.id,
        type: 'smoothstep',
        animated: true,
        label: 'Father',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      });
    }

    if (person.mother_id) {
      edges.push({
        id: `e-mother-${person.mother_id}-${person.id}`,
        source: person.mother_id,
        target: person.id,
        type: 'smoothstep',
        animated: true,
        label: 'Mother',
        style: { stroke: '#ec4899', strokeWidth: 2 },
      });
    }

    if (person.spouse_id) {
      // To avoid duplicate spouse edges (A->B and B->A), we only add if A < B
      if (person.id < person.spouse_id) {
        edges.push({
          id: `e-spouse-${person.id}-${person.spouse_id}`,
          source: person.id,
          target: person.spouse_id,
          type: 'straight',
          label: 'Spouse',
          style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
        });
      }
    }
  });

  return { nodes, edges };
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 80, 
    edgesep: 40, 
    ranksep: 120 
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode as Node;
  });

  return { nodes: newNodes, edges };
};
