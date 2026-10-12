import { supabase } from '@/lib/supabase';

const mapAuthError = (error: unknown): Error => {
  const raw = error as { code?: string; message?: string };
  const message = String(
    raw?.message ?? (error instanceof Error ? error.message : '')
  );

  const errorMap: Record<string, string> = {
    'invalid login credentials': 'Email hoặc mật khẩu không chính xác.',
    'user already registered':
      'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.',
    'password should be at least 6 characters':
      'Mật khẩu phải có ít nhất 6 ký tự.',
    'email rate limit exceeded':
      'Thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.',
    'over email send rate limit':
      'Thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.',
    'user not found': 'Không tìm thấy tài khoản tương ứng với email này.',
    'email not confirmed':
      'Email chưa được kích hoạt. Vui lòng kiểm tra hộp thư của bạn.',
    'signup requires a valid password':
      'Vui lòng nhập mật khẩu hợp lệ khi đăng ký.',
    'failed to fetch':
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại.',
    networkerror:
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại.',
    timeout: 'Kết nối quá hạn. Vui lòng thử lại sau.',
  };

  const lower = message.toLowerCase();
  for (const [key, val] of Object.entries(errorMap)) {
    if (lower.includes(key)) return new Error(val);
  }

  if (/[a-zA-Z]{4,}/.test(message) && !message.includes('Lỗi')) {
    return new Error('Không thể hoàn tất xác thực. Vui lòng thử lại sau.');
  }

  return message
    ? new Error(message)
    : new Error('Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.');
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
      const defaultRedirect =
        typeof window !== 'undefined'
          ? `${window.location.origin}/login`
          : undefined;
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
