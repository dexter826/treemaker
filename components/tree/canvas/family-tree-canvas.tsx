import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { PersonNode } from './person-node';
import { useTreeFlow } from '../hooks/use-tree-flow';
import { useTreeConnections } from '../hooks/use-tree-connections';

const nodeTypes = {
  personNode: PersonNode,
};

// Hiển thị Canvas cây gia đình bằng React Flow.
export function FamilyTreeCanvas() {
  const persons = useStore((state) => state.persons);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const updatePerson = useStore((state) => state.updatePerson);
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    setEdges 
  } = useTreeFlow(persons, selectedPersonId);

  const {
    onConnect,
    onBeforeDelete,
    confirmDelete,
    isConfirmOpen,
    setIsConfirmOpen
  } = useTreeConnections(persons, isReadOnly, updatePerson, setEdges);

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
