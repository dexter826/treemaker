'use client';

import { useState, useEffect } from 'react';
import { FamilyTree } from '@/types';
import { treeService } from '../../services/tree.service';
import { shareSchema } from '../../validations/share';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel, FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Copy, Check, Globe, Lock, Shield, Eye, Pencil } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OTPInput } from '@/components/ui/otp-input';
import { Checkbox } from '@/components/ui/checkbox';

interface ShareSettingsDialogProps {
  tree: FamilyTree;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

// Dialog quản lý cài đặt chia sẻ cây gia phả.
export function ShareSettingsDialog({
  tree,
  open,
  onOpenChange,
  onUpdate,
}: ShareSettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [visibility, setVisibility] = useState<'private' | 'public'>(
    tree.visibility
  );
  const [permission, setPermission] = useState<'view' | 'edit'>(
    tree.share_permission
  );
  const [password, setPassword] = useState(tree.share_password || '');
  const [usePassword, setUsePassword] = useState(!!tree.share_password);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/${tree.share_token}`
      : '';

  // Sao chép link chia sẻ vào clipboard.
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Đã sao chép link chia sẻ');
    setTimeout(() => setCopied(false), 2000);
  };

  // Lưu các thay đổi vào database.
  const handleSave = async () => {
    const sharePassword = usePassword ? password : null;

    const parsed = shareSchema.safeParse({
      visibility,
      share_permission: permission,
      share_password: sharePassword,
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Mật khẩu phải có 4 chữ số.'
      );
      return;
    }

    setLoading(true);
    try {
      await treeService.update(tree.id, {
        visibility,
        share_permission: permission,
        share_password: sharePassword,
      });
      toast.success('Đã cập nhật cài đặt chia sẻ');
      onUpdate?.();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật cài đặt chia sẻ.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="bg-primary-soft border-border-default border-b-2 p-6">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Globe className="size-5" />
            Cài Đặt Chia Sẻ
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-meta mt-1 font-bold">
            Quản lý quyền truy cập cho cây: {tree.name}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-surface space-y-6 p-6">
          <div className="space-y-2">
            <FieldLabel>Link Chia Sẻ</FieldLabel>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="border-border-default bg-surface rounded-control text-meta h-11 border font-mono"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopy}
                className="border-border-default hover:bg-primary hover:text-on-primary h-11 w-11 shrink-0 border"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Chế Độ Truy Cập</FieldLabel>
              <div className="border-border-default bg-surface/30 grid grid-cols-2 gap-2 border p-1">
                <button
                  onClick={() => setVisibility('private')}
                  className={cn(
                    'text-meta flex cursor-pointer items-center justify-center gap-2 border border-transparent py-2 font-semibold transition-all',
                    visibility === 'private'
                      ? 'bg-primary text-on-primary border-border-default -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-surface/50'
                  )}
                >
                  <Lock className="size-3" /> Riêng Tư
                </button>
                <button
                  onClick={() => setVisibility('public')}
                  className={cn(
                    'text-meta flex cursor-pointer items-center justify-center gap-2 border border-transparent py-2 font-semibold transition-all',
                    visibility === 'public'
                      ? 'bg-primary text-on-primary border-border-default -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-surface/50'
                  )}
                >
                  <Globe className="size-3" /> Công Khai
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Quyền Hạn Thành Viên</FieldLabel>
              <div className="border-border-default bg-surface/30 grid grid-cols-2 gap-2 border p-1">
                <button
                  onClick={() => setPermission('view')}
                  className={cn(
                    'text-meta flex cursor-pointer items-center justify-center gap-2 border border-transparent py-2 font-semibold transition-all',
                    permission === 'view'
                      ? 'bg-foreground text-background border-border-default -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-surface/50'
                  )}
                >
                  <Eye className="size-3" /> Chỉ Xem
                </button>
                <button
                  onClick={() => setPermission('edit')}
                  className={cn(
                    'text-meta flex cursor-pointer items-center justify-center gap-2 border border-transparent py-2 font-semibold transition-all',
                    permission === 'edit'
                      ? 'bg-foreground text-background border-border-default -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-surface/50'
                  )}
                >
                  <Pencil className="size-3" /> Chỉnh Sửa
                </button>
              </div>
            </div>
          </div>

          <div className="border-border-default/10 space-y-4 border-t-2 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-primary size-4" />
                <FieldLabel htmlFor="use-password">Mật Khẩu Bảo Vệ</FieldLabel>
              </div>
              <Checkbox
                id="use-password"
                checked={usePassword}
                onCheckedChange={(checked) => setUsePassword(!!checked)}
                className="cursor-pointer"
              />
            </div>

            {usePassword && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-text-secondary text-meta font-semibold">
                  Nhập 4 chữ số bảo mật
                </p>
                <OTPInput value={password} onChange={setPassword} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-surface/30 border-border-default gap-2 border-t-2 p-6">
          <Button
            variant="secondary"
            className="flex-1 font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 font-semibold"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-background" />
            ) : (
              'Lưu Cài Đặt'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
