import { useMemo, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import {
  X,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Heart,
  UserPlus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PersonForm, personService } from '@/features/person';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { normalizeSiblingOrder } from '@/lib/utils';

type RelativeType = 'father' | 'mother' | 'spouse' | 'child';

const relationshipMap: Record<RelativeType, string> = {
  father: 'cha',
  mother: 'mẹ',
  spouse: 'vợ/chồng',
  child: 'con',
};

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
  const [isSubmittingRelative, setIsSubmittingRelative] = useState(false);
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
    if (isSubmittingRelative) return;
    if (!selectedExistingPersonId && hasSiblingOrderConflict) {
      toast.error('Thứ tự sinh đã tồn tại trong cùng nhóm anh/chị/em.');
      return;
    }

    setIsSubmittingRelative(true);
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
    } finally {
      setIsSubmittingRelative(false);
    }
  };

  if (!selectedPersonId || !person || !currentTree) return null;

  const panelContent = (
    <>
      <div className="border-border-default bg-surface flex items-start justify-between gap-3 border-b px-6 py-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-name-person-lg truncate">{person.full_name}</h2>
          <p className="text-text-secondary text-caption">
            {isReadOnly ? 'Hồ sơ chỉ đọc' : 'Cập nhật hồ sơ'}
          </p>
        </div>
        <Button
          variant="inset"
          size="icon"
          onClick={() => setSelectedPersonId(null)}
          aria-label="Đóng hồ sơ"
        >
          <X />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-6">
          <PersonForm key={person.id} person={person} isReadOnly={isReadOnly} />

          {!isReadOnly && (
            <div className="border-border-default flex flex-col gap-3 border-t pt-5">
              <h3 className="text-title-md font-semibold">Thêm người thân</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="justify-start"
                  onClick={() => setIsAddingRelative('father')}
                  disabled={!!person.father_id}
                >
                  <ArrowUp /> Cha
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start"
                  onClick={() => setIsAddingRelative('mother')}
                  disabled={!!person.mother_id}
                >
                  <ArrowUp /> Mẹ
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start"
                  onClick={() => {
                    setIsAddingRelative('spouse');
                    setNewRelativeGender(
                      person.gender === 'male' ? 'female' : 'male'
                    );
                  }}
                  disabled={!!getSpouseId(person.id)}
                >
                  <Heart /> Vợ/chồng
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start"
                  onClick={() => setIsAddingRelative('child')}
                >
                  <ArrowDown /> Con
                </Button>
              </div>
              <Button
                variant="danger"
                className="mt-2 w-full"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 /> Xóa hồ sơ
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  const relativeDialog = (
    <Dialog
      open={!!isAddingRelative}
      onOpenChange={(v) => !v && resetRelativeState()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Thêm {isAddingRelative ? relationshipMap[isAddingRelative] : ''}
          </DialogTitle>
          <DialogDescription>
            Chọn người đã có trong gia phả, hoặc nhập hồ sơ mới.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {availablePersons.length > 0 && (
            <Field>
              <FieldLabel htmlFor="relative-existing">
                Chọn từ danh sách
              </FieldLabel>
              <Select
                options={[
                  { value: '', label: 'Chọn người' },
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
                placeholder="Chọn người"
                showSearch
              />
            </Field>
          )}

          {!selectedExistingPersonId && (
            <div className="grid grid-cols-3 gap-3">
              <Field
                className={
                  (isAddingRelative === 'child' ||
                    isAddingRelative === 'spouse') &&
                  !selectedExistingPersonId
                    ? 'col-span-2'
                    : 'col-span-3'
                }
              >
                <FieldLabel htmlFor="relative-name">Họ và tên</FieldLabel>
                <Input
                  id="relative-name"
                  value={newRelativeName}
                  onChange={(e) => {
                    setNewRelativeName(e.target.value);
                    if (e.target.value) setSelectedExistingPersonId('');
                  }}
                  placeholder="Nhập tên"
                />
              </Field>
              {(isAddingRelative === 'child' ||
                isAddingRelative === 'spouse') && (
                <Field>
                  <FieldLabel htmlFor="relative-gender">Giới tính</FieldLabel>
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
                </Field>
              )}
            </div>
          )}

          {!selectedExistingPersonId && isAddingRelative === 'child' && (
            <Field>
              <FieldLabel htmlFor="relative-order">Thứ tự sinh</FieldLabel>
              <Input
                id="relative-order"
                type="number"
                min={0}
                value={newRelativeSiblingOrder}
                onChange={(e) =>
                  setNewRelativeSiblingOrder(
                    normalizeSiblingOrder(Number(e.target.value))
                  )
                }
              />
            </Field>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={resetRelativeState}>
            Đóng
          </Button>
          <Button
            onClick={submitAddRelative}
            disabled={
              isSubmittingRelative ||
              (!newRelativeName && !selectedExistingPersonId) ||
              hasSiblingOrderConflict
            }
            aria-busy={isSubmittingRelative}
          >
            {isSubmittingRelative ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus />
            )}
            Thêm người thân
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const deleteDialog = (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa hồ sơ</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-body-sm">
            <span className="font-semibold">{person.full_name}</span> sẽ bị gỡ
            khỏi gia phả cùng mọi mối quan hệ liên quan.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Giữ lại hồ sơ
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting && <Loader2 className="animate-spin" />}
            Xóa hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Sheet
          open={!!selectedPersonId}
          onOpenChange={(open) => !open && setSelectedPersonId(null)}
        >
          <SheetContent
            side="right"
            showCloseButton={false}
            className="gap-0 p-0"
          >
            <div className="bg-surface flex h-full flex-col">
              {panelContent}
            </div>
          </SheetContent>
        </Sheet>

        {relativeDialog}
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <aside className="border-border-default bg-surface flex h-full w-[420px] shrink-0 flex-col overflow-hidden border-l">
        {panelContent}
      </aside>

      {relativeDialog}
      {deleteDialog}
    </>
  );
}
