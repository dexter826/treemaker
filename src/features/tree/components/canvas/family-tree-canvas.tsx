import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { PersonNode } from './person-node';
import { MarriageNode } from './marriage-node';
import { useTreeFlow } from '../../hooks/use-tree-flow';
import { useTreeConnections } from '../../hooks/use-tree-connections';
import { FamilyEdge } from './family-edge';
import { CANVAS_ZOOM } from '../../constants';

const nodeTypes = {
  personNode: PersonNode,
  marriageNode: MarriageNode,
};

const edgeTypes = {
  familyEdge: FamilyEdge,
};

export function FamilyTreeCanvas() {
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const updatePerson = useStore((state) => state.updatePerson);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);

  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useTreeFlow(
    persons,
    relationships,
    selectedPersonId
  );
  const {
    onConnect,
    onBeforeDelete,
    confirmDelete,
    isConfirmOpen,
    setIsConfirmOpen,
  } = useTreeConnections(persons, isReadOnly, updatePerson, setEdges);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onBeforeDelete={onBeforeDelete}
        onPaneClick={() => setSelectedPersonId(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        nodesDraggable={false}
        fitView
        minZoom={CANVAS_ZOOM.min}
        maxZoom={CANVAS_ZOOM.max}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Lines}
          color="var(--color-border-default)"
          gap={40}
          size={1}
        />
      </ReactFlow>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa kết nối</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body-sm">
              Bạn có chắc chắn muốn xóa kết nối này không? Các thông tin quan hệ
              gia đình liên quan sẽ bị loại bỏ khỏi hồ sơ.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
              Giữ lại kết nối
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Xóa kết nối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
