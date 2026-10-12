import { supabase } from '@/lib/supabase';

const mapAuthError = (error: unknown): Error => {
  const raw = error as { code?: string; message?: string };
  const message = String(raw?.message ?? (error instanceof Error ? error.message : 'Lỗi xác thực.'));

  const errorMap: Record<string, string> = {
    'invalid login credentials': 'Email hoặc mật khẩu không chính xác.',
    'user already registered': 'Email này đã được đăng ký tài khoản.',
    'password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'email rate limit exceeded': 'Đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
    'over email send rate limit': 'Đã gửi quá nhiều email. Vui lòng thử lại sau ít phút.',
    'user not found': 'Không tìm thấy tài khoản với email này.',
    'email not confirmed': 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
    'signup requires a valid password': 'Vui lòng nhập mật khẩu hợp lệ khi đăng ký.',
    'failed to fetch': 'Không thể kết nối tới máy chủ Supabase. Dự án Supabase có thể đang bị Tạm dừng (Paused) hoặc URL trong .env không tồn tại.',
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw mapAuthError(error);
      return data;
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async signUp({ email, password }: SignUpParams) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw mapAuthError(error);
      return data;
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async resetPassword({ email, redirectTo }: ResetPasswordParams) {
    try {
      const defaultRedirect = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo ?? defaultRedirect,
      });
      if (error) throw mapAuthError(error);
      return data;
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw mapAuthError(error);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw mapAuthError(error);
      return data.session;
    } catch (error) {
      throw mapAuthError(error);
    }
  },
};
