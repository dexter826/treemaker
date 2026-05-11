import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, Share2, ArrowLeft, UserPlus, Mars, Venus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { personService } from '@/lib/services/person.service';
import { Select } from '@/components/ui/select';
import { treeService } from '@/lib/services/tree.service';
import { useRouter } from 'next/navigation';

export function TreeToolbar() {
  const currentTree = useStore((state) => state.currentTree);
  const persons = useStore((state) => state.persons);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const addPerson = useStore((state) => state.addPerson);
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonGender, setNewPersonGender] = useState<'male' | 'female'>('male');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentTree) return null;

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/share/${currentTree.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết chia sẻ.');
  }, [currentTree.share_token]);

  const handleAddPerson = useCallback(async () => {
    if (!newPersonName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newPerson = await personService.create({
        tree_id: currentTree.id,
        full_name: newPersonName.trim() || 'Khuyết Danh',
        gender: newPersonGender,
        sibling_order: 0,
      });
      addPerson(newPerson);
      setSelectedPersonId(newPerson.id);
      setIsAddPersonOpen(false);
      setNewPersonName('');
      toast.success('Đã thêm hồ sơ mới.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi thêm hồ sơ.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTree.id, addPerson, setSelectedPersonId, newPersonName, newPersonGender, isSubmitting]);

  const handleDeleteTree = async () => {
    setIsDeleting(true);
    try {
      await treeService.delete(currentTree.id);
      toast.success('Đã xóa cây gia phả.');
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa cây.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="absolute top-4 left-4 z-10 flex flex-col md:flex-row items-start md:items-center gap-3"
    >
      <div className="flex items-stretch gap-2">
        <Link href="/" className={buttonVariants({ variant: 'outline', effect: 'raised', className: 'w-12 h-12 px-0 rounded-none' })} aria-label="Quay lại trang chính">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="bg-background border-2 border-foreground px-4 py-2 flex flex-col justify-center shadow-[4px_4px_0px_0px_var(--color-foreground)]">
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Gia phả đang xem</span>
          <h1 className="font-serif font-black text-lg tracking-tight max-w-[220px] truncate">{currentTree.name}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'icon', effect: 'raised', className: 'h-12 w-12 rounded-none' })} aria-label="Tìm kiếm cá nhân">
            <Search className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0 border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)]" align="start">
            <Command className="rounded-none">
              <CommandInput placeholder="Tìm kiếm cá nhân..." className="border-none focus:ring-0" />
              <CommandList>
                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                <CommandGroup>
                  {persons.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={person.full_name}
                      onSelect={() => {
                        setSearchOpen(false);
                        setSelectedPersonId(person.id);
                      }}
                      className="rounded-none cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground font-semibold tracking-wide text-xs py-3"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {person.gender === 'male' ? <Mars className="w-3.5 h-3.5 text-male" /> : <Venus className="w-3.5 h-3.5 text-female" />}
                        <span>{person.full_name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {!isReadOnly && (
          <>
            <Button variant="outline" effect="raised" className="h-12 rounded-none" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </Button>
            <Button variant="outline" effect="raised" className="h-12 rounded-none" onClick={() => setIsAddPersonOpen(true)}>
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm người</span>
            </Button>
            <Button variant="destructive" effect="raised" className="h-12 rounded-none" onClick={() => setIsDeleteDialogOpen(true)}>
              <span className="hidden sm:inline">Xóa cây</span>
            </Button>
          </>
        )}
      </div>

      <Dialog open={isAddPersonOpen} onOpenChange={(v) => !v && setIsAddPersonOpen(false)}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-primary/5 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">Thêm Người Mới</DialogTitle>
            <p className="text-xs font-semibold text-muted-foreground tracking-[0.16em] mt-2">Vào cây: {currentTree.name}</p>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Họ và Tên</Label>
                <Input autoFocus value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()} placeholder="Nhập tên người mới" className="font-semibold" />
              </div>
              <div className="col-span-1 space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Giới Tính</Label>
                <Select
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                  ]}
                  value={newPersonGender}
                  onChange={(val: string) => setNewPersonGender(val as 'male' | 'female')}
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-foreground flex p-4 gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsAddPersonOpen(false)}>
              Hủy
            </Button>
            <Button className="flex-1 h-12" onClick={handleAddPerson} disabled={!newPersonName.trim() || isSubmitting}>
              {isSubmitting ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">Xóa toàn bộ Cây</DialogTitle>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium">Bạn có chắc chắn muốn xóa toàn bộ cây gia phả này không? Mọi dữ liệu sẽ biến mất vĩnh viễn.</p>
          </div>
          <div className="border-t-2 border-foreground flex p-4 gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" className="flex-1 h-12" onClick={handleDeleteTree} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
