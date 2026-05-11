import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { removeVietnameseTones } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Search, Share2, ArrowLeft, UserPlus, Trash2, Mars, Venus, Loader2, MoreHorizontal } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basePersonSchema } from '@/lib/validations/person';
import * as z from 'zod';

const addPersonSchema = basePersonSchema.pick({ full_name: true, gender: true });
type AddPersonFormValues = z.infer<typeof addPersonSchema>;

export function TreeToolbar() {
  const currentTree = useStore((state) => state.currentTree);
  const persons = useStore((state) => state.persons);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const addPerson = useStore((state) => state.addPerson);
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddPersonFormValues>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: {
      full_name: '',
      gender: 'male',
    },
  });

  const handleShare = useCallback(() => {
    if (!currentTree) return;
    const url = `${window.location.origin}/share/${currentTree.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết chia sẻ.');
  }, [currentTree]);

  const handleAddPerson = async (data: AddPersonFormValues) => {
    if (!currentTree || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newPerson = await personService.create({
        tree_id: currentTree.id,
        full_name: data.full_name.trim(),
        gender: data.gender,
        sibling_order: 0,
      });
      addPerson(newPerson);
      setSelectedPersonId(newPerson.id);
      setIsAddPersonOpen(false);
      reset();
      toast.success('Đã thêm hồ sơ mới.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi thêm hồ sơ.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTree) return null;

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
      className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-auto z-10 flex items-stretch gap-2 md:gap-3"
    >
      <Link href="/" className={buttonVariants({ variant: 'outline', effect: 'raised', className: 'w-10 h-10 md:w-12 md:h-12 px-0 rounded-none shrink-0' })} aria-label="Quay lại trang chính" title="Quay lại trang chính">
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
      </Link>

      <div className="relative group/name flex-1 md:flex-none min-w-0 h-10 md:h-12 border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_var(--color-foreground)] px-2 md:px-4 flex flex-col justify-center">
        <span className="text-[8px] md:text-[10px] font-semibold tracking-wide text-muted-foreground uppercase truncate">Gia phả</span>
        <h1 className="font-serif font-black text-xs md:text-lg tracking-tight truncate leading-tight">{currentTree.name}</h1>
      </div>

      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'icon', effect: 'raised', className: 'h-10 w-10 md:h-12 md:w-12 rounded-none shrink-0' })} aria-label="Tìm kiếm cá nhân" title="Tìm kiếm cá nhân">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-32px)] sm:w-[280px] p-0 border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)]" align="start">
          <Command 
            className="rounded-none"
            filter={(value, search) => {
              const normalizedValue = removeVietnameseTones(value);
              const normalizedSearch = removeVietnameseTones(search);
              if (normalizedValue.includes(normalizedSearch)) return 1;
              return 0;
            }}
          >
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
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-stretch gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              effect="raised" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-none shrink-0" 
              onClick={handleShare}
              title="Chia sẻ liên kết"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              effect="raised" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-none shrink-0" 
              onClick={() => setIsAddPersonOpen(true)}
              title="Thêm người mới"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              effect="raised" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-none shrink-0" 
              onClick={() => setIsDeleteDialogOpen(true)} 
              aria-label="Xóa gia phả"
              title="Xóa toàn bộ cây"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Mobile Actions Menu */}
          <div className="sm:hidden flex items-stretch">
            <Popover>
              <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'icon', effect: 'raised', className: 'h-10 w-10 md:h-12 md:w-12 rounded-none shrink-0' })} aria-label="Thao tác thêm" title="Thêm thao tác">
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)] flex flex-col gap-2" align="end">
                <Button variant="ghost" className="justify-start h-10 px-2 rounded-none text-xs" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button variant="ghost" className="justify-start h-10 px-2 rounded-none text-xs" onClick={() => setIsAddPersonOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm người
                </Button>
                <div className="border-t-2 border-foreground/10 my-1" />
                <Button variant="ghost" className="justify-start h-10 px-2 rounded-none text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa gia phả
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

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
                <Input 
                  autoFocus 
                  {...register('full_name')} 
                  error={!!errors.full_name}
                  placeholder="Nhập tên người mới" 
                  className="font-semibold" 
                />
                {errors.full_name && <p className="text-[10px] text-destructive font-bold uppercase">{errors.full_name.message}</p>}
              </div>
              <div className="col-span-1 space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Giới Tính</Label>
                <Select
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                  ]}
                  value={watch('gender')}
                  onChange={(val: string) => setValue('gender', val as 'male' | 'female', { shouldValidate: true })}
                  error={!!errors.gender}
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-foreground flex p-4 gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsAddPersonOpen(false)}>
              Hủy
            </Button>
            <Button className="flex-1 h-12" onClick={handleSubmit(handleAddPerson)} disabled={isSubmitting}>
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
