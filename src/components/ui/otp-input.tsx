"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
  disabled?: boolean;
}

// Thành phần nhập mã PIN/OTP với phong cách Neo-brutalism.
export function OTPInput({
  value,
  onChange,
  length = 4,
  className,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Khởi tạo mảng ref cho các ô nhập.
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Xử lý khi thay đổi giá trị trong một ô.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Chỉ cho phép nhập số.

    const newValue = value.split("");
    // Lấy ký tự cuối cùng nếu người dùng nhập đè.
    newValue[index] = val.slice(-1);
    const combinedValue = newValue.join("");
    onChange(combinedValue);

    // Tự động chuyển focus sang ô tiếp theo.
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý các phím đặc biệt (Backspace).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Xử lý khi paste mã vào ô.
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    onChange(pastedData);
    // Focus vào ô cuối cùng hoặc ô tiếp theo sau mã paste.
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex gap-3 justify-center", className)} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={disabled}
          className={cn(
            "size-12 md:size-14 text-center text-xl font-black rounded-none border-4 border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
            "focus:outline-none focus:bg-primary focus:text-primary-foreground focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
