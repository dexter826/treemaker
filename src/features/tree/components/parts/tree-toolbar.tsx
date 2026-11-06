import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
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
  CalendarDays,
  Pencil,
  ZoomIn,
  ZoomOut,
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
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
import { ANIMATION_DURATION, ANIMATION_DELAY } from '../../constants';

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
  const { fitView, zoomIn, zoomOut } = useReactFlow();

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
      await fitView({
        padding: 0.2,
        duration: ANIMATION_DURATION.CANVAS_FIT_VIEW,
      });
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
      transition={{
        duration: ANIMATION_DURATION.OVERLAY / 1000,
        delay: ANIMATION_DELAY.TOOLBAR_ENTRANCE,
      }}
      className="absolute top-3 right-3 left-3 z-10 flex items-stretch gap-2 md:top-4 md:right-auto md:left-4 md:gap-3"
    >
      <Link
        href="/"
        className={buttonVariants({
          variant: 'secondary',
          size: 'icon',
          className: 'shrink-0',
        })}
        aria-label="Quay lại trang chính"
        title="Quay lại trang chính"
      >
        <ArrowLeft className="size-4 md:size-5" />
      </Link>

      <div
        className={`group/name border-border-default bg-surface-elevated relative flex h-12 min-w-0 flex-1 flex-col justify-center border px-4 md:flex-none ${!isReadOnly ? 'hover:bg-primary-soft cursor-pointer' : ''}`}
        onClick={() => {
          if (!isReadOnly) {
            setEditValue('name', currentTree.name);
            setIsEditTreeOpen(true);
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="text-text-secondary text-meta md:text-meta truncate font-semibold">
              Gia phả
            </span>
            <h1 className="text-caption truncate font-serif leading-tight font-semibold md:text-lg">
              {currentTree.name}
            </h1>
          </div>
          {!isReadOnly && (
            <Pencil className="text-text-secondary group-hover/name:text-primary size-3 shrink-0 transition-colors md:size-3.5" />
          )}
        </div>
      </div>

      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger
          className={buttonVariants({
            variant: 'secondary',
            size: 'icon',
            className: 'shrink-0',
          })}
          aria-label="Tìm kiếm cá nhân"
          title="Tìm kiếm cá nhân"
        >
          <Search className="size-4 md:size-5" />
        </PopoverTrigger>
        <PopoverContent
          className="border-border-default rounded-card w-[calc(100vw-32px)] border p-0 sm:w-[280px]"
          align="start"
        >
          <Command
            className="rounded-card"
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
                    className="aria-selected:bg-selected aria-selected:text-on-selected rounded-card text-caption cursor-pointer py-3 font-semibold"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      {person.gender === 'male' ? (
                        <Mars className="text-gender-male h-3.5 w-3.5" />
                      ) : (
                        <Venus className="text-gender-female h-3.5 w-3.5" />
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
        variant="secondary"
        size="icon"
        className="shrink-0"
        aria-label="Phóng to"
        title="Phóng to"
        onClick={() => zoomIn({ duration: ANIMATION_DURATION.CANVAS_LAYOUT })}
      >
        <ZoomIn className="size-4 md:size-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="shrink-0"
        aria-label="Thu nhỏ"
        title="Thu nhỏ"
        onClick={() => zoomOut({ duration: ANIMATION_DURATION.CANVAS_LAYOUT })}
      >
        <ZoomOut className="size-4 md:size-5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="hidden shrink-0"
        onClick={() => setIsEventListOpen(true)}
        title="Danh mục sự kiện"
      >
        <CalendarDays className="size-4 md:size-5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="hidden shrink-0"
        onClick={() => setIsExportConfirmOpen(true)}
        disabled={isExporting}
        aria-busy={isExporting}
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
              variant="secondary"
              size="icon"
              className="rounded-card shrink-0 md:h-12 md:w-12"
              onClick={handleShare}
              title="Chia sẻ liên kết"
            >
              <Share2 className="size-4 md:size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-card shrink-0 md:h-12 md:w-12"
              onClick={() => setIsAddPersonOpen(true)}
              title="Thêm người mới"
            >
              <UserPlus className="size-4 md:size-5" />
            </Button>
            <Button
              variant="danger"
              size="icon"
              className="rounded-card shrink-0 md:h-12 md:w-12"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Xóa gia phả"
              title="Xóa toàn bộ cây"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-stretch sm:hidden">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-card shrink-0 md:h-12 md:w-12"
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
            <DialogTitle>Thêm người mới</DialogTitle>
            <DialogDescription>
              Người mới được thêm vào &ldquo;{currentTree.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-3 gap-3">
              <Field className="col-span-2">
                <FieldLabel htmlFor="new-person-name">Họ và tên</FieldLabel>
                <Input
                  id="new-person-name"
                  autoFocus
                  {...register('full_name')}
                  error={!!errors.full_name}
                  placeholder="Nhập tên người mới"
                />
                <FieldError>{errors.full_name?.message}</FieldError>
              </Field>
              <Field>
                <span className="text-text-secondary text-caption">
                  Giới tính
                </span>
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
              </Field>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddPersonOpen(false)}
            >
              Đóng
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit(handleAddPerson)}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Thêm người
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa gia phả</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body-sm">
              Toàn bộ thành viên, mối quan hệ và kỷ yếu của{' '}
              <span className="font-semibold">{currentTree.name}</span> sẽ bị
              xóa vĩnh viễn.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Giữ lại gia phả
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteTree}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              Xóa gia phả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTreeOpen} onOpenChange={setIsEditTreeOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitEdit(handleEditTree)}>
            <DialogHeader>
              <DialogTitle>Sửa tên gia phả</DialogTitle>
              <DialogDescription>
                Tên mới hiển thị trên danh sách, liên kết chia sẻ và kỷ yếu.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor="tree-name">Tên gia phả</FieldLabel>
                <Input
                  id="tree-name"
                  autoFocus
                  {...registerEdit('name')}
                  error={!!editErrors.name}
                  placeholder="Nhập tên mới"
                />
                <FieldError>{editErrors.name?.message}</FieldError>
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsEditTreeOpen(false)}
              >
                Giữ tên cũ
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmittingEdit}
                aria-busy={isSubmittingEdit}
              >
                {isSubmittingEdit && <Loader2 className="animate-spin" />}
                Lưu thay đổi
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
            <DialogTitle>Xuất kỷ yếu</DialogTitle>
            <DialogDescription>
              Kỷ yếu gồm sơ đồ cây và hồ sơ từng thành viên.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="border-border-default bg-surface rounded-control border p-4">
              <p className="text-text-secondary text-caption font-medium">
                Lưu ý
              </p>
              <ul className="text-text-secondary text-caption mt-1 list-inside list-disc">
                <li>Sơ đồ sẽ tự căn giữa trước khi xuất.</li>
                <li>Giữ trình duyệt mở cho đến khi hoàn tất.</li>
              </ul>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsExportConfirmOpen(false)}
            >
              Đóng
            </Button>
            <Button
              className="flex-1"
              onClick={handleExportPdf}
              disabled={isExporting}
              aria-busy={isExporting}
            >
              {isExporting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <BookOpen />
              )}
              Xuất kỷ yếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
