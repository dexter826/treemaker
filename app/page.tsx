"use client";

import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { treeService } from '@/lib/services/tree.service';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthForm } from '@/components/auth/auth-form';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FamilyTree } from '@/types';

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const setUserId = useStore((state) => state.setUserId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');
  const [creating, setCreating] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<FamilyTree | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      setSession(session);
      setUserId(session?.user?.id ?? null);
      if (session) {
        fetchTrees(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUserId(nextSession?.user?.id ?? null);
      if (nextSession) {
        fetchTrees(nextSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId]);

  const handleCreateTreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !newTreeName.trim()) return;

    setCreating(true);
    try {
      await treeService.create(session.user.id, newTreeName);
      await fetchTrees(session.user.id);
      toast.success('Đã tạo gia phả.');
      setIsCreateOpen(false);
      setNewTreeName('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi, vui lòng thử lại.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTree = async () => {
    if (!session?.user?.id || !treeToDelete) return;

    setDeleting(true);
    try {
      await treeService.delete(treeToDelete.id);
      await fetchTrees(session.user.id);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '4rem 4rem',
            }}
          />
        </div>

        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 z-10">
          <div className="flex-1 text-left space-y-6 lg:pl-10">
            <div className="inline-block border-2 border-foreground px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-foreground bg-primary/5">
              Gia Phả Số
            </div>
            <h1 className="text-5xl lg:text-7xl font-black font-serif leading-[0.9] tracking-tight text-foreground">
              <span className="block">Khám Phá</span>
              <span className="block text-primary italic font-light">&</span>
              <span className="block">Lưu Giữ</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed font-medium">
              Nền tảng quản lý gia phả trực quan, bảo toàn mối quan hệ qua nhiều thế hệ với dữ liệu nhất quán và an toàn.
            </p>
          </div>

          <div className="w-full lg:w-[420px]">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <div className="max-w-5xl mx-auto px-4 py-12 lg:px-8 lg:py-16 flex flex-col">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-foreground pb-8 mb-8">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Hồ Sơ Lưu Trữ</h2>
            <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tight leading-none">
              Cây <span className="text-primary italic font-light">Gia Phả</span>
            </h1>
          </div>

          <div className="text-left md:text-right flex flex-col md:items-end gap-3">
            <div className="bg-primary/5 border-2 border-foreground px-4 py-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground mb-1">Tài Khoản</p>
              <p className="text-sm font-semibold text-foreground break-all">{session.user.email}</p>
            </div>
            <Button
              variant="link"
              className="h-auto px-0 text-xs"
              onClick={async () => {
                await supabase.auth.signOut();
                setUserId(null);
              }}
            >
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-foreground/20 pb-4 mb-6 gap-4">
            <h3 className="text-lg font-bold tracking-wide text-foreground">Danh Sách Gia Phả</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="w-fit"
            >
              <span>Tạo Cây Mới</span>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {trees.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-foreground/20 bg-foreground/[0.02]">
              <p className="text-muted-foreground font-medium text-sm mb-6">Chưa có dữ liệu gia phả</p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                variant="outline"
                size="sm"
              >
                Tạo Gia Phả Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {trees.map((tree, idx) => (
                <div
                  key={tree.id}
                  className="group relative flex flex-col md:flex-row justify-between items-start md:items-center p-5 lg:p-6 border-2 border-foreground bg-background hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="absolute top-0 left-0 bg-foreground text-background text-xs font-semibold px-2 py-1 tracking-wide">
                    ID-{String(idx + 1).padStart(3, '0')}
                  </div>

                  <div className="flex-1 mt-3 md:mt-0 space-y-1">
                    <h4 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-xl">
                      {tree.name}
                    </h4>
                    <p className="text-xs tracking-wide font-semibold text-muted-foreground">
                      Cập nhật cuối: {new Date(tree.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/share/${tree.share_token}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép liên kết chia sẻ.');
                      }}
                      className="h-9 text-xs"
                    >
                      <Copy className="size-3.5" />
                      Sao Chép
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setTreeToDelete(tree);
                        setIsDeleteOpen(true);
                      }}
                      className="h-9 text-xs"
                      title="Xóa gia phả"
                    >
                      <Trash2 className="size-4" />
                      Xóa
                    </Button>

                    <Link href={`/tree/${tree.id}`} className="flex-1 md:flex-none">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full md:w-auto h-9"
                      >
                        Mở
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
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <form onSubmit={handleCreateTreeSubmit}>
            <div className="border-b-2 border-foreground bg-primary/5 p-6">
              <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">Tạo Cây Gia Phả</DialogTitle>
              <p className="text-xs font-semibold text-muted-foreground tracking-[0.16em] mt-2">Khởi tạo hệ thống lưu trữ mới</p>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-[0.16em]">Tên Gia Phả</Label>
                <Input
                  autoFocus
                  required
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  placeholder="Ví dụ: Gia tộc họ Nguyễn"
                  className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-semibold"
                />
              </div>
            </div>

            <div className="border-t-2 border-foreground p-0 flex">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-14 border-r-2 border-foreground"
                onClick={() => setIsCreateOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={creating} className="flex-1 h-14">
                {creating ? <LoadingSpinner size="sm" className="text-background" /> : 'Tạo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <div className="border-b-2 border-foreground bg-destructive/10 p-6">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest text-destructive">Xóa Gia Phả</DialogTitle>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em] mt-2">Hành động này không thể hoàn tác</p>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ gia phả <span className="font-bold">"{treeToDelete?.name}"</span> không?
              Mọi dữ liệu về thành viên và mối quan hệ sẽ bị xóa vĩnh viễn.
            </p>
          </div>
          <div className="border-t-2 border-foreground p-0 flex">
            <Button
              variant="ghost"
              className="flex-1 h-14 border-r-2 border-foreground"
              onClick={() => setIsDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-14"
              onClick={handleDeleteTree}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
