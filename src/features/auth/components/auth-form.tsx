'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { authSchema, AuthFormValues, AuthMode } from '../validations/auth';
import { authService } from '../services/auth.service';

export function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    clearErrors();
    resetField('password');
    resetField('confirmPassword');
  };

  const handleAuth = async (data: AuthFormValues) => {
    setLoading(true);
    setFormError(null);

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
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'signup'
      ? 'Tạo tài khoản'
      : mode === 'forgot'
        ? 'Khôi phục mật khẩu'
        : 'Đăng nhập';

  return (
    <div className="border-border-default bg-surface rounded-card p-xl border">
      <div className="mb-lg gap-xxs flex flex-col">
        {mode === 'forgot' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quay lại đăng nhập"
            className="-ml-xs mb-xxs self-start"
            onClick={() => handleSwitchMode('login')}
          >
            <ArrowLeft />
          </Button>
        )}
        <h2 className="text-title-lg font-semibold">{title}</h2>
        <p className="text-text-secondary text-caption">
          {mode === 'forgot'
            ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu.'
            : 'Hệ thống lưu trữ gia phả.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleAuth)}
        className="gap-md flex flex-col"
      >
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            error={!!errors.email}
            aria-invalid={!!errors.email}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        {mode !== 'forgot' && (
          <Field>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                error={!!errors.password}
                aria-invalid={!!errors.password}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute top-0 right-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>
        )}

        {mode === 'signup' && (
          <Field>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                aria-invalid={!!errors.confirmPassword}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                }
                className="absolute top-0 right-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </Field>
        )}

        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <div className="gap-xs flex items-center">
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
              <Label htmlFor="rememberMe" className="cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-caption"
              onClick={() => handleSwitchMode('forgot')}
            >
              Quên mật khẩu?
            </Button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <Loader2 className="animate-spin" />}
          {mode === 'signup'
            ? 'Đăng ký'
            : mode === 'forgot'
              ? 'Gửi yêu cầu'
              : 'Đăng nhập'}
        </Button>

        {mode !== 'forgot' && (
          <div className="border-border-default pt-md flex justify-center border-t">
            <Button
              type="button"
              variant="link"
              className="text-caption"
              onClick={() =>
                handleSwitchMode(mode === 'signup' ? 'login' : 'signup')
              }
            >
              {mode === 'signup'
                ? 'Đã có tài khoản? Đăng nhập'
                : 'Chưa có tài khoản? Tạo tài khoản'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
