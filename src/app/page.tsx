'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Copy,
  Plus,
  Trash2,
  Loader2,
  LogOut,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { FamilyTree } from '@/types';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  treeService,
  treeSchema,
  type TreeFormValues,
  ANIMATION_DURATION,
  ShareSettingsDialog,
} from '@/features/tree';
import { Share2 } from 'lucide-react';

// Giao diện quản lý danh sách gia phả.
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        fetchTrees(session.user.id);
      } else {
        window.location.href = '/login';
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    defaultValues: {
      name: '',
    },
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
    defaultValues: {
      name: '',
    },
  });

  const handleEditTreeSubmit = async (data: TreeFormValues) => {
    if (!user?.id || !treeToEdit) return;

    setEditing(true);
    try {
      await treeService.update(treeToEdit.id, { name: data.name });
      await fetchTrees(user.id);
      toast.success(`Đã cập nhật tên gia phả.`);
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

  return (
    <>
      <SplashScreen isVisible={loading} />

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: ANIMATION_DURATION.FADE / 1000 }}
          className="bg-background selection:bg-primary/20 relative min-h-dvh"
        >
          <div className="mx-auto flex max-w-5xl flex-col px-4 py-8 lg:px-8 lg:py-10">
            <header className="border-foreground mb-6 flex flex-col justify-between gap-6 border-b-4 pb-6 md:flex-row md:items-end">
              <div className="flex flex-col gap-6 md:flex-row md:items-end">
                <div className="space-y-2">
                  <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.16em]">
                    Hồ Sơ Lưu Trữ
                  </h2>
                  <h1 className="font-serif text-3xl leading-none font-black tracking-tight md:text-6xl">
                    Cây{' '}
                    <span className="text-primary font-light italic">
                      Gia Phả
                    </span>
                  </h1>
                </div>
              </div>

              <div className="flex w-full items-stretch gap-2 md:w-auto">
                <div className="bg-primary/5 border-foreground flex min-w-0 flex-1 flex-col justify-center border-2 px-3 py-1">
                  <p className="text-muted-foreground mb-1 text-[10px] leading-none font-bold tracking-widest uppercase">
                    Tài Khoản
                  </p>
                  <p className="text-foreground truncate text-xs font-bold">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-auto w-10 shrink-0 rounded-none border-2 md:w-12"
                  onClick={() => setIsLogoutOpen(true)}
                  title="Đăng xuất"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </header>

            <main className="flex-1">
              <div className="border-foreground/20 mb-4 flex flex-row items-center justify-between gap-2 border-b-2 pb-3">
                <h3 className="text-foreground truncate text-base font-bold tracking-wide md:text-lg">
                  Danh Sách Gia Phả
                </h3>
                <Button
                  variant="default"
                  effect="raised"
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-9 px-4 text-[10px] font-bold tracking-wider uppercase sm:text-xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  <span>Tạo Cây Mới</span>
                </Button>
              </div>

              {trees.length === 0 ? (
                <div className="border-foreground/20 bg-foreground/[0.02] border-2 border-dashed py-12 text-center">
                  <p className="text-muted-foreground mb-4 text-sm font-medium">
                    Chưa có dữ liệu gia phả
                  </p>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    variant="outline"
                    effect="raised"
                    size="sm"
                  >
                    Tạo Gia Phả Đầu Tiên
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {trees.map((tree, idx) => (
                    <div
                      key={tree.id}
                      className="group border-foreground bg-background shadow-brutal-md hover:shadow-brutal-lg relative flex flex-col items-start justify-between border-2 p-4 transition-all md:flex-row md:items-center lg:p-5"
                    >
                      <div className="bg-foreground text-background absolute top-0 left-0 z-10 px-2 py-0.5 text-[10px] font-bold tracking-wider">
                        ID-{String(idx + 1).padStart(3, '0')}
                      </div>

                      <div className="mt-6 flex-1 space-y-1 md:mt-0">
                        <h4 className="text-foreground group-hover:text-primary max-w-xl truncate font-serif text-xl font-bold transition-colors">
                          {tree.name}
                        </h4>
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide">
                          Cập nhật cuối:{' '}
                          {new Date(tree.updated_at).toLocaleDateString(
                            'vi-VN'
                          )}
                        </p>
                      </div>

                      <div className="mt-3 flex w-full flex-wrap items-center gap-2 md:mt-0 md:w-auto">
                        <Button
                          variant="outline"
                          effect="raised"
                          size="sm"
                          onClick={() => {
                            setTreeToShare(tree);
                            setIsShareOpen(true);
                          }}
                          className="h-9 w-9 p-0"
                          title="Cài Đặt Chia Sẻ"
                        >
                          <Share2 className="size-4" />
                        </Button>

                        <Button
                          variant="outline"
                          effect="raised"
                          size="sm"
                          onClick={() => {
                            setTreeToEdit(tree);
                            setEditValue('name', tree.name);
                            setIsEditOpen(true);
                          }}
                          className="h-9 w-9 p-0"
                          title="Sửa Tên Gia Phả"
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          effect="raised"
                          size="sm"
                          onClick={() => {
                            setTreeToDelete(tree);
                            setIsDeleteOpen(true);
                          }}
                          className="h-9 w-9 p-0"
                          title="Xóa Gia Phả"
                        >
                          <Trash2 className="size-4" />
                        </Button>

                        <Link
                          href={`/tree/${tree.id}`}
                          className="flex-1 md:flex-none"
                        >
                          <Button
                            variant="default"
                            effect="raised"
                            size="sm"
                            className="h-9 w-9 p-0"
                            title="Mở Gia Phả"
                          >
                            <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
              <form onSubmit={handleSubmitTree(handleCreateTreeSubmit)}>
                <DialogHeader>
                  <DialogTitle>Tạo Cây Gia Phả</DialogTitle>
                  <DialogDescription>
                    Khởi tạo hệ thống lưu trữ mới
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-[0.16em]">
                      Tên Gia Phả
                    </Label>
                    <Input
                      autoFocus
                      {...registerTree('name')}
                      error={!!treeErrors.name}
                      placeholder="Ví dụ: Gia tộc họ Nguyễn"
                      className="border-foreground focus:border-primary h-12 rounded-none border-2 font-semibold focus:ring-0"
                    />
                    {treeErrors.name && (
                      <p className="text-[10px] font-bold text-red-500 uppercase">
                        {treeErrors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="h-12 flex-1"
                  >
                    {creating ? (
                      <LoadingSpinner size="sm" className="text-background" />
                    ) : (
                      'Tạo'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader variant="destructive">
                <DialogTitle>Xóa Gia Phả</DialogTitle>
                <DialogDescription>
                  Hành động này không thể hoàn tác
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <p className="text-sm leading-relaxed font-medium">
                  Bạn có chắc chắn muốn xóa toàn bộ gia phả{' '}
                  <span className="font-bold">
                    &ldquo;{treeToDelete?.name}&rdquo;
                  </span>{' '}
                  không? Mọi dữ liệu về thành viên và mối quan hệ sẽ bị xóa vĩnh
                  viễn.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-12 flex-1"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 flex-1"
                  onClick={handleDeleteTree}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Xóa'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đăng xuất</DialogTitle>
                <DialogDescription>
                  Xác nhận kết thúc phiên làm việc
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <p className="text-sm font-medium">
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-12 flex-1"
                  onClick={() => setIsLogoutOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 flex-1"
                  onClick={async () => {
                    setLoading(true);
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Đăng xuất'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <form onSubmit={handleSubmitEdit(handleEditTreeSubmit)}>
                <DialogHeader>
                  <DialogTitle>Sửa Tên Gia Phả</DialogTitle>
                  <DialogDescription>
                    Cập nhật tên mới cho hệ thống
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-[0.16em]">
                      Tên Gia Phả
                    </Label>
                    <Input
                      autoFocus
                      {...registerEdit('name')}
                      error={!!editErrors.name}
                      placeholder="Nhập tên mới"
                      className="border-foreground focus:border-primary h-12 rounded-none border-2 font-semibold focus:ring-0"
                    />
                    {editErrors.name && (
                      <p className="text-[10px] font-bold text-red-500 uppercase">
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
                    onClick={() => setIsEditOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={editing}
                    className="h-12 flex-1"
                  >
                    {editing ? (
                      <LoadingSpinner size="sm" className="text-background" />
                    ) : (
                      'Lưu Thay Đổi'
                    )}
                  </Button>
                </DialogFooter>
              </form>
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
        </motion.div>
      )}
    </>
  );
}
