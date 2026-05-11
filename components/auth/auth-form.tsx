"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authSchema, AuthFormValues } from '@/lib/validations/auth';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
    },
  });

  const handleAuth = async (data: AuthFormValues) => {
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email: data.email, 
          password: data.password 
        });
        if (error) throw error;
        toast.success('Đăng ký thành công. Hãy kiểm tra email để xác minh.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: data.email, 
          password: data.password 
        });
        if (error) throw error;
        toast.success('Đăng nhập thành công.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xác thực.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    reset();
  };

  return (
    <div className="w-full max-w-md mx-auto relative group">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary/10 border-2 border-foreground -z-10 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />

      <div className="border-2 border-foreground bg-background p-6 lg:p-8 relative">
        <div className="mb-8 text-center border-b-2 border-foreground/10 pb-5">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-1 tracking-wide">
            {isSignUp ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">Hệ thống lưu trữ gia phả</p>
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

          {isSignUp && (
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

          <Button className="mt-2 h-14 w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
          </Button>

          <div className="pt-5 border-t-2 border-foreground/10 text-center">
            <Button type="button" variant="link" className="h-auto px-0 text-xs" onClick={toggleMode}>
              {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
