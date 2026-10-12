'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authSchema, AuthFormValues, AuthMode } from '../validations/auth';
import { authService } from '../services/auth.service';

// Thành phần giao diện xử lý xác thực tài khoản (Đăng nhập, Đăng ký, Quên mật khẩu).
export function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: 'login',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    },
  });

  const handleSwitchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setValue('mode', nextMode);
    clearErrors();
    resetField('password');
    resetField('confirmPassword');
  };

  const handleAuth = async (data: AuthFormValues) => {
    setLoading(true);

    try {
      if (data.mode === 'signup') {
        await authService.signUp({
          email: data.email,
          password: data.password || '',
        });
        toast.success('Đăng ký thành công. Hãy kiểm tra email để xác minh.');
      } else if (data.mode === 'login') {
        await authService.signIn({
          email: data.email,
          password: data.password || '',
        });
        toast.success('Đăng nhập thành công.');
        router.push('/');
      } else if (data.mode === 'forgot') {
        await authService.resetPassword({
          email: data.email,
        });
        toast.success('Yêu cầu đã được gửi. Kiểm tra email của bạn.');
        handleSwitchMode('login');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xác thực.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="bg-primary/10 border-foreground absolute inset-0 -z-10 translate-x-2 translate-y-2 border-2" />

      <div className="border-foreground bg-background relative border-2 p-6 lg:p-8">
        <div className="border-foreground/10 mb-8 border-b-2 pb-5 text-center">
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className="text-muted-foreground hover:text-foreground absolute top-8 left-6 cursor-pointer transition-colors"
              title="Quay lại"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-foreground mb-1 font-serif text-3xl font-bold tracking-wide">
            {mode === 'signup'
              ? 'Tạo Tài Khoản'
              : mode === 'forgot'
                ? 'Khôi Phục'
                : 'Đăng Nhập'}
          </h2>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide">
            {mode === 'forgot'
              ? 'Nhập email để nhận hướng dẫn'
              : 'Hệ thống lưu trữ gia phả'}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleAuth)} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-foreground text-xs font-semibold tracking-wide"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              error={!!errors.email}
              className="bg-transparent px-4 font-semibold"
            />
            {errors.email && (
              <p className="text-destructive text-[10px] font-bold uppercase">
                {errors.email.message}
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-foreground text-xs font-semibold tracking-wide"
              >
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={!!errors.password}
                  className="bg-transparent pr-10 pl-4 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors focus:outline-none"
                  aria-label={
                    showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[10px] font-bold uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-foreground text-xs font-semibold tracking-wide"
              >
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  className="bg-transparent pr-10 pl-4 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors focus:outline-none"
                  aria-label={
                    showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-[10px] font-bold uppercase">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  )}
                />
                <Label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-xs font-semibold"
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs font-semibold"
                onClick={() => handleSwitchMode('forgot')}
              >
                Quên mật khẩu?
              </Button>
            </div>
          )}

          <Button className="mt-2 h-14 w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'signup'
              ? 'Đăng ký'
              : mode === 'forgot'
                ? 'Gửi yêu cầu'
                : 'Đăng nhập'}
          </Button>

          {mode !== 'forgot' && (
            <div className="border-foreground/10 border-t-2 pt-5 text-center">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs"
                onClick={() =>
                  handleSwitchMode(mode === 'signup' ? 'login' : 'signup')
                }
              >
                {mode === 'signup'
                  ? 'Đã có tài khoản? Đăng nhập'
                  : 'Chưa có tài khoản? Tạo mới'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
