'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="text-primary size-4" />,
        info: <InfoIcon className="text-text-secondary size-4" />,
        warning: <TriangleAlertIcon className="text-danger size-4" />,
        error: <OctagonXIcon className="text-danger size-4" />,
        loading: <Loader2Icon className="text-primary size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-elevated)',
          '--normal-text': 'var(--color-text-primary)',
          '--normal-border': 'var(--color-border-default)',
          '--border-radius': 'var(--radius-card)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'border-border-default bg-surface-elevated text-text-primary shadow-md rounded-card border text-body-sm font-medium',
          closeButton:
            'border-border bg-surface text-text-secondary rounded-control opacity-100 transition-colors hover:bg-primary-soft',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
