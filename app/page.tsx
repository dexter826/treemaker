"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthForm } from '@/components/auth/auth-form';
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTrees = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTrees(data || []);
    } catch (error: any) {
      toast.error('Lỗi truy xuất hệ thống: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTrees(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTrees(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateTreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !newTreeName.trim()) return;
    
    setCreating(true);
    try {
      const { data: tree, error: treeError } = await supabase
        .from('family_trees')
        .insert({ owner_id: session.user.id, name: newTreeName.trim() })
        .select()
        .single();

      if (treeError) throw treeError;
      
      const { error: rootError } = await supabase
        .from('persons')
        .insert({
          tree_id: tree.id,
          full_name: 'Khuyết Danh',
          gender: 'other'
        });
        
      if (rootError) throw rootError;

      fetchTrees(session.user.id);
      toast.success('Hồ sơ gia phả đã được khởi tạo.');
      setIsCreateOpen(false);
      setNewTreeName('');
    } catch (error: any) {
      toast.error('Thao tác thất bại: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-serif italic text-muted-foreground tracking-widest uppercase text-sm">Đang truy xuất hệ thống...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 lg:p-8 relative overflow-hidden">
        {/* Structural Grid Background lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '4rem 4rem' }} />
        </div>
        
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 z-10">
          <div className="flex-1 text-left space-y-6 lg:pl-10">
            <div className="inline-block border-2 border-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-foreground bg-primary/5">
              Hệ Thống Lưu Trữ Số
            </div>
            <h1 className="text-5xl lg:text-7xl font-black font-serif leading-[0.9] tracking-tighter text-foreground uppercase">
              <span className="block">Khám Phá</span>
              <span className="block text-primary italic font-light">&</span>
              <span className="block">Lưu Giữ</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed font-medium">
              Kiến trúc lưu trữ dạng cấu trúc phẳng. Bảo tồn hệ thống phả hệ của gia đình bạn qua nhiều thế hệ với tính bảo mật và chuẩn xác tuyệt đối.
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
      {/* Top Border Archival Bar */}
      <div className="h-2 w-full bg-primary" />
      
      <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-16 flex flex-col min-h-screen">
        
        {/* Editorial Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-foreground pb-8 mb-8">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Hồ Sơ Lưu Trữ</h2>
            <h1 className="text-4xl md:text-6xl font-black font-serif tracking-tighter uppercase leading-none">
              Cây <span className="text-primary italic font-light">Gia Phả</span>
            </h1>
          </div>
          
          <div className="text-left md:text-right flex flex-col md:items-end gap-3">
            <div className="bg-primary/5 border-2 border-foreground px-4 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-1">Tài Khoản</p>
              <p className="text-sm font-bold text-foreground">{session.user.email}</p>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4 cursor-pointer"
            >
              [ Đăng Xuất Hệ Thống ]
            </button>
          </div>
        </header>

        {/* Structural List replacing Bento Grid */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-foreground/20 pb-4 mb-6 gap-4">
            <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">Danh Sách Gia Phả</h3>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors cursor-pointer w-fit"
            >
              <span>Tạo Cây Mới</span>
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          </div>

          {trees.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-foreground/20 bg-foreground/[0.02]">
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs mb-6">Chưa có hồ sơ nào được ghi nhận</p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background uppercase tracking-widest font-bold h-10 px-6 cursor-pointer inline-flex items-center"
              >
                Tạo Gia Phả Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {trees.map((tree, idx) => (
                <div key={tree.id} className="group relative flex flex-col md:flex-row justify-between items-start md:items-center p-5 lg:p-6 border-2 border-foreground bg-background hover:bg-foreground/[0.02] transition-colors">
                  {/* Serial Number */}
                  <div className="absolute top-0 left-0 bg-foreground text-background text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                    ID-{String(idx + 1).padStart(3, '0')}
                  </div>
                  
                  <div className="flex-1 mt-3 md:mt-0 space-y-1">
                    <h4 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-xl">
                      {tree.name}
                    </h4>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                      Cập Nhật Cuối: {new Date(tree.updated_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/share/${tree.share_token}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép liên kết chia sẻ!');
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary underline-offset-4 hover:underline py-2 cursor-pointer"
                    >
                      Sao Chép Khóa
                    </button>
                    
                    <Link href={`/tree/${tree.id}`} className="flex-1 md:flex-none">
                      <Button className="w-full md:w-auto rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground uppercase tracking-widest font-bold h-10 px-5 gap-2 transition-all cursor-pointer">
                        Truy Cập 
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        <footer className="mt-16 pt-6 border-t-2 border-foreground/10 text-center flex flex-col justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <p>© {new Date().getFullYear()} Nền tảng lưu trữ gia phả</p>
        </footer>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-2 border-foreground rounded-none shadow-[8px_8px_0px_0px_var(--color-foreground)] bg-background p-0 sm:max-w-md">
          <form onSubmit={handleCreateTreeSubmit}>
            <div className="border-b-2 border-foreground bg-primary/5 p-6">
              <DialogTitle className="font-serif font-black text-2xl uppercase tracking-widest">
                Tạo Cây Gia Phả
              </DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
                Khởi tạo hệ thống lưu trữ mới
              </p>
            </div>
            
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-[0.2em]">Định Danh / Tên Gia Phả</Label>
                <Input 
                  autoFocus
                  required
                  value={newTreeName} 
                  onChange={e => setNewTreeName(e.target.value)}
                  placeholder="Ví dụ: Gia tộc họ Nguyễn"
                  className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-12 font-bold"
                />
              </div>
            </div>
            
            <div className="border-t-2 border-foreground p-0 flex">
              <Button type="button" variant="ghost" className="flex-1 rounded-none h-14 border-r-2 border-foreground font-bold uppercase tracking-widest hover:bg-foreground hover:text-background cursor-pointer" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={creating} className="flex-1 rounded-none h-14 bg-primary hover:bg-foreground text-background font-bold uppercase tracking-widest cursor-pointer">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ghi Nhận'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
