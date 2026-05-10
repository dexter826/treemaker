"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Đăng ký thành công. Vui lòng kiểm tra email nếu hệ thống yêu cầu xác minh.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Đăng nhập thành công.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xác thực tài khoản.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <div className="absolute top-2 left-2 w-full h-full bg-primary/10 border-2 border-foreground -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />

      <div className="border-2 border-foreground bg-background p-6 lg:p-8 relative">
        <div className="mb-8 text-center border-b-2 border-foreground/10 pb-5">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1 tracking-wide">
            {isSignUp ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">Hệ thống lưu trữ gia phả</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-wide font-semibold text-foreground">Địa chỉ Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-semibold px-4 bg-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs tracking-wide font-semibold text-foreground">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-semibold px-4 bg-transparent"
            />
          </div>

          <Button className="mt-2 h-14 w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? 'Xác Nhận Đăng Ký' : 'Xác Nhận Truy Cập'}
          </Button>

          <div className="pt-5 border-t-2 border-foreground/10 text-center">
            <Button type="button" variant="link" className="h-auto px-0 text-xs" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
