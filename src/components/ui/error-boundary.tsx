'use client';

import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-background flex h-screen w-full items-center justify-center">
            <div className="max-w-md text-center">
              <h1 className="mb-4 text-2xl font-bold">Có lỗi xảy ra</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                {this.state.error?.message ||
                  'Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
