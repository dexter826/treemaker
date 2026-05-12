"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { treeService } from '@/lib/services/tree.service';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Plus, Trash2, Loader2, LogOut, Pencil } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SplashScreen } from '@/components/ui/splash-screen';
import { FamilyTree } from '@/types';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treeSchema, TreeFormValues } from '@/lib/validations/tree';
import { ANIMATION_DURATION } from '@/components/tree/constants';

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

  const fetchTrees = async (userId: string) => {
    try {
      const data = await treeService.getAllByUser(userId);
      setTrees(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi tải dữ liệu.';
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      const message = error instanceof Error ? error.message : 'Lỗi, vui lòng thử lại.';
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
      const message = error instanceof Error ? error.message : 'Cập nhật thất bại.';
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
          className="min-h-dvh bg-background relative selection:bg-primary/20"
        >

      <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-10 flex flex-col">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-foreground pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Hồ Sơ Lưu Trữ</h2>
              <h1 className="text-3xl md:text-6xl font-black font-serif tracking-tight leading-none">
                Cây <span className="text-primary italic font-light">Gia Phả</span>
              </h1>
            </div>
          </div>

          <div className="flex items-stretch gap-2 w-full md:w-auto">
            <div className="bg-primary/5 border-2 border-foreground px-3 py-1 flex flex-col justify-center flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase leading-none mb-1">Tài Khoản</p>
              <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-auto w-10 md:w-12 rounded-none border-2 shrink-0"
              onClick={() => setIsLogoutOpen(true)}
              title="Đăng xuất"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="flex flex-row items-center justify-between border-b-2 border-foreground/20 pb-3 mb-4 gap-2">
            <h3 className="text-base md:text-lg font-bold tracking-wide text-foreground truncate">Danh Sách Gia Phả</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Tạo Cây Mới</span>
            </Button>
          </div>

          {trees.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-foreground/20 bg-foreground/[0.02]">
              <p className="text-muted-foreground font-medium text-sm mb-4">Chưa có dữ liệu gia phả</p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
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
                  className="group relative flex flex-col md:flex-row justify-between items-start md:items-center p-4 lg:p-5 border-2 border-foreground bg-background hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="absolute top-0 left-0 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 tracking-wider z-10">
                    ID-{String(idx + 1).padStart(3, '0')}
                  </div>

                  <div className="flex-1 mt-6 md:mt-0 space-y-1">
                    <h4 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-xl">
                      {tree.name}
                    </h4>
                    <p className="text-[11px] tracking-wide font-semibold text-muted-foreground">
                      Cập nhật cuối: {new Date(tree.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/share/${tree.share_token}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép liên kết chia sẻ.');
                      }}
                      className="w-9 h-9 p-0"
                      title="Sao Chép Liên Kết"
                    >
                      <Copy className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTreeToEdit(tree);
                        setEditValue('name', tree.name);
                        setIsEditOpen(true);
                      }}
                      className="w-9 h-9 p-0"
                      title="Sửa Tên Gia Phả"
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setTreeToDelete(tree);
                        setIsDeleteOpen(true);
                      }}
                      className="w-9 h-9 p-0"
                      title="Xóa Gia Phả"
                    >
                      <Trash2 className="size-4" />
                    </Button>

                    <Link href={`/tree/${tree.id}`} className="flex-1 md:flex-none">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-9 h-9 p-0"
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
              <DialogDescription>Khởi tạo hệ thống lưu trữ mới</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Tên Gia Phả</Label>
                <Input
                  autoFocus
                  {...registerTree('name')}
                  error={!!treeErrors.name}
                  placeholder="Ví dụ: Gia tộc họ Nguyễn"
                  className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-semibold"
                />
                {treeErrors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{treeErrors.name.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={creating} className="flex-1 h-12">
                {creating ? <LoadingSpinner size="sm" className="text-background" /> : 'Tạo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader variant="destructive">
            <DialogTitle>Xóa Gia Phả</DialogTitle>
            <DialogDescription>Hành động này không thể hoàn tác</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ gia phả <span className="font-bold">&ldquo;{treeToDelete?.name}&rdquo;</span> không?
              Mọi dữ liệu về thành viên và mối quan hệ sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" className="flex-1 h-12" onClick={handleDeleteTree} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng xuất</DialogTitle>
            <DialogDescription>Xác nhận kết thúc phiên làm việc</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm font-medium">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="flex-1 h-12" onClick={() => setIsLogoutOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" className="flex-1 h-12" onClick={async () => {
              setLoading(true);
              await supabase.auth.signOut();
              window.location.href = '/login';
            }} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng xuất'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitEdit(handleEditTreeSubmit)}>
            <DialogHeader>
              <DialogTitle>Sửa Tên Gia Phả</DialogTitle>
              <DialogDescription>Cập nhật tên mới cho hệ thống</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Tên Gia Phả</Label>
                <Input
                  autoFocus
                  {...registerEdit('name')}
                  error={!!editErrors.name}
                  placeholder="Nhập tên mới"
                  className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-semibold"
                />
                {editErrors.name && <p className="text-[10px] text-red-500 font-bold uppercase">{editErrors.name.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={editing} className="flex-1 h-12">
                {editing ? <LoadingSpinner size="sm" className="text-background" /> : 'Lưu Thay Đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        </motion.div>
      )}
    </>
  );
}
