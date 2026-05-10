import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Person } from '@/types';
import { PersonForm } from '../forms/person-form';
import { Button } from '@/components/ui/button';
import { X, UserPlus, Trash2, Loader2, PanelRightOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { personService } from '@/lib/services/person.service';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

type RelativeType = 'father' | 'mother' | 'spouse' | 'child';

const normalizeSiblingOrder = (value: number): number => Math.max(0, Math.floor(value || 0));

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
  const [isAddingRelative, setIsAddingRelative] = useState<RelativeType | null>(null);
  const [newRelativeName, setNewRelativeName] = useState('');
  const [newRelativeGender, setNewRelativeGender] = useState<'male' | 'female'>('male');
  const [newRelativeSiblingOrder, setNewRelativeSiblingOrder] = useState(0);
  const [selectedExistingPersonId, setSelectedExistingPersonId] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const person = persons.find((p) => p.id === selectedPersonId);
  const personId = person?.id;

  // Helper to check if someone is a spouse
  const getSpouseId = (pId: string) => {
    const rel = relationships.find(r => r.person1_id === pId || r.person2_id === pId);
    if (!rel) return null;
    return rel.person1_id === pId ? rel.person2_id : rel.person1_id;
  };

  const availablePersons = useMemo(() => {
    if (!isAddingRelative || !personId || !person) return [];
    return persons.filter((p) => {
      if (p.id === personId) return false;
      const isParent = person.father_id === p.id || person.mother_id === p.id;
      const isChild = p.father_id === person.id || p.mother_id === person.id;
      const currentSpouseId = getSpouseId(personId);
      const isSpouse = currentSpouseId === p.id;
      
      if (isAddingRelative === 'father') return p.gender === 'male' && !isChild && !isSpouse;
      if (isAddingRelative === 'mother') return p.gender === 'female' && !isChild && !isSpouse;
      if (isAddingRelative === 'spouse') return !getSpouseId(p.id) && !isParent && !isChild && p.gender !== person.gender;
      if (isAddingRelative === 'child') {
        if (isParent || isSpouse) return false;
        if (person.gender === 'male' && p.father_id) return false;
        if (person.gender === 'female' && p.mother_id) return false;
      }
      return true;
    });
  }, [isAddingRelative, personId, persons, person, relationships]);

  const childParents = useMemo(() => {
    if (isAddingRelative !== 'child' || !person) return { fatherId: null as string | null, motherId: null as string | null };
    let fatherId: string | null = person.gender === 'male' ? person.id : null;
    let motherId: string | null = person.gender === 'female' ? person.id : null;

    const currentSpouseId = getSpouseId(person.id);
    if (currentSpouseId) {
      const spouse = persons.find((p) => p.id === currentSpouseId);
      if (spouse?.gender === 'male') fatherId = spouse.id;
      if (spouse?.gender === 'female') motherId = spouse.id;
    }
    return { fatherId, motherId };
  }, [isAddingRelative, person, persons, relationships]);

  const hasSiblingOrderConflict = useMemo(() => {
    if (isAddingRelative !== 'child' || selectedExistingPersonId || !currentTree) return false;
    const order = normalizeSiblingOrder(newRelativeSiblingOrder);
    return persons.some(
      (p) =>
        p.tree_id === currentTree.id &&
        p.father_id === childParents.fatherId &&
        p.mother_id === childParents.motherId &&
        normalizeSiblingOrder(p.sibling_order ?? 0) === order,
    );
  }, [isAddingRelative, selectedExistingPersonId, newRelativeSiblingOrder, childParents, persons, currentTree]);

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
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xóa hồ sơ.');
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
        const existingPerson = persons.find((p) => p.id === selectedExistingPersonId);
        if (!existingPerson) return;

        if (isAddingRelative === 'child') {
          await linkChildToParents(existingPerson.id);
        } else {
          const rel = await personService.linkRelation(isAddingRelative, person.id, existingPerson.id);
          if (isAddingRelative === 'spouse' && rel) addRelationship(rel);
          if (isAddingRelative === 'father') updatePersonStore({ ...person, father_id: existingPerson.id });
          if (isAddingRelative === 'mother') updatePersonStore({ ...person, mother_id: existingPerson.id });
        }
        toast.success(`Đã liên kết ${relationshipMap[isAddingRelative]}.`);
      } else {
        const newPersonData = {
          tree_id: currentTree.id,
          full_name: newRelativeName || 'Khuyết Danh',
          gender: isAddingRelative === 'father' ? 'male' : (isAddingRelative === 'mother' ? 'female' : newRelativeGender),
          sibling_order: normalizeSiblingOrder(newRelativeSiblingOrder),
        };

        const newPerson = await personService.create(newPersonData);
        addPersonStore(newPerson);

        if (isAddingRelative === 'child') {
          await linkChildToParents(newPerson.id, newPerson);
        } else {
          const rel = await personService.linkRelation(isAddingRelative, person.id, newPerson.id);
          if (isAddingRelative === 'spouse' && rel) addRelationship(rel);
          if (isAddingRelative === 'father') updatePersonStore({ ...person, father_id: newPerson.id });
          if (isAddingRelative === 'mother') updatePersonStore({ ...person, mother_id: newPerson.id });
        }

        setSelectedPersonId(newPerson.id);
        toast.success(`Đã thêm ${relationshipMap[isAddingRelative]}.`);
      }
      resetRelativeState();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Lỗi khi thêm người thân.');
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
      <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-primary/5">
        <div>
          <h2 className="font-serif font-black text-xl uppercase tracking-widest">{isReadOnly ? 'Hồ Sơ' : 'Cập Nhật Hồ Sơ'}</h2>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em] mt-1">ID: {person.id.split('-')[0]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedPersonId(null)} aria-label="Đóng hồ sơ">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          <PersonForm key={person.id} person={person} isReadOnly={isReadOnly} />
          {!isReadOnly && (
            <div className="mt-4 border-t-2 border-foreground pt-4 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-[0.16em] text-foreground bg-primary/10 inline-block px-2 py-1">Tác Vụ Mở Rộng</h3>
              <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
                <Button variant="ghost" className="justify-start text-xs" onClick={() => setIsAddingRelative('father')} disabled={!!person.father_id}><UserPlus className="w-4 h-4 mr-2" /> Cha</Button>
                <Button variant="ghost" className="justify-start text-xs" onClick={() => setIsAddingRelative('mother')} disabled={!!person.mother_id}><UserPlus className="w-4 h-4 mr-2" /> Mẹ</Button>
                <Button variant="ghost" className="justify-start text-xs" onClick={() => {
                  setIsAddingRelative('spouse');
                  setNewRelativeGender(person.gender === 'male' ? 'female' : 'male');
                }} disabled={!!getSpouseId(person.id)}><UserPlus className="w-4 h-4 mr-2" /> Vợ/Chồng</Button>
                <Button variant="ghost" className="justify-start text-xs" onClick={() => setIsAddingRelative('child')}><UserPlus className="w-4 h-4 mr-2" /> Con</Button>
              </div>
              <div className="pt-4">
                <Button variant="destructive" className="w-full text-xs" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa Hồ Sơ Này
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={!!selectedPersonId} onOpenChange={(open) => !open && setSelectedPersonId(null)}>
          <SheetContent side="right" showCloseButton={false} className="w-[92vw] max-w-[460px] p-0 border-l-2 border-foreground">
            <div className="h-full bg-background flex flex-col">{panelContent}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-[400px] h-full bg-background border-l-2 border-foreground flex flex-col z-10 absolute right-0 top-0 overflow-hidden">
          {panelContent}
        </div>
      )}

      <Dialog open={!!isAddingRelative} onOpenChange={(v) => !v && resetRelativeState()}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-primary/5 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">Định Danh {isAddingRelative ? relationshipMap[isAddingRelative] : ''}</DialogTitle>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em] mt-2">Liên kết với: {person.full_name}</p>
          </div>

          <div className="space-y-3 p-4">
            {availablePersons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em]">Chọn từ danh sách có sẵn</Label>
                <Select
                  options={[{ value: '', label: '-- Chọn người --' }, ...availablePersons.map((p) => ({ value: p.id, label: p.full_name }))]}
                  value={selectedExistingPersonId}
                  onChange={(val) => {
                    setSelectedExistingPersonId(val);
                    if (val) setNewRelativeName('');
                  }}
                  placeholder="-- Chọn người --"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-foreground/20" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">hoặc tạo mới</span>
              <div className="flex-1 h-px bg-foreground/20" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={((isAddingRelative === 'child' || isAddingRelative === 'spouse') && !selectedExistingPersonId) ? 'col-span-2 space-y-2' : 'col-span-3 space-y-2'}>
                <Label className="text-xs font-semibold uppercase tracking-[0.16em]">Họ và Tên</Label>
                <Input
                  autoFocus={!selectedExistingPersonId && !availablePersons.length}
                  value={newRelativeName}
                  onChange={(e) => {
                    setNewRelativeName(e.target.value);
                    if (e.target.value) setSelectedExistingPersonId('');
                  }}
                  placeholder="Nhập tên người mới"
                />
              </div>
              {(isAddingRelative === 'child' || isAddingRelative === 'spouse') && !selectedExistingPersonId && (
                <div className="col-span-1 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.16em]">Giới Tính</Label>
                  <Select
                    options={isAddingRelative === 'spouse' 
                      ? [{ value: person.gender === 'male' ? 'female' : 'male', label: person.gender === 'male' ? 'Nữ' : 'Nam' }]
                      : [{ value: 'male', label: 'Nam' }, { value: 'female', label: 'Nữ' }]
                    }
                    value={newRelativeGender}
                    onChange={(val) => setNewRelativeGender(val as 'male' | 'female')}
                    disabled={isAddingRelative === 'spouse'}
                  />
                </div>
              )}
            </div>

            {!selectedExistingPersonId && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em]">Thứ Tự Sinh</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={newRelativeSiblingOrder}
                  onChange={(e) => setNewRelativeSiblingOrder(normalizeSiblingOrder(Number(e.target.value)))}
                  className="font-bold"
                />
                {hasSiblingOrderConflict && <p className="text-xs text-destructive font-medium">Thứ tự sinh đã tồn tại trong nhóm con cùng cha/mẹ.</p>}
              </div>
            )}
          </div>

          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 h-14 border-r-2" onClick={resetRelativeState}>Hủy</Button>
            <Button className="flex-1 h-14" onClick={submitAddRelative} disabled={(!newRelativeName && !selectedExistingPersonId) || hasSiblingOrderConflict}>Ghi Nhận</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">Xác Nhận Xóa</DialogTitle>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em] mt-2">Hành động này không thể hoàn tác</p>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium leading-relaxed">Bạn có chắc chắn muốn xóa hồ sơ của <span className="font-bold">{person.full_name}</span> không?</p>
          </div>
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 h-14 border-r-2" onClick={() => setIsDeleteDialogOpen(false)}>Giữ Lại</Button>
            <Button variant="destructive" className="flex-1 h-14" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chấp Nhận Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
