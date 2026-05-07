import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { PersonForm } from '../forms/person-form';
import { Button } from '@/components/ui/button';
import { X, UserPlus, Trash2, Loader2, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { personService } from '@/lib/services/person.service';

export function Sidebar() {
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const persons = useStore((state) => state.persons);
  const currentTree = useStore((state) => state.currentTree);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const removePerson = useStore((state) => state.removePerson);
  const addPersonStore = useStore((state) => state.addPerson);
  const updatePersonStore = useStore((state) => state.updatePerson);

  const [isAddingRelative, setIsAddingRelative] = useState<string | null>(null);
  const [newRelativeName, setNewRelativeName] = useState('');
  const [newRelativeGender, setNewRelativeGender] = useState<'male' | 'female'>('male');
  const [selectedExistingPersonId, setSelectedExistingPersonId] = useState<string>('');

  const person = persons.find(p => p.id === selectedPersonId);
  const personId = person?.id;
  const availablePersons = useMemo(() => {
    if (!isAddingRelative || !personId) return [];
    
    return persons.filter(p => {
      if (p.id === personId) return false;
      
      const isParent = person.father_id === p.id || person.mother_id === p.id;
      const isChild = p.father_id === person.id || p.mother_id === person.id;
      const isSpouse = person.spouse_id === p.id;

      if (isAddingRelative === 'father') {
        if (p.gender !== 'male') return false;
        if (isChild || isSpouse) return false;
        return true;
      }
      
      if (isAddingRelative === 'mother') {
        if (p.gender !== 'female') return false;
        if (isChild || isSpouse) return false;
        return true;
      }
      
      if (isAddingRelative === 'spouse') {
        if (p.spouse_id) return false;
        if (isParent || isChild) return false;
        return true;
      }
      
      if (isAddingRelative === 'child') {
        if (isParent || isSpouse) return false;
        if (person.gender === 'male' && p.father_id) return false;
        if (person.gender === 'female' && p.mother_id) return false;
        return true;
      }
      
      return true;
    });
  }, [isAddingRelative, persons, personId, person]);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedPersonId) return null;

  if (!person || !currentTree) return null;

  const handleDelete = async () => {
    if (isReadOnly) return;
    setIsDeleting(true);

    try {
      await personService.delete(person.id);
      
      removePerson(person.id);
      toast.success('Đã xóa hồ sơ');
      setSelectedPersonId(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error('Lỗi khi xóa: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const submitAddRelative = async () => {
    if (!isAddingRelative || isReadOnly) return;
    
    try {
      if (selectedExistingPersonId) {
        const existingPerson = persons.find(p => p.id === selectedExistingPersonId);
        if (!existingPerson) return;

        if (isAddingRelative === 'father') {
          await personService.addFather(person.id, existingPerson.id);
          updatePersonStore({ ...person, father_id: existingPerson.id });
        } else if (isAddingRelative === 'mother') {
          await personService.addMother(person.id, existingPerson.id);
          updatePersonStore({ ...person, mother_id: existingPerson.id });
        } else if (isAddingRelative === 'spouse') {
          await personService.addSpouse(person.id, existingPerson.id);
          updatePersonStore({ ...person, spouse_id: existingPerson.id });
          updatePersonStore({ ...existingPerson, spouse_id: person.id });
        } else if (isAddingRelative === 'child') {
          if (person.gender === 'male') {
            await personService.addFather(existingPerson.id, person.id);
            updatePersonStore({ ...existingPerson, father_id: person.id });
          }
          if (person.gender === 'female') {
            await personService.addMother(existingPerson.id, person.id);
            updatePersonStore({ ...existingPerson, mother_id: person.id });
          }
          if (person.spouse_id) {
            const spouse = persons.find(p => p.id === person.spouse_id);
            if (spouse && spouse.gender === 'female') {
              await personService.addMother(existingPerson.id, spouse.id);
              updatePersonStore({ ...existingPerson, mother_id: spouse.id });
            }
            if (spouse && spouse.gender === 'male') {
              await personService.addFather(existingPerson.id, spouse.id);
              updatePersonStore({ ...existingPerson, father_id: spouse.id });
            }
          }
        }

        toast.success(`Đã liên kết ${relationshipMap[isAddingRelative]}!`);
      } else {
        const newPersonData: any = {
          tree_id: currentTree.id,
          full_name: newRelativeName || 'Khuyết Danh',
          gender: isAddingRelative === 'father' ? 'male' : 
                  isAddingRelative === 'mother' ? 'female' : 
                  newRelativeGender
        };

        if (isAddingRelative === 'child') {
          if (person.gender === 'male') newPersonData.father_id = person.id;
          else if (person.gender === 'female') newPersonData.mother_id = person.id;
          if (person.spouse_id) {
            const spouse = persons.find(p => p.id === person.spouse_id);
            if (spouse && spouse.gender === 'female') newPersonData.mother_id = spouse.id;
            if (spouse && spouse.gender === 'male') newPersonData.father_id = spouse.id;
          }
        }

        const newPerson = await personService.create(newPersonData);
        addPersonStore(newPerson);

        if (isAddingRelative === 'father') {
          await personService.addFather(person.id, newPerson.id);
          updatePersonStore({ ...person, father_id: newPerson.id });
        } else if (isAddingRelative === 'mother') {
          await personService.addMother(person.id, newPerson.id);
          updatePersonStore({ ...person, mother_id: newPerson.id });
        } else if (isAddingRelative === 'spouse') {
          await personService.addSpouse(person.id, newPerson.id);
          updatePersonStore({ ...person, spouse_id: newPerson.id });
          updatePersonStore({ ...newPerson, spouse_id: person.id });
        }

        setSelectedPersonId(newPerson.id);
        toast.success(`Đã thêm ${isAddingRelative}!`);
      }

      setIsAddingRelative(null);
      setNewRelativeName('');
      setSelectedExistingPersonId('');
      setSelectedPersonId(selectedExistingPersonId || person.id);
    } catch (err: any) {
      toast.error('Lỗi thêm người thân: ' + err.message);
    }
  };

  const relationshipMap: Record<string, string> = {
    father: 'Cha',
    mother: 'Mẹ',
    spouse: 'Vợ/Chồng',
    child: 'Con'
  };

  return (
    <>
      <div className="w-[400px] h-full bg-background border-l-2 border-foreground flex flex-col z-10 absolute right-0 top-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b-2 border-foreground bg-primary/5">
          <div>
            <h2 className="font-serif font-black text-xl uppercase tracking-widest">{isReadOnly ? 'Hồ Sơ' : 'Cập Nhật Hồ Sơ'}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
              ID: {person.id.split('-')[0]}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedPersonId(null)}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
            <PersonForm key={person.id} person={person} isReadOnly={isReadOnly} />
            
            {!isReadOnly && (
              <div className="mt-4 border-t-2 border-foreground pt-4 space-y-4">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-foreground bg-primary/10 inline-block px-2 py-1">Tác Vụ Mở Rộng</h3>
                
                <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
                  <Button variant="ghost" className="justify-start text-[10px]" onClick={() => { setNewRelativeName(''); setSelectedExistingPersonId(''); setIsAddingRelative('father'); }} disabled={!!person.father_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Cha
                  </Button>
                  <Button variant="ghost" className="justify-start text-[10px]" onClick={() => { setNewRelativeName(''); setSelectedExistingPersonId(''); setIsAddingRelative('mother'); }} disabled={!!person.mother_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Mẹ
                  </Button>
                  <Button variant="ghost" className="justify-start text-[10px]" onClick={() => { setNewRelativeName(''); setSelectedExistingPersonId(''); setIsAddingRelative('spouse'); }} disabled={!!person.spouse_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Vợ/Chồng
                  </Button>
                  <Button variant="ghost" className="justify-start text-[10px]" onClick={() => { setNewRelativeName(''); setSelectedExistingPersonId(''); setIsAddingRelative('child'); }}>
                    <UserPlus className="w-4 h-4 mr-2" /> Con
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button variant="destructive" className="w-full text-[10px]" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Hồ Sơ Này
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!isAddingRelative} onOpenChange={(v) => { if (!v) { setIsAddingRelative(null); setNewRelativeName(''); setSelectedExistingPersonId(''); } }}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-primary/5 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">
              Định danh {isAddingRelative ? relationshipMap[isAddingRelative] : ''}
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Liên kết với: {person.full_name}
            </p>
          </div>
          
          <div className="space-y-3 p-4">
            {availablePersons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em]">Chọn từ danh sách có sẵn</Label>
                <Select
                  options={[{ value: '', label: '-- Chọn người --' }, ...availablePersons.map(p => ({ value: p.id, label: p.full_name }))]}
                  value={selectedExistingPersonId}
                  onChange={(val) => { setSelectedExistingPersonId(val); if (val) setNewRelativeName(''); }}
                  placeholder="-- Chọn người --"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-foreground/20"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">hoặc tạo mới</span>
              <div className="flex-1 h-px bg-foreground/20"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={((isAddingRelative === 'child' || isAddingRelative === 'spouse') && !selectedExistingPersonId) ? "col-span-2 space-y-2" : "col-span-3 space-y-2"}>
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em]">Họ và Tên</Label>
                <Input 
                  autoFocus={!selectedExistingPersonId && !availablePersons.length}
                  value={newRelativeName} 
                  onChange={e => { setNewRelativeName(e.target.value); if (e.target.value) setSelectedExistingPersonId(''); }}
                  placeholder="Nhập tên người mới"
                />
              </div>

              {(isAddingRelative === 'child' || isAddingRelative === 'spouse') && !selectedExistingPersonId && (
                <div className="col-span-1 space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em]">Giới Tính</Label>
                  <Select 
                    options={[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' }
                    ]}
                    value={newRelativeGender}
                    onChange={(val) => setNewRelativeGender(val as any)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 h-14 border-r-2" onClick={() => { setIsAddingRelative(null); setNewRelativeName(''); setSelectedExistingPersonId(''); }}>
              Hủy
            </Button>
            <Button className="flex-1 h-14" onClick={submitAddRelative} disabled={!newRelativeName && !selectedExistingPersonId}>
              Ghi Nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">
              Xác Nhận Xóa
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Hành động này không thể hoàn tác
            </p>
          </div>
          
          <div className="p-4">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ của <span className="font-bold">{person.full_name}</span> không? Các liên kết phả hệ liên quan có thể bị đứt gãy.
            </p>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 h-14 border-r-2" onClick={() => setIsDeleteDialogOpen(false)}>
              Giữ Lại
            </Button>
            <Button variant="destructive" className="flex-1 h-14" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chấp Nhận Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
