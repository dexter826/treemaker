import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { removeVietnameseTones } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Search,
  Share2,
  ArrowLeft,
  UserPlus,
  Trash2,
  Mars,
  Venus,
  Loader2,
  MoreHorizontal,
  CalendarDays,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { treeService } from '../../services/tree.service';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treeSchema, TreeFormValues } from '../../validations/tree';
import {
  personService,
  addPersonSchema,
  type AddPersonFormValues,
} from '@/features/person';
import { EventListModal } from '../modals/event-list-modal';
import { pdfService } from '../../services/pdf.service';
import { BookOpen } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

// Thanh công cụ điều khiển cây gia phả.
export function TreeToolbar() {
  const currentTree = useStore((state) => state.currentTree);
  const persons = useStore((state) => state.persons);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const addPerson = useStore((state) => state.addPerson);
  const setCurrentTree = useStore((state) => state.setCurrentTree);
  const relationships = useStore((state) => state.relationships);
  const router = useRouter();
  const { fitView } = useReactFlow();

  const [searchOpen, setSearchOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditTreeOpen, setIsEditTreeOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
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
      const message =
        error instanceof Error ? error.message : 'Lỗi khi thêm hồ sơ.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    setValue: setEditValue,
  } = useForm<TreeFormValues>({
    resolver: zodResolver(treeSchema),
    defaultValues: {
      name: currentTree?.name || '',
    },
  });

  const handleEditTree = async (data: TreeFormValues) => {
    if (!currentTree || isSubmittingEdit) return;

    setIsSubmittingEdit(true);
    try {
      const updatedTree = await treeService.update(currentTree.id, {
        name: data.name.trim(),
      });
      setCurrentTree(updatedTree);
      setIsEditTreeOpen(false);
      toast.success('Đã cập nhật tên gia phả.');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi khi cập nhật tên.';
      toast.error(message);
    } finally {
      setIsSubmittingEdit(false);
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
      const message =
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa cây.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentTree || isExporting) return;

    const treeElement = document.querySelector('.react-flow') as HTMLElement;
    if (!treeElement) {
      toast.error('Không tìm thấy sơ đồ cây để xuất.');
      return;
    }

    setIsExportConfirmOpen(false);
    setIsExporting(true);
    const loadingToast = toast.loading('Đang khởi tạo Gia Phả...');

    try {
      await fitView({ padding: 0.2, duration: 400 });
      await new Promise((resolve) => setTimeout(resolve, 600));

      await pdfService.generateLegacyBook(
        {
          tree: currentTree,
          persons,
          relationships,
        },
        treeElement,
        (current, total) => {
          toast.loading(`Đang xử lý: Trang ${current} / ${total}`, {
            id: loadingToast,
          });
        }
      );
      toast.success('Đã xuất bản Gia Phả thành công!', { id: loadingToast });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi khi xuất PDF.';
      toast.error(message, { id: loadingToast });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="absolute top-3 right-3 left-3 z-10 flex items-stretch gap-2 md:top-4 md:right-auto md:left-4 md:gap-3"
    >
      <Link
        href="/"
        className={buttonVariants({
          variant: 'outline',
          size: 'icon',
          effect: 'raised',
          className: 'h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12',
        })}
        aria-label="Quay lại trang chính"
        title="Quay lại trang chính"
      >
        <ArrowLeft className="size-4 md:size-5" />
      </Link>

      <div
        className={`group/name border-foreground bg-background shadow-brutal-md relative flex h-10 min-w-0 flex-1 flex-col justify-center border-2 px-2 md:h-12 md:flex-none md:px-4 ${!isReadOnly ? 'hover:bg-foreground/[0.02] cursor-pointer' : ''}`}
        onClick={() => {
          if (!isReadOnly) {
            setEditValue('name', currentTree.name);
            setIsEditTreeOpen(true);
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="text-muted-foreground truncate text-[8px] font-semibold tracking-wide uppercase md:text-[10px]">
              Gia phả
            </span>
            <h1 className="truncate font-serif text-xs leading-tight font-black tracking-tight md:text-lg">
              {currentTree.name}
            </h1>
          </div>
          {!isReadOnly && (
            <Pencil className="text-muted-foreground group-hover/name:text-primary size-3 shrink-0 transition-colors md:size-3.5" />
          )}
        </div>
      </div>

      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger
          className={buttonVariants({
            variant: 'outline',
            size: 'icon',
            effect: 'raised',
            className: 'h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12',
          })}
          aria-label="Tìm kiếm cá nhân"
          title="Tìm kiếm cá nhân"
        >
          <Search className="size-4 md:size-5" />
        </PopoverTrigger>
        <PopoverContent
          className="border-foreground shadow-brutal-md w-[calc(100vw-32px)] rounded-none border-2 p-0 sm:w-[280px]"
          align="start"
        >
          <Command
            className="rounded-none"
            filter={(value, search) => {
              const normalizedValue = removeVietnameseTones(value);
              const normalizedSearch = removeVietnameseTones(search);
              if (normalizedValue.includes(normalizedSearch)) return 1;
              return 0;
            }}
          >
            <CommandInput
              placeholder="Tìm kiếm cá nhân..."
              className="border-none focus:ring-0"
            />
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
                    className="aria-selected:bg-primary aria-selected:text-primary-foreground cursor-pointer rounded-none py-3 text-xs font-semibold tracking-wide"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      {person.gender === 'male' ? (
                        <Mars className="text-male h-3.5 w-3.5" />
                      ) : (
                        <Venus className="text-female h-3.5 w-3.5" />
                      )}
                      <span>{person.full_name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        effect="raised"
        className="hidden h-10 w-10 shrink-0 rounded-none sm:flex md:h-12 md:w-12"
        onClick={() => setIsEventListOpen(true)}
        title="Danh mục sự kiện"
      >
        <CalendarDays className="size-4 md:size-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        effect="raised"
        className="hidden h-10 w-10 shrink-0 rounded-none sm:flex md:h-12 md:w-12"
        onClick={() => setIsExportConfirmOpen(true)}
        disabled={isExporting}
        title="Xuất Gia Phả (PDF)"
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin md:size-5" />
        ) : (
          <BookOpen className="size-4 md:size-5" />
        )}
      </Button>

      {!isReadOnly ? (
        <>
          {/* Desktop Actions */}
          <div className="hidden items-stretch gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              effect="raised"
              className="h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12"
              onClick={handleShare}
              title="Chia sẻ liên kết"
            >
              <Share2 className="size-4 md:size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              effect="raised"
              className="h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12"
              onClick={() => setIsAddPersonOpen(true)}
              title="Thêm người mới"
            >
              <UserPlus className="size-4 md:size-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              effect="raised"
              className="h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Xóa gia phả"
              title="Xóa toàn bộ cây"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Mobile Actions Menu */}
          <div className="flex items-stretch sm:hidden">
            <Popover>
              <PopoverTrigger
                className={buttonVariants({
                  variant: 'outline',
                  size: 'icon',
                  effect: 'raised',
                  className: 'h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12',
                })}
                aria-label="Thao tác thêm"
                title="Thêm thao tác"
              >
                <MoreHorizontal className="size-4 md:size-5" />
              </PopoverTrigger>
              <PopoverContent
                className="border-foreground shadow-brutal-md flex w-48 flex-col gap-2 rounded-none border-2 p-2"
                align="end"
              >
                <Button
                  variant="ghost"
                  className="h-10 justify-start rounded-none px-2 text-xs"
                  onClick={() => setIsEventListOpen(true)}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Sự kiện
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 justify-start rounded-none px-2 text-xs"
                  onClick={() => setIsExportConfirmOpen(true)}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  Xuất Gia Phả
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 justify-start rounded-none px-2 text-xs"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Chia sẻ
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 justify-start rounded-none px-2 text-xs"
                  onClick={() => setIsAddPersonOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Thêm người
                </Button>
                <div className="border-foreground/10 my-1 border-t-2" />
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 justify-start rounded-none px-2 text-xs"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa gia phả
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <div className="flex items-stretch sm:hidden">
          <Button
            variant="outline"
            size="icon"
            effect="raised"
            className="h-10 w-10 shrink-0 rounded-none md:h-12 md:w-12"
            onClick={() => setIsEventListOpen(true)}
            title="Danh mục sự kiện"
          >
            <CalendarDays className="size-4 md:size-5" />
          </Button>
        </div>
      )}

      <Dialog
        open={isAddPersonOpen}
        onOpenChange={(v) => !v && setIsAddPersonOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Người Mới</DialogTitle>
            <DialogDescription>Vào cây: {currentTree.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">
                  Họ và Tên
                </Label>
                <Input
                  autoFocus
                  {...register('full_name')}
                  error={!!errors.full_name}
                  placeholder="Nhập tên người mới"
                  className="font-semibold"
                />
                {errors.full_name && (
                  <p className="text-destructive text-[10px] font-bold uppercase">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">
                  Giới Tính
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: 'male', label: 'Nam' },
                        { value: 'female', label: 'Nữ' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.gender}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setIsAddPersonOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="h-12 flex-1"
              onClick={handleSubmit(handleAddPerson)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader variant="destructive">
            <DialogTitle>Xóa toàn bộ Cây</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-medium">
              Bạn có chắc chắn muốn xóa toàn bộ cây gia phả này không? Mọi dữ
              liệu sẽ biến mất vĩnh viễn.
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
              onClick={handleDeleteTree}
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

      <Dialog open={isEditTreeOpen} onOpenChange={setIsEditTreeOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitEdit(handleEditTree)}>
            <DialogHeader>
              <DialogTitle>Sửa Tên Gia Phả</DialogTitle>
              <DialogDescription>
                Cập nhật tên mới cho cây gia phả này
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">
                  Tên Cây Gia Phả
                </Label>
                <Input
                  autoFocus
                  {...registerEdit('name')}
                  error={!!editErrors.name}
                  placeholder="Nhập tên mới"
                  className="font-semibold"
                />
                {editErrors.name && (
                  <p className="text-destructive text-[10px] font-bold uppercase">
                    {editErrors.name.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1"
                onClick={() => setIsEditTreeOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1"
                disabled={isSubmittingEdit}
              >
                {isSubmittingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <EventListModal
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
      />

      <Dialog open={isExportConfirmOpen} onOpenChange={setIsExportConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xuất bản Gia Phả</DialogTitle>
            <DialogDescription>
              Bao gồm sơ đồ và hồ sơ thành viên.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            <div className="bg-muted/50 border-foreground/10 space-y-2 border-2 p-4">
              <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Lưu ý:
              </p>
              <ul className="text-foreground/80 list-inside list-disc space-y-1 text-xs font-medium">
                <li>Sơ đồ sẽ tự động được căn giữa.</li>
                <li>Vui lòng giữ trình duyệt cho đến khi hoàn tất.</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setIsExportConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="h-12 flex-1"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="mr-2 h-4 w-4" />
              )}
              Xuất ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
