"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TreeDeciduous, LogOut, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthForm } from '@/components/auth/auth-form';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách cây gia phả của người dùng
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
      toast.error('Không thể tải danh sách cây: ' + error.message);
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

  // Tạo cây gia phả mới
  const handleCreateTree = async () => {
    if (!session?.user?.id) return;
    try {
      const name = prompt('Nhập tên Cây Gia Phả:');
      if (!name) return;

      const { data: tree, error: treeError } = await supabase
        .from('family_trees')
        .insert({ owner_id: session.user.id, name })
        .select()
        .single();

      if (treeError) throw treeError;
      
      // Khởi tạo người gốc (Root)
      const { error: rootError } = await supabase
        .from('persons')
        .insert({
          tree_id: tree.id,
          first_name: 'Người',
          last_name: 'Gốc',
          gender: 'other'
        });
        
      if (rootError) throw rootError;

      fetchTrees(session.user.id);
      toast.success('Đã tạo cây gia phả thành công!');
    } catch (error: any) {
      toast.error('Lỗi khi tạo cây: ' + error.message);
    }
  };

  // Màn hình loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Màn hình chưa đăng nhập
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f2ed] p-4">
        <div className="mb-12 text-center">
          <TreeDeciduous className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold font-serif mb-4 tracking-tight">Family Tree Maker</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            Nền tảng hiện đại để lưu giữ và kết nối các thế hệ trong gia đình bạn.
          </p>
        </div>
        <AuthForm />
      </div>
    );
  }

  // Màn hình Dashboard (đã đăng nhập)
  return (
    <div className="min-h-screen bg-[#f5f2ed] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TreeDeciduous className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Cây của tôi</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Tài khoản</p>
              <p className="text-sm font-medium">{session.user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="hover:bg-red-50 hover:text-red-600 rounded-xl">
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card 
            className="group flex flex-col items-center justify-center p-8 border-dashed border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-300 rounded-2xl" 
            onClick={handleCreateTree}
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Thêm cây mới</h3>
          </Card>

          {trees.map((tree) => (
            <Card key={tree.id} className="flex flex-col hover:shadow-xl transition-all duration-300 rounded-2xl border-none shadow-sm overflow-hidden group">
              <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="flex-1 p-6">
                <CardTitle className="font-serif text-xl truncate">{tree.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-semibold mt-1">
                  Cập nhật: {new Date(tree.updated_at).toLocaleDateString('vi-VN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 p-6 pt-0 mt-auto">
                <Link href={`/tree/${tree.id}`} className="flex-1">
                  <Button className="w-full rounded-xl" variant="secondary">Mở cây</Button>
                </Link>
                <Button variant="outline" size="icon" title="Sao chép liên kết chia sẻ" className="rounded-xl" onClick={() => {
                  const url = `${window.location.origin}/share/${tree.share_token}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Đã sao chép liên kết chia sẻ!');
                }}>
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

