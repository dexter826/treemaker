'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface FieldContextValue {
  errorId: string;
  hasError: boolean;
  setErrorPresence: (present: boolean) => void;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  const errorId = React.useId();
  const [hasError, setHasError] = React.useState(false);

  return (
    <FieldContext.Provider
      value={{ errorId, hasError, setErrorPresence: setHasError }}
    >
      <div
        data-slot="field"
        className={cn('flex flex-col gap-1', className)}
        {...props}
      />
    </FieldContext.Provider>
  );
}

function useFieldDescribedBy(): string | undefined {
  const field = React.useContext(FieldContext);
  return field?.hasError ? field.errorId : undefined;
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn('text-text-secondary text-caption font-normal', className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  const field = React.useContext(FieldContext);

  React.useEffect(() => {
    if (!field) return;
    field.setErrorPresence(!!children);
    return () => field.setErrorPresence(false);
  }, [field, children]);

  if (!children) return null;
  return (
    <p
      data-slot="field-error"
      id={field?.errorId}
      role="status"
      aria-live="polite"
      className={cn('text-danger text-caption', className)}
      {...props}
    >
      {children}
    </p>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-text-muted text-caption', className)}
      {...props}
    />
  );
}

export { Field, FieldLabel, FieldError, FieldDescription, useFieldDescribedBy };
