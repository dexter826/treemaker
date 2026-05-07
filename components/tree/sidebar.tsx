import { useState } from 'react';
import { useStore } from '../../lib/store';
import { PersonForm } from './person-form';
import { Button } from '../ui/button';
import { X, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { personService } from '../../lib/services/person.service';

export function Sidebar() {
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const persons = useStore((state) => state.persons);
  const currentTree = useStore((state) => state.currentTree);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const removePerson = useStore((state) => state.removePerson);
  const addPersonStore = useStore((state) => state.addPerson);
  const updatePersonStore = useStore((state) => state.updatePerson);

  const [isAddingRelative, setIsAddingRelative] = useState<string | null>(null); // 'father', 'mother', 'spouse', 'child'
  const [newRelativeName, setNewRelativeName] = useState('');
  
  // Dialog state for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedPersonId) return null;

  const person = persons.find(p => p.id === selectedPersonId);
  
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
      const newPersonData: any = {
        tree_id: currentTree.id,
        full_name: newRelativeName || 'Khuyết Danh',
        gender: isAddingRelative === 'father' ? 'male' : isAddingRelative === 'mother' ? 'female' : 'other'
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

      toast.success(`Đã thêm ${isAddingRelative}!`);
      setIsAddingRelative(null);
      setNewRelativeName('');
      setSelectedPersonId(newPerson.id);
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-2 border-transparent hover:border-foreground transition-all cursor-pointer" onClick={() => setSelectedPersonId(null)}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <PersonForm key={person.id} person={person} isReadOnly={isReadOnly} />
            
            {!isReadOnly && (
              <div className="mt-10 border-t-4 border-foreground pt-8 space-y-6">
                <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground bg-primary/10 inline-block px-2 py-1">Tác Vụ Mở Rộng</h3>
                
                <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
                  <Button variant="ghost" className="h-12 justify-start rounded-none border-r-2 border-b-2 border-foreground hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-widest cursor-pointer" onClick={() => setIsAddingRelative('father')} disabled={!!person.father_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Cha
                  </Button>
                  <Button variant="ghost" className="h-12 justify-start rounded-none border-b-2 border-foreground hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-widest cursor-pointer" onClick={() => setIsAddingRelative('mother')} disabled={!!person.mother_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Mẹ
                  </Button>
                  <Button variant="ghost" className="h-12 justify-start rounded-none border-r-2 border-foreground hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-widest cursor-pointer" onClick={() => setIsAddingRelative('spouse')} disabled={!!person.spouse_id}>
                    <UserPlus className="w-4 h-4 mr-2" /> Vợ/Chồng
                  </Button>
                  <Button variant="ghost" className="h-12 justify-start rounded-none border-foreground hover:bg-primary hover:text-primary-foreground font-bold text-[10px] uppercase tracking-widest cursor-pointer" onClick={() => setIsAddingRelative('child')}>
                    <UserPlus className="w-4 h-4 mr-2" /> Con
                  </Button>
                </div>
                
                <div className="pt-6">
                  <Button variant="destructive" className="w-full rounded-none h-12 font-bold uppercase tracking-widest text-[10px] border-2 border-destructive hover:bg-background hover:text-destructive transition-all cursor-pointer" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa Hồ Sơ Này
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Relative Dialog */}
      <Dialog open={!!isAddingRelative} onOpenChange={(v) => !v && setIsAddingRelative(null)}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-primary/5 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">
              Định danh {isAddingRelative ? relationshipMap[isAddingRelative] : ''}
            </DialogTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Liên kết với: {person.full_name}
            </p>
          </div>
          
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em]">Họ và Tên</Label>
              <Input 
                autoFocus
                value={newRelativeName} 
                onChange={e => setNewRelativeName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-bold"
              />
            </div>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 rounded-none h-14 border-r-2 border-foreground font-bold uppercase tracking-widest hover:bg-foreground hover:text-background cursor-pointer" onClick={() => setIsAddingRelative(null)}>
              Hủy
            </Button>
            <Button className="flex-1 rounded-none h-14 bg-primary hover:bg-foreground text-background font-bold uppercase tracking-widest cursor-pointer" onClick={submitAddRelative}>
              Ghi Nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
          
          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ của <span className="font-bold">{person.full_name}</span> không? Các liên kết phả hệ liên quan có thể bị đứt gãy.
            </p>
          </div>
          
          <div className="border-t-2 border-foreground p-0 flex">
            <Button variant="ghost" className="flex-1 rounded-none h-14 border-r-2 border-foreground font-bold uppercase tracking-widest hover:bg-foreground hover:text-background cursor-pointer" onClick={() => setIsDeleteDialogOpen(false)}>
              Giữ Lại
            </Button>
            <Button variant="destructive" className="flex-1 rounded-none h-14 border-2 border-transparent hover:border-destructive font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chấp Nhận Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
