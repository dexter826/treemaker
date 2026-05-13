"use client";

import { useState, useEffect } from 'react';
import { FamilyTree } from '@/types';
import { treeService } from '@/lib/services/tree.service';
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
  
  const [visibility, setVisibility] = useState<'private' | 'public'>(tree.visibility);
  const [permission, setPermission] = useState<'view' | 'edit'>(tree.share_permission);
  const [password, setPassword] = useState(tree.share_password || '');
  const [usePassword, setUsePassword] = useState(!!tree.share_password);

  // Cập nhật state khi tree thay đổi.
  useEffect(() => {
    setVisibility(tree.visibility);
    setPermission(tree.share_permission);
    setPassword(tree.share_password || '');
    setUsePassword(!!tree.share_password);
  }, [tree]);

  const shareUrl = typeof window !== 'undefined' 
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
      <DialogContent className="max-w-md p-0 overflow-hidden border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="p-6 bg-primary border-b-4 border-foreground">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Globe className="size-6" />
            Cài Đặt Chia Sẻ
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 font-bold uppercase text-[10px] tracking-widest">
            Quản lý quyền truy cập cho cây: {tree.name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-background">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest">Link Chia Sẻ</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="rounded-none border-2 border-foreground bg-muted/50 font-mono text-[10px] h-11"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 border-2 border-foreground h-11 w-11 hover:bg-primary hover:text-primary-foreground"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">Chế Độ Truy Cập</Label>
              <div className="grid grid-cols-2 gap-2 p-1 border-2 border-foreground bg-muted/30">
                <button
                  onClick={() => setVisibility('private')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all border-2 border-transparent cursor-pointer",
                    visibility === 'private' 
                      ? "bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]" 
                      : "hover:bg-background/50"
                  )}
                >
                  <Lock className="size-3" /> Riêng Tư
                </button>
                <button
                  onClick={() => setVisibility('public')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all border-2 border-transparent cursor-pointer",
                    visibility === 'public' 
                      ? "bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]" 
                      : "hover:bg-background/50"
                  )}
                >
                  <Globe className="size-3" /> Công Khai
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest">Quyền Hạn Thành Viên</Label>
              <div className="grid grid-cols-2 gap-2 p-1 border-2 border-foreground bg-muted/30">
                <button
                  onClick={() => setPermission('view')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all border-2 border-transparent cursor-pointer",
                    permission === 'view' 
                      ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]" 
                      : "hover:bg-background/50"
                  )}
                >
                  <Eye className="size-3" /> Chỉ Xem
                </button>
                <button
                  onClick={() => setPermission('edit')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase transition-all border-2 border-transparent cursor-pointer",
                    permission === 'edit' 
                      ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-[1px] -translate-y-[1px]" 
                      : "hover:bg-background/50"
                  )}
                >
                  <Pencil className="size-3" /> Chỉnh Sửa
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-foreground/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <Label className="text-xs font-black uppercase tracking-widest cursor-pointer" htmlFor="use-password">
                  Mật Khẩu Bảo Vệ
                </Label>
              </div>
              <input
                type="checkbox"
                id="use-password"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="size-5 border-2 border-foreground rounded-none accent-primary cursor-pointer"
              />
            </div>

            {usePassword && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Nhập 4 chữ số bảo mật</p>
                <OTPInput
                  value={password}
                  onChange={setPassword}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t-4 border-foreground gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12 font-black"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 h-12 font-black"
            onClick={handleSave}
            disabled={loading}
            effect="raised"
          >
            {loading ? <LoadingSpinner size="sm" className="text-background" /> : 'Lưu Cài Đặt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
