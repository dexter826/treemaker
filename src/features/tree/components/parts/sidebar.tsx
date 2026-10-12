import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import {
  X,
  UserPlus,
  Trash2,
  Loader2,
  PanelRightOpen,
  ArrowUp,
  ArrowDown,
  Heart,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PersonForm, personService } from '@/features/person';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { normalizeSiblingOrder } from '@/lib/utils';

type RelativeType = 'father' | 'mother' | 'spouse' | 'child';

export function Sidebar() {
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const persons = useStore((state) => state.persons);
  const relationships = useStore((state) => state.relationships);
  const currentTree = useStore((state) => state.currentTree);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const removePerson = useStore((state) => state.removePerson);
  const addPersonStore = useStore((state) => state.addPerson);
  const updatePersonStore = useStore((state) => state.updatePerson);
  const addRelationship = useStore((state) => state.addRelationship);

  const isMobile = useIsMobile();
  const [isAddingRelative, setIsAddingRelative] = useState<RelativeType | null>(
    null
  );
  const [newRelativeName, setNewRelativeName] = useState('');
  const [newRelativeGender, setNewRelativeGender] = useState<'male' | 'female'>(
    'male'
  );
  const [newRelativeSiblingOrder, setNewRelativeSiblingOrder] = useState(0);
  const [selectedExistingPersonId, setSelectedExistingPersonId] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const person = persons.find((p) => p.id === selectedPersonId);
  const personId = person?.id;

  const getSpouseId = useCallback(
    (pId: string) => {
      const rel = relationships.find(
        (r) => r.person1_id === pId || r.person2_id === pId
      );
      if (!rel) return null;
      return rel.person1_id === pId ? rel.person2_id : rel.person1_id;
    },
    [relationships]
  );

  const availablePersons = useMemo(() => {
    if (!isAddingRelative || !personId || !person) return [];
    return persons.filter((p) => {
      if (p.id === personId) return false;
      const isParent = person.father_id === p.id || person.mother_id === p.id;
      const isChild = p.father_id === person.id || p.mother_id === person.id;
      const currentSpouseId = getSpouseId(personId);
      const isSpouse = currentSpouseId === p.id;

      if (isAddingRelative === 'father')
        return p.gender === 'male' && !isChild && !isSpouse;
      if (isAddingRelative === 'mother')
        return p.gender === 'female' && !isChild && !isSpouse;
      if (isAddingRelative === 'spouse')
        return (
          !getSpouseId(p.id) &&
          !isParent &&
          !isChild &&
          p.gender !== person.gender
        );
      if (isAddingRelative === 'child') {
        if (isParent || isSpouse) return false;
        if (person.gender === 'male' && p.father_id) return false;
        if (person.gender === 'female' && p.mother_id) return false;
      }
      return true;
    });
  }, [isAddingRelative, personId, persons, person, getSpouseId]);

  const childParents = useMemo(() => {
    if (isAddingRelative !== 'child' || !person)
      return {
        fatherId: null as string | null,
        motherId: null as string | null,
      };
    let fatherId: string | null = person.gender === 'male' ? person.id : null;
    let motherId: string | null = person.gender === 'female' ? person.id : null;

    const currentSpouseId = getSpouseId(person.id);
    if (currentSpouseId) {
      const spouse = persons.find((p) => p.id === currentSpouseId);
      if (spouse?.gender === 'male') fatherId = spouse.id;
      if (spouse?.gender === 'female') motherId = spouse.id;
    }
    return { fatherId, motherId };
  }, [isAddingRelative, person, persons, getSpouseId]);

  const hasSiblingOrderConflict = useMemo(() => {
    if (
      isAddingRelative !== 'child' ||
      selectedExistingPersonId ||
      !currentTree
    )
      return false;
    const order = normalizeSiblingOrder(newRelativeSiblingOrder);
    return persons.some(
      (p) =>
        p.tree_id === currentTree.id &&
        p.father_id === childParents.fatherId &&
        p.mother_id === childParents.motherId &&
        normalizeSiblingOrder(p.sibling_order ?? 0) === order
    );
  }, [
    isAddingRelative,
    selectedExistingPersonId,
    newRelativeSiblingOrder,
    childParents,
    persons,
    currentTree,
  ]);

  const resetRelativeState = () => {
    setIsAddingRelative(null);
    setNewRelativeName('');
    setNewRelativeGender('male');
    setNewRelativeSiblingOrder(0);
    setSelectedExistingPersonId('');
  };

  const handleDelete = async () => {
    if (isReadOnly || !person) return;
    setIsDeleting(true);
    try {
      await personService.delete(person.id);
      removePerson(person.id);
      toast.success('Đã xóa hồ sơ.');
      setSelectedPersonId(null);
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi xóa hồ sơ.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const linkChildToParents = async (childId: string, personObj?: Person) => {
    const { fatherId, motherId } = childParents;
    if (fatherId) await personService.linkRelation('father', childId, fatherId);
    if (motherId) await personService.linkRelation('mother', childId, motherId);

    const child = personObj || persons.find((p) => p.id === childId);
    if (child) {
      updatePersonStore({ ...child, father_id: fatherId, mother_id: motherId });
    }
  };

  const submitAddRelative = async () => {
    if (!isAddingRelative || isReadOnly || !person || !currentTree) return;
    if (!selectedExistingPersonId && hasSiblingOrderConflict) {
      toast.error('Thứ tự sinh đã tồn tại trong cùng nhóm anh/chị/em.');
      return;
    }

    try {
      if (selectedExistingPersonId) {
        const existingPerson = persons.find(
          (p) => p.id === selectedExistingPersonId
        );
        if (!existingPerson) return;

        if (isAddingRelative === 'child') {
          await linkChildToParents(existingPerson.id);
        } else {
          const rel = await personService.linkRelation(
            isAddingRelative,
            person.id,
            existingPerson.id
          );
          if (isAddingRelative === 'spouse' && rel) addRelationship(rel);
          if (isAddingRelative === 'father')
            updatePersonStore({ ...person, father_id: existingPerson.id });
          if (isAddingRelative === 'mother')
            updatePersonStore({ ...person, mother_id: existingPerson.id });
        }
        toast.success(`Đã liên kết ${relationshipMap[isAddingRelative]}.`);
      } else {
        const newPersonData = {
          tree_id: currentTree.id,
          full_name: newRelativeName || 'Khuyết Danh',
          gender:
            isAddingRelative === 'father'
              ? 'male'
              : isAddingRelative === 'mother'
                ? 'female'
                : newRelativeGender,
          sibling_order: normalizeSiblingOrder(newRelativeSiblingOrder),
        };

        const newPerson = await personService.create(newPersonData);
        addPersonStore(newPerson);

        if (isAddingRelative === 'child') {
          await linkChildToParents(newPerson.id, newPerson);
        } else {
          const rel = await personService.linkRelation(
            isAddingRelative,
            person.id,
            newPerson.id
          );
          if (isAddingRelative === 'spouse' && rel) addRelationship(rel);
          if (isAddingRelative === 'father')
            updatePersonStore({ ...person, father_id: newPerson.id });
          if (isAddingRelative === 'mother')
            updatePersonStore({ ...person, mother_id: newPerson.id });
        }

        setSelectedPersonId(newPerson.id);
        toast.success(`Đã thêm ${relationshipMap[isAddingRelative]}.`);
      }
      resetRelativeState();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Lỗi khi thêm người thân.'
      );
    }
  };

  const relationshipMap: Record<RelativeType, string> = {
    father: 'Cha',
    mother: 'Mẹ',
    spouse: 'Vợ/Chồng',
    child: 'Con',
  };

  if (!selectedPersonId || !person || !currentTree) return null;

  const panelContent = (
    <>
      <div className="border-foreground bg-primary/5 flex items-center justify-between border-b-2 p-6">
        <div>
          <h2 className="font-serif text-xl font-black tracking-widest uppercase">
            {isReadOnly ? 'Thông tin' : 'Cập nhật'}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs font-semibold tracking-[0.16em] uppercase">
            ID: {person.id.split('-')[0]}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedPersonId(null)}
          aria-label="Đóng hồ sơ"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          <PersonForm key={person.id} person={person} isReadOnly={isReadOnly} />
          {!isReadOnly && (
            <div className="border-foreground mt-4 space-y-4 border-t-2 pt-4">
              <h3 className="text-foreground bg-primary/10 inline-block px-2 py-1 text-xs font-bold tracking-[0.16em] uppercase">
                Thêm người thân
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-12 justify-start"
                  onClick={() => setIsAddingRelative('father')}
                  disabled={!!person.father_id}
                >
                  <ArrowUp className="mr-2 h-4 w-4" /> Cha
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start"
                  onClick={() => setIsAddingRelative('mother')}
                  disabled={!!person.mother_id}
                >
                  <ArrowUp className="mr-2 h-4 w-4" /> Mẹ
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start"
                  onClick={() => {
                    setIsAddingRelative('spouse');
                    setNewRelativeGender(
                      person.gender === 'male' ? 'female' : 'male'
                    );
                  }}
                  disabled={!!getSpouseId(person.id)}
                >
                  <Heart className="mr-2 h-4 w-4" /> Vợ/Chồng
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start"
                  onClick={() => setIsAddingRelative('child')}
                >
                  <ArrowDown className="mr-2 h-4 w-4" /> Con
                </Button>
              </div>
              <Button
                variant="destructive"
                className="h-12 w-full"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa hồ sơ
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Sheet
          open={!!selectedPersonId}
          onOpenChange={(open) => !open && setSelectedPersonId(null)}
        >
          <SheetContent
            side="right"
            showCloseButton={false}
            className="border-foreground w-[92vw] max-w-[460px] border-l-2 p-0"
          >
            <div className="bg-background flex h-full flex-col">
              {panelContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="bg-background border-foreground absolute top-0 right-0 z-50 flex h-full w-[460px] flex-col overflow-hidden border-l-2"
        >
          {panelContent}
        </motion.div>
      )}

      <Dialog
        open={!!isAddingRelative}
        onOpenChange={(v) => !v && resetRelativeState()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Thêm {isAddingRelative ? relationshipMap[isAddingRelative] : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 p-6">
            {availablePersons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Chọn từ danh sách
                </Label>
                <Select
                  options={[
                    { value: '', label: '-- Chọn người --' },
                    ...availablePersons.map((p) => ({
                      value: p.id,
                      label: p.full_name,
                    })),
                  ]}
                  value={selectedExistingPersonId}
                  onChange={(val) => {
                    setSelectedExistingPersonId(val);
                    if (val) setNewRelativeName('');
                  }}
                  placeholder="-- Chọn người --"
                  showSearch={true}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div
                className={
                  (isAddingRelative === 'child' ||
                    isAddingRelative === 'spouse') &&
                  !selectedExistingPersonId
                    ? 'col-span-2 space-y-2'
                    : 'col-span-3 space-y-2'
                }
              >
                <Label className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Họ và Tên
                </Label>
                <Input
                  value={newRelativeName}
                  onChange={(e) => {
                    setNewRelativeName(e.target.value);
                    if (e.target.value) setSelectedExistingPersonId('');
                  }}
                  placeholder="Nhập tên"
                />
              </div>
              {(isAddingRelative === 'child' ||
                isAddingRelative === 'spouse') &&
                !selectedExistingPersonId && (
                  <div className="col-span-1 space-y-2">
                    <Label className="text-xs font-semibold tracking-[0.16em] uppercase">
                      Giới Tính
                    </Label>
                    <Select
                      options={
                        isAddingRelative === 'spouse'
                          ? [
                              {
                                value:
                                  person.gender === 'male' ? 'female' : 'male',
                                label: person.gender === 'male' ? 'Nữ' : 'Nam',
                              },
                            ]
                          : [
                              { value: 'male', label: 'Nam' },
                              { value: 'female', label: 'Nữ' },
                            ]
                      }
                      value={newRelativeGender}
                      onChange={(val) =>
                        setNewRelativeGender(val as 'male' | 'female')
                      }
                      disabled={isAddingRelative === 'spouse'}
                    />
                  </div>
                )}
            </div>

            {!selectedExistingPersonId && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Thứ Tự Sinh
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={newRelativeSiblingOrder}
                  onChange={(e) =>
                    setNewRelativeSiblingOrder(
                      normalizeSiblingOrder(Number(e.target.value))
                    )
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={resetRelativeState}
            >
              Hủy
            </Button>
            <Button
              className="h-12 flex-1"
              onClick={submitAddRelative}
              disabled={
                (!newRelativeName && !selectedExistingPersonId) ||
                hasSiblingOrderConflict
              }
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader variant="destructive">
            <DialogTitle>Xóa hồ sơ</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-medium">
              Bạn có chắc chắn muốn xóa{' '}
              <span className="font-bold">{person.full_name}</span>?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="h-12 flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
