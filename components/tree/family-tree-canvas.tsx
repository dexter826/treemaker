import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  BackgroundVariant,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../lib/store';
import { PersonNode } from './person-node';
import { generateNodesAndEdges, getLayoutedElements } from '../../lib/layout';
import { toast } from 'sonner';
import { personService } from '../../lib/services/person.service';

const nodeTypes = {
  personNode: PersonNode,
};

export function FamilyTreeCanvas() {
  const persons = useStore((state) => state.persons);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const updatePerson = useStore((state) => state.updatePerson);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [edgeToDelete, setEdgeToDelete] = useState<Edge[] | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onBeforeDelete = useCallback(async ({ edges: deletedEdges }: { edges: Edge[] }) => {
    if (isReadOnly) return false;
    setEdgeToDelete(deletedEdges);
    setIsConfirmOpen(true);
    return false;
  }, [isReadOnly]);

  const confirmDelete = async () => {
    if (!edgeToDelete) return;
    
    setIsConfirmOpen(false);
    
    for (const edge of edgeToDelete) {
      const parts = edge.id.split(':');
      const type = parts[1];
      
      try {
        if (type === 'father') {
          const personId = parts[3];
          await personService.removeFather(personId);
          const person = persons.find(p => p.id === personId);
          if (person) updatePerson({ ...person, father_id: null });
        } else if (type === 'mother') {
          const personId = parts[3];
          await personService.removeMother(personId);
          const person = persons.find(p => p.id === personId);
          if (person) updatePerson({ ...person, mother_id: null });
        } else if (type === 'spouse') {
          const p1Id = parts[2];
          const p2Id = parts[3];
          await personService.removeSpouse(p1Id, p2Id);
          const p1 = persons.find(p => p.id === p1Id);
          const p2 = persons.find(p => p.id === p2Id);
          if (p1) updatePerson({ ...p1, spouse_id: null });
          if (p2) updatePerson({ ...p2, spouse_id: null });
        }
      } catch (error) {
        console.error('Error deleting edge:', error);
        toast.error('Không thể xóa kết nối');
        setEdgeToDelete(null);
        return;
      }
    }

    // Remove edges from React Flow state
    setEdges((eds) => eds.filter((e) => !edgeToDelete.some((del) => del.id === e.id)));
    toast.success('Đã xóa kết nối thành công');
    setEdgeToDelete(null);
  };

  const onConnect = useCallback(async (params: Connection) => {
    if (isReadOnly) return;
    
    const { source, target, sourceHandle, targetHandle } = params;
    if (!source || !target) return;
    if (source === target) return;

    const sourcePerson = persons.find(p => p.id === source);
    const targetPerson = persons.find(p => p.id === target);

    if (!sourcePerson || !targetPerson) return;

    try {
      if (sourceHandle === 'bottom' && targetHandle === 'top') {
        // Liên kết Cha/Mẹ -> Con
        if (sourcePerson.gender === 'male') {
          await personService.addFather(target, source);
          updatePerson({ ...targetPerson, father_id: source });
          toast.success(`Đã kết nối Cha: ${sourcePerson.full_name} -> ${targetPerson.full_name}`);
        } else if (sourcePerson.gender === 'female') {
          await personService.addMother(target, source);
          updatePerson({ ...targetPerson, mother_id: source });
          toast.success(`Đã kết nối Mẹ: ${sourcePerson.full_name} -> ${targetPerson.full_name}`);
        } else {
          toast.error('Giới tính người cha/mẹ chưa xác định');
        }
      } else if ((sourceHandle === 'left' || sourceHandle === 'right') && 
                 (targetHandle === 'left' || targetHandle === 'right')) {
        // Liên kết Vợ/Chồng
        await personService.addSpouse(source, target);
        updatePerson({ ...sourcePerson, spouse_id: target });
        updatePerson({ ...targetPerson, spouse_id: source });
        toast.success(`Đã kết nối Vợ/Chồng: ${sourcePerson.full_name} & ${targetPerson.full_name}`);
      }
    } catch (error: any) {
      console.error('Lỗi khi kết nối:', error);
      toast.error('Không thể tạo kết nối');
    }
  }, [persons, isReadOnly, updatePerson]);
  
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
        edges={edges.map(edge => ({
          ...edge,
          animated: edge.selected,
          style: {
            ...edge.style,
            stroke: edge.selected ? 'var(--primary)' : edge.style?.stroke,
            strokeWidth: edge.selected ? 3 : 2,
          }
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onBeforeDelete={onBeforeDelete}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
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

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">
              Xác Nhận Xóa Kết Nối
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Hành động này không thể hoàn tác
            </p>
          </div>
          
          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa kết nối này không? Các thông tin về quan hệ gia đình liên quan sẽ bị loại bỏ khỏi hồ sơ.
            </p>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 rounded-none h-14 border-r-2 border-foreground font-bold uppercase tracking-widest hover:bg-foreground hover:text-background cursor-pointer" onClick={() => setIsConfirmOpen(false)}>
              Giữ Lại
            </Button>
            <Button variant="destructive" className="flex-1 rounded-none h-14 border-2 border-transparent hover:border-destructive font-bold uppercase tracking-widest cursor-pointer" onClick={confirmDelete}>
              Chấp Nhận Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
