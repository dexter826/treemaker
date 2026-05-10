import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { Person, Relationship } from '@/types';
import { TREE_NODE_WIDTH, TREE_NODE_HEIGHT, MARRIAGE_NODE_SIZE, LAYOUT_CONFIG } from '../constants';

/**
 * Tạo danh sách nodes và edges cho React Flow dựa trên dữ liệu người và quan hệ
 */
export const generateNodesAndEdges = (persons: Person[], relationships: Relationship[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const sortedPersons = [...persons].sort((a, b) => (a.sibling_order ?? 0) - (b.sibling_order ?? 0));

  sortedPersons.forEach((person) => {
    nodes.push({
      id: person.id,
      type: 'personNode',
      position: { x: 0, y: 0 },
      data: { person },
    });
  });

  const marriageMap = new Map<string, string>();
  
  relationships.forEach((rel) => {
    if (rel.relationship_type === 'spouse') {
      const pairKey = [rel.person1_id, rel.person2_id].sort().join(':');
      const mNodeId = `m:${pairKey}`;
      
      if (!marriageMap.has(pairKey)) {
        marriageMap.set(pairKey, mNodeId);
        
        nodes.push({
          id: mNodeId,
          type: 'marriageNode',
          position: { x: 0, y: 0 },
          data: {},
        });

        edges.push({
          id: `e:m1:${mNodeId}`,
          source: rel.person1_id,
          target: mNodeId,
          type: 'straight',
          style: { stroke: 'var(--color-foreground)', strokeWidth: 2 },
        });
        edges.push({
          id: `e:m2:${mNodeId}`,
          source: rel.person2_id,
          target: mNodeId,
          type: 'straight',
          style: { stroke: 'var(--color-foreground)', strokeWidth: 2 },
        });
      }
    }
  });

  sortedPersons.forEach((person) => {
    const parentsKey = [person.father_id, person.mother_id].filter(Boolean).sort().join(':');
    const mNodeId = marriageMap.get(parentsKey);

    if (mNodeId && person.father_id && person.mother_id) {
      edges.push({
        id: `e:marriage:child:${person.id}`,
        source: mNodeId,
        target: person.id,
        sourceHandle: 'bottom',
        targetHandle: 'top',
        type: 'step',
        style: { stroke: 'var(--color-foreground)', strokeWidth: 2 },
      });
    } else {
      if (person.father_id) {
        edges.push({
          id: `e:father:${person.father_id}:${person.id}`,
          source: person.father_id,
          target: person.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'step',
          style: { stroke: 'var(--color-foreground)', strokeWidth: 2 },
        });
      }
      if (person.mother_id) {
        edges.push({
          id: `e:mother:${person.mother_id}:${person.id}`,
          source: person.mother_id,
          target: person.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'step',
          style: { stroke: 'var(--color-foreground)', strokeWidth: 2 },
        });
      }
    }
  });

  return { nodes, edges };
};

/**
 * Tính toán vị trí các node theo đơn vị gia đình.
 */
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: direction, 
    ...LAYOUT_CONFIG,
    ranker: 'network-simplex'
  });

  const marriageNodes = nodes.filter(n => n.type === 'marriageNode');
  const personNodes = nodes.filter(n => n.type === 'personNode');
  
  const coupleMap = new Map<string, { spouse1: string; spouse2: string }>();
  marriageNodes.forEach(mNode => {
    const spouseEdges = edges.filter(e => e.target === mNode.id && (e.id.startsWith('e:m1:') || e.id.startsWith('e:m2:')));
    if (spouseEdges.length === 2) {
      coupleMap.set(mNode.id, {
        spouse1: spouseEdges[0].source,
        spouse2: spouseEdges[1].source
      });
    }
  });

  const groupedPersonIds = new Set<string>();
  coupleMap.forEach(couple => {
    groupedPersonIds.add(couple.spouse1);
    groupedPersonIds.add(couple.spouse2);
  });

  const coupleSpacing = 40; 
  const virtualCoupleWidth = (TREE_NODE_WIDTH * 2) + coupleSpacing;

  const dagreNodesToAdd: { id: string, width: number, height: number, order: number, dateMs: number }[] = [];

  const getPerson = (id: string) => nodes.find(n => n.id === id)?.data?.person as Person | undefined;

  marriageNodes.forEach(mNode => {
    const couple = coupleMap.get(mNode.id);
    let order = 999;
    let dateMs = Infinity;
    if (couple) {
      const p1 = getPerson(couple.spouse1);
      const p2 = getPerson(couple.spouse2);
      const bloodP = (p1?.father_id || p1?.mother_id) ? p1 : ((p2?.father_id || p2?.mother_id) ? p2 : p1);
      order = bloodP?.sibling_order ?? 999;
      dateMs = bloodP?.birth_date ? new Date(bloodP.birth_date).getTime() : Infinity;
    }
    dagreNodesToAdd.push({ id: mNode.id, width: virtualCoupleWidth, height: TREE_NODE_HEIGHT, order, dateMs });
  });

  personNodes.forEach(node => {
    if (!groupedPersonIds.has(node.id)) {
      const p = getPerson(node.id);
      const order = p?.sibling_order ?? 999;
      const dateMs = p?.birth_date ? new Date(p.birth_date).getTime() : Infinity;
      dagreNodesToAdd.push({ id: node.id, width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT, order, dateMs });
    }
  });

  dagreNodesToAdd.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.dateMs - b.dateMs;
  });

  dagreNodesToAdd.forEach(n => {
    dagreGraph.setNode(n.id, { width: n.width, height: n.height });
  });

  const sortedEdges = [...edges].sort((a, b) => {
    const getOrder = (personId: string) => {
      const person = nodes.find(n => n.id === personId)?.data?.person as Person;
      return person?.sibling_order ?? 0;
    };
    return getOrder(a.target) - getOrder(b.target);
  });

  sortedEdges.forEach((edge) => {
    if (edge.id.startsWith('e:m1:') || edge.id.startsWith('e:m2:')) return;

    let source = edge.source;
    let target = edge.target;

    for (const [mId, couple] of coupleMap.entries()) {
      if (couple.spouse1 === source || couple.spouse2 === source) source = mId;
      if (couple.spouse1 === target || couple.spouse2 === target) target = mId;
    }

    dagreGraph.setEdge(source, target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = [];

  coupleMap.forEach((couple, mId) => {
    const dagreNode = dagreGraph.node(mId);
    const centerX = dagreNode.x;
    const centerY = dagreNode.y;

    const mNode = nodes.find(n => n.id === mId)!;
    
    const p1 = nodes.find(n => n.id === couple.spouse1)?.data?.person as Person;
    const p2 = nodes.find(n => n.id === couple.spouse2)?.data?.person as Person;
    
    let leftId = couple.spouse1;
    let rightId = couple.spouse2;
    const isP1Blood = !!(p1?.father_id || p1?.mother_id);
    const isP2Blood = !!(p2?.father_id || p2?.mother_id);
    
    if (isP2Blood && !isP1Blood) {
      leftId = couple.spouse2;
      rightId = couple.spouse1;
    } else if (!isP1Blood && !isP2Blood && p2?.gender === 'male' && p1?.gender !== 'male') {
      leftId = couple.spouse2;
      rightId = couple.spouse1;
    }

    const leftNode = nodes.find(n => n.id === leftId)!;
    const rightNode = nodes.find(n => n.id === rightId)!;

    const xOffset = (TREE_NODE_WIDTH + coupleSpacing) / 2;

    layoutedNodes.push({
      ...mNode,
      position: { x: centerX - MARRIAGE_NODE_SIZE / 2, y: centerY - MARRIAGE_NODE_SIZE / 2 },
    });

    layoutedNodes.push({
      ...leftNode,
      position: { x: centerX - xOffset - TREE_NODE_WIDTH / 2, y: centerY - TREE_NODE_HEIGHT / 2 },
    });
    layoutedNodes.push({
      ...rightNode,
      position: { x: centerX + xOffset - TREE_NODE_WIDTH / 2, y: centerY - TREE_NODE_HEIGHT / 2 },
    });
  });

  personNodes.forEach(node => {
    if (!groupedPersonIds.has(node.id)) {
      const dagreNode = dagreGraph.node(node.id);
      layoutedNodes.push({
        ...node,
        position: { x: dagreNode.x - TREE_NODE_WIDTH / 2, y: dagreNode.y - TREE_NODE_HEIGHT / 2 },
      });
    }
  });

  const finalNodes = layoutedNodes.map(node => ({
    ...node,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
  }));

  const layoutedEdges = edges.map((edge) => {
    const sourceNode = finalNodes.find(n => n.id === edge.source);
    const targetNode = finalNodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      if (edge.id.startsWith('e:m1:') || edge.id.startsWith('e:m2:')) {
        const isSourceLeft = sourceNode.position.x < targetNode.position.x;
        return {
          ...edge,
          sourceHandle: isSourceLeft ? 'right' : 'left',
          targetHandle: isSourceLeft ? 'left' : 'right',
          type: 'straight',
        };
      }
    }
    return edge;
  });

  return { nodes: finalNodes, edges: layoutedEdges };
};



