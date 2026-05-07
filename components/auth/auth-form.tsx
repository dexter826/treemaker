"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Xử lý xác thực email/password
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email (nếu có yêu cầu).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Đăng nhập thành công!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-xl bg-white/80 backdrop-blur-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif text-center">
          {isSignUp ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
        </CardTitle>
        <CardDescription className="text-center">
          {isSignUp ? 'Nhập email của bạn để bắt đầu xây dựng cây gia phả' : 'Đăng nhập vào tài khoản của bạn'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAuth}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full rounded-xl py-6 text-lg font-medium" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            </span>{' '}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? 'Đăng nhập ngay' : 'Tham gia ngay'}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
