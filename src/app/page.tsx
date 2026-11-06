'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/features/auth';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  LogOut,
  Pencil,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FamilyTree } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  treeService,
  treeSchema,
  type TreeFormValues,
  ShareSettingsDialog,
} from '@/features/tree';

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const setUserId = useStore((state) => state.setUserId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<FamilyTree | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [treeToEdit, setTreeToEdit] = useState<FamilyTree | null>(null);
  const [editing, setEditing] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [treeToShare, setTreeToShare] = useState<FamilyTree | null>(null);

  const fetchTrees = async (userId: string) => {
    try {
      const data = await treeService.getAllByUser(userId);
      setTrees(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi tải dữ liệu.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authService
      .getSession()
      .then((session) => {
        if (session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
          fetchTrees(session.user.id);
        } else {
          window.location.href = '/login';
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((session) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchTrees(session.user.id);
      } else {
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUserId]);

  const {
    register: registerTree,
    handleSubmit: handleSubmitTree,
    formState: { errors: treeErrors },
    reset: resetTree,
  } = useForm<TreeFormValues>({
    resolver: zodResolver(treeSchema),
    defaultValues: { name: '' },
  });

  const handleCreateTreeSubmit = async (data: TreeFormValues) => {
    if (!user?.id) return;

    setCreating(true);
    try {
      await treeService.create(user.id, data.name);
      await fetchTrees(user.id);
      toast.success('Đã tạo gia phả.');
      setIsCreateOpen(false);
      resetTree();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi, vui lòng thử lại.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    setValue: setEditValue,
  } = useForm<TreeFormValues>({
    resolver: zodResolver(treeSchema),
    defaultValues: { name: '' },
  });

  const handleEditTreeSubmit = async (data: TreeFormValues) => {
    if (!user?.id || !treeToEdit) return;

    setEditing(true);
    try {
      await treeService.update(treeToEdit.id, { name: data.name });
      await fetchTrees(user.id);
      toast.success('Đã cập nhật tên gia phả.');
      setIsEditOpen(false);
      setTreeToEdit(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Cập nhật thất bại.';
      toast.error(message);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTree = async () => {
    if (!user?.id || !treeToDelete) return;

    setDeleting(true);
    try {
      await treeService.delete(treeToDelete.id);
      await fetchTrees(user.id);
      toast.success(`Đã xóa gia phả "${treeToDelete.name}".`);
      setIsDeleteOpen(false);
      setTreeToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Xóa thất bại.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-dvh flex-col gap-6 p-6 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="rounded-card h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-dvh">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-8 lg:px-8 lg:py-16">
        <header className="border-border-default flex flex-col justify-between gap-6 border-b pb-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <p className="text-text-secondary text-caption">Gia phả của bạn</p>
            <h1 className="text-display-lg font-serif">Cây gia phả</h1>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="border-border-default bg-surface rounded-card flex h-11 min-w-0 flex-1 items-center gap-2 border px-4 md:flex-none">
              <span className="text-text-secondary text-caption shrink-0">
                Tài khoản
              </span>
              <span className="text-text-primary text-body-sm truncate">
                {user?.email}
              </span>
            </div>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Đăng xuất"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5">
          <div className="border-border-default flex items-center justify-between gap-3 border-b pb-4">
            <h2 className="text-title-md font-semibold">Danh sách gia phả</h2>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus />
              Tạo gia phả
            </Button>
          </div>

          {trees.length === 0 ? (
            <div className="border-border bg-surface rounded-card flex flex-col items-center gap-4 border border-dashed px-6 py-16 text-center">
              <h3 className="text-title-md font-semibold">
                Chưa có gia phả nào
              </h3>
              <p className="text-text-secondary text-body-sm max-w-md">
                Một gia phả chứa toàn bộ thành viên và mối quan hệ của một dòng
                họ. Tạo xong, bạn có thể thêm người và chia sẻ cho họ hàng.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Tạo gia phả đầu tiên
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {trees.map((tree, idx) => (
                <li
                  key={tree.id}
                  className="border-border-default bg-surface rounded-card flex flex-col items-start justify-between gap-4 border p-6 transition-shadow hover:shadow-xs md:flex-row md:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-name-person-lg truncate font-serif">
                      {tree.name}
                    </h3>
                    <p className="text-text-secondary text-meta tabular-nums">
                      Gia phả số {String(idx + 1).padStart(3, '0')} · Cập nhật
                      cuối{' '}
                      {new Date(tree.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Cài đặt chia sẻ"
                      onClick={() => {
                        setTreeToShare(tree);
                        setIsShareOpen(true);
                      }}
                    >
                      <Share2 />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sửa tên gia phả"
                      onClick={() => {
                        setTreeToEdit(tree);
                        setEditValue('name', tree.name);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Xóa gia phả"
                      onClick={() => {
                        setTreeToDelete(tree);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 />
                    </Button>
                    <Link href={`/tree/${tree.id}`} className="ml-auto md:ml-2">
                      <Button>
                        Mở
                        <ArrowRight />
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitTree(handleCreateTreeSubmit)}>
            <DialogHeader>
              <DialogTitle>Tạo gia phả mới</DialogTitle>
              <DialogDescription>
                Mỗi gia phả là một dòng họ riêng, có thành viên và mối quan hệ
                độc lập.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor="tree-name">Tên gia phả</FieldLabel>
                <Input
                  id="tree-name"
                  autoFocus
                  {...registerTree('name')}
                  error={!!treeErrors.name}
                  placeholder="Ví dụ: Gia tộc họ Nguyễn"
                />
                <FieldError>{treeErrors.name?.message}</FieldError>
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsCreateOpen(false)}
              >
                Đóng
              </Button>
              <Button type="submit" className="flex-1" disabled={creating}>
                {creating && <Loader2 className="animate-spin" />}
                Tạo gia phả
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitEdit(handleEditTreeSubmit)}>
            <DialogHeader>
              <DialogTitle>Sửa tên gia phả</DialogTitle>
              <DialogDescription>
                Tên mới hiển thị trên danh sách, liên kết chia sẻ và kỷ yếu.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor="tree-name-edit">Tên gia phả</FieldLabel>
                <Input
                  id="tree-name-edit"
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
                onClick={() => {
                  setIsEditOpen(false);
                  setTreeToEdit(null);
                }}
              >
                Giữ tên cũ
              </Button>
              <Button type="submit" className="flex-1" disabled={editing}>
                {editing && <Loader2 className="animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa gia phả</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body-sm">
              Toàn bộ thành viên và mối quan hệ của{' '}
              <span className="font-semibold">
                &ldquo;{treeToDelete?.name}&rdquo;
              </span>{' '}
              sẽ bị xóa vĩnh viễn, kể cả kỷ yếu đã xuất.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsDeleteOpen(false)}
            >
              Giữ lại gia phả
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteTree}
              disabled={deleting}
            >
              {deleting && <Loader2 className="animate-spin" />}
              Xóa gia phả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng xuất</DialogTitle>
            <DialogDescription>
              Kết thúc phiên làm việc trên thiết bị này.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-body-sm">
              Dữ liệu gia phả vẫn được giữ nguyên. Bạn cần đăng nhập lại để xem
              tiếp.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsLogoutOpen(false)}
            >
              Ở lại
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={async () => {
                setLoading(true);
                try {
                  await authService.signOut();
                } catch {
                  setLoading(false);
                  toast.error('Chưa đăng xuất được. Vui lòng thử lại sau.');
                  return;
                }
                window.location.href = '/login';
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin" />}
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {treeToShare && (
        <ShareSettingsDialog
          key={treeToShare.id}
          tree={treeToShare}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          onUpdate={() => user?.id && fetchTrees(user.id)}
        />
      )}
    </div>
  );
}
