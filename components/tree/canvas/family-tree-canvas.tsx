import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { PersonNode } from './person-node';
import { MarriageNode } from './marriage-node';
import { useTreeFlow } from '../hooks/use-tree-flow';
import { useTreeConnections } from '../hooks/use-tree-connections';
import { FamilyEdge } from './family-edge';

const nodeTypes = { 
  personNode: PersonNode,
  marriageNode: MarriageNode 
};

const edgeTypes = {
  familyEdge: FamilyEdge
};

// Vùng hiển thị cây gia phả tương tác.
export function FamilyTreeCanvas() {
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const updatePerson = useStore((state) => state.updatePerson);

  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useTreeFlow(persons, relationships, selectedPersonId);
  const { onConnect, onBeforeDelete, confirmDelete, isConfirmOpen, setIsConfirmOpen } = useTreeConnections(persons, isReadOnly, updatePerson, setEdges);
  const setShowCardActions = useStore((state) => state.setShowCardActions);

  return (
    <div className="w-full h-full relative bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          animated: edge.selected,
          style: {
            ...edge.style,
            stroke: edge.selected ? 'var(--primary)' : edge.style?.stroke,
            strokeWidth: edge.selected ? 3 : 2,
          },
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onBeforeDelete={onBeforeDelete}
        onPaneClick={() => setShowCardActions(null)}
        onNodeClick={(_, node) => {
          if (node.type !== 'personNode') setShowCardActions(null);
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        nodesDraggable={false}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Lines} color="var(--color-foreground)" gap={40} size={1} className="opacity-[0.05]" />
        <Controls showInteractive={false} className="bg-background border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)] overflow-hidden !fill-foreground" />
      </ReactFlow>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader variant="destructive">
            <DialogTitle>Xóa kết nối</DialogTitle>
            <DialogDescription>Hành động này không thể hoàn tác</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">Bạn có chắc chắn muốn xóa kết nối này không? Các thông tin quan hệ gia đình liên quan sẽ bị loại bỏ khỏi hồ sơ.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsConfirmOpen(false)}>Hủy</Button>
            <Button variant="destructive" className="flex-1 h-12" onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
