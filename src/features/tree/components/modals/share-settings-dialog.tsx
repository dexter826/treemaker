'use client';

import { useState, useEffect } from 'react';
import { FamilyTree } from '@/types';
import { treeService } from '../../services/tree.service';
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
import { Label } from '@/components/ui/label';
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
    setLoading(true);
    try {
      await treeService.update(tree.id, {
        visibility,
        share_permission: permission,
        share_password: usePassword ? password : null,
      });
      toast.success('Đã cập nhật cài đặt chia sẻ');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Không thể cập nhật cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="bg-primary/5 border-foreground border-b-2 p-6">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl font-black tracking-widest uppercase">
            <Globe className="size-5" />
            Cài Đặt Chia Sẻ
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-[10px] font-bold tracking-widest uppercase">
            Quản lý quyền truy cập cho cây: {tree.name}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-background space-y-6 p-6">
          <div className="space-y-2">
            <Label className="text-xs font-black tracking-widest uppercase">
              Link Chia Sẻ
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="border-foreground bg-muted/50 h-11 rounded-none border-2 font-mono text-[10px]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="border-foreground hover:bg-primary hover:text-primary-foreground h-11 w-11 shrink-0 border-2"
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
              <Label className="text-xs font-black tracking-widest uppercase">
                Chế Độ Truy Cập
              </Label>
              <div className="border-foreground bg-muted/30 grid grid-cols-2 gap-2 border-2 p-1">
                <button
                  onClick={() => setVisibility('private')}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border-2 border-transparent py-2 text-[10px] font-black uppercase transition-all',
                    visibility === 'private'
                      ? 'bg-primary text-primary-foreground border-foreground shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-background/50'
                  )}
                >
                  <Lock className="size-3" /> Riêng Tư
                </button>
                <button
                  onClick={() => setVisibility('public')}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border-2 border-transparent py-2 text-[10px] font-black uppercase transition-all',
                    visibility === 'public'
                      ? 'bg-primary text-primary-foreground border-foreground shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-background/50'
                  )}
                >
                  <Globe className="size-3" /> Công Khai
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black tracking-widest uppercase">
                Quyền Hạn Thành Viên
              </Label>
              <div className="border-foreground bg-muted/30 grid grid-cols-2 gap-2 border-2 p-1">
                <button
                  onClick={() => setPermission('view')}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border-2 border-transparent py-2 text-[10px] font-black uppercase transition-all',
                    permission === 'view'
                      ? 'bg-foreground text-background border-foreground shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-background/50'
                  )}
                >
                  <Eye className="size-3" /> Chỉ Xem
                </button>
                <button
                  onClick={() => setPermission('edit')}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border-2 border-transparent py-2 text-[10px] font-black uppercase transition-all',
                    permission === 'edit'
                      ? 'bg-foreground text-background border-foreground shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]'
                      : 'hover:bg-background/50'
                  )}
                >
                  <Pencil className="size-3" /> Chỉnh Sửa
                </button>
              </div>
            </div>
          </div>

          <div className="border-foreground/10 space-y-4 border-t-2 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-primary size-4" />
                <Label
                  className="cursor-pointer text-xs font-black tracking-widest uppercase"
                  htmlFor="use-password"
                >
                  Mật Khẩu Bảo Vệ
                </Label>
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
                <p className="text-muted-foreground text-[10px] font-black uppercase">
                  Nhập 4 chữ số bảo mật
                </p>
                <OTPInput value={password} onChange={setPassword} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-muted/30 border-foreground gap-2 border-t-2 p-6">
          <Button
            variant="outline"
            className="h-12 flex-1 font-black"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="h-12 flex-1 font-black"
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
