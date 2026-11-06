'use client';

import { useEffect, useRef, useState } from 'react';

import { PENDING_DELAY_MS, PENDING_MIN_MS } from '@/features/tree/constants';

// Trạng thái chờ chỉ hiển thị sau PENDING_DELAY_MS và một khi đã hiển thị thì
// giữ tối thiểu PENDING_MIN_MS, tránh skeleton nhấp nháy trên tải nhanh.
export function useDeferredPending(pending: boolean): boolean {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (!pending) {
      if (!visible) return;
      const elapsed = Date.now() - shownAtRef.current;
      if (elapsed >= PENDING_MIN_MS) {
        setVisible(false);
        return;
      }
      const timer = setTimeout(
        () => setVisible(false),
        PENDING_MIN_MS - elapsed
      );
      return () => clearTimeout(timer);
    }

    if (visible) return;
    const timer = setTimeout(() => {
      shownAtRef.current = Date.now();
      setVisible(true);
    }, PENDING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pending, visible]);

  return visible;
}
