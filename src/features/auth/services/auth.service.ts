import { supabase } from '@/lib/supabase';

const mapAuthError = (error: unknown): Error => {
  const raw = error as { code?: string; message?: string };
  const message = String(raw?.message ?? 'Lỗi xác thực.');

  const errorMap: Record<string, string> = {
    'invalid login credentials': 'Email hoặc mật khẩu không chính xác.',
    'user already registered': 'Email này đã được đăng ký tài khoản.',
    'password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'email rate limit exceeded': 'Đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
    'over email send rate limit': 'Đã gửi quá nhiều email. Vui lòng thử lại sau ít phút.',
    'user not found': 'Không tìm thấy tài khoản với email này.',
    'email not confirmed': 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
    'signup requires a valid password': 'Vui lòng nhập mật khẩu hợp lệ khi đăng ký.',
  };

  const lower = message.toLowerCase();
  for (const [key, val] of Object.entries(errorMap)) {
    if (lower.includes(key)) return new Error(val);
  }

  return error instanceof Error ? error : new Error(message);
};

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
  redirectTo?: string;
}

export const authService = {
  async signIn({ email, password }: SignInParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw mapAuthError(error);
    return data;
  },

  async signUp({ email, password }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw mapAuthError(error);
    return data;
  },

  async resetPassword({ email, redirectTo }: ResetPasswordParams) {
    const defaultRedirect = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? defaultRedirect,
    });
    if (error) throw mapAuthError(error);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw mapAuthError(error);
    return data.session;
  },
};
