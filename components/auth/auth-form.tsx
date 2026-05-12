"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authSchema, AuthFormValues } from '@/lib/validations/auth';

type AuthMode = 'login' | 'signup' | 'forgot';

// Thành phần xử lý xác thực (Đăng nhập, Đăng ký, Quên mật khẩu).
export function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    },
  });

  const handleAuth = async (data: AuthFormValues) => {
    setLoading(true);

    try {
      if (mode !== 'forgot' && (!data.password || data.password.length < 6)) {
        toast.error('Vui lòng nhập mật khẩu ít nhất 6 ký tự.');
        return;
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email: data.email, 
          password: data.password! 
        });
        if (error) throw error;
        toast.success('Đăng ký thành công. Hãy kiểm tra email để xác minh.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: data.email, 
          password: data.password! 
        });
        if (error) throw error;
        toast.success('Đăng nhập thành công.');
        router.push('/');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        toast.success('Yêu cầu đã được gửi. Kiểm tra email của bạn.');
        setMode('login');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xác thực.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    reset();
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary/10 border-2 border-foreground -z-10" />

      <div className="border-2 border-foreground bg-background p-6 lg:p-8 relative">
        <div className="mb-8 text-center border-b-2 border-foreground/10 pb-5">
          {mode === 'forgot' && (
            <button 
              onClick={() => setMode('login')}
              className="absolute left-6 top-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Quay lại"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1 tracking-wide">
            {mode === 'signup' ? 'Tạo Tài Khoản' : mode === 'forgot' ? 'Khôi Phục' : 'Đăng Nhập'}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">
            {mode === 'forgot' ? 'Nhập email để nhận hướng dẫn' : 'Hệ thống lưu trữ gia phả'}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleAuth)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-wide font-semibold text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              error={!!errors.email}
              className="font-semibold px-4 bg-transparent"
            />
            {errors.email && <p className="text-[10px] text-destructive font-bold uppercase">{errors.email.message}</p>}
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs tracking-wide font-semibold text-foreground">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={!!errors.password}
                  className="font-semibold pl-4 pr-10 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-bold uppercase">{errors.password.message}</p>}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs tracking-wide font-semibold text-foreground">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  className="font-semibold pl-4 pr-10 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-destructive font-bold uppercase">{errors.confirmPassword.message}</p>}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded-none border-2 border-foreground bg-background accent-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <Label htmlFor="rememberMe" className="text-xs font-semibold cursor-pointer">Ghi nhớ đăng nhập</Label>
              </div>
              <Button 
                type="button" 
                variant="link" 
                className="h-auto px-0 text-xs font-semibold"
                onClick={() => setMode('forgot')}
              >
                Quên mật khẩu?
              </Button>
            </div>
          )}

          <Button className="mt-2 h-14 w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signup' ? 'Đăng ký' : mode === 'forgot' ? 'Gửi yêu cầu' : 'Đăng nhập'}
          </Button>

          {mode !== 'forgot' && (
            <div className="pt-5 border-t-2 border-foreground/10 text-center">
              <Button type="button" variant="link" className="h-auto px-0 text-xs" onClick={toggleMode}>
                {mode === 'signup' ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Tạo mới'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

