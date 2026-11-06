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
          <div className="bg-background p-xl flex min-h-dvh items-center justify-center">
            <div className="gap-md flex max-w-md flex-col items-center text-center">
              <h1 className="text-title-lg font-semibold">Có lỗi xảy ra</h1>
              <p className="text-text-secondary text-body-sm">
                {this.state.error?.message ||
                  'Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-on-primary rounded-control px-xl text-button h-11 font-semibold"
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
