"use client";

import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Upload, X, User } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface AvatarUploadProps {
  currentUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new globalThis.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Canvas is empty');
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.9);
  });
}

export function AvatarUpload({ currentUrl, onFileSelect, disabled }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [srcForCrop, setSrcForCrop] = useState<string | null>(null);
  
  // State cho việc crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrcForCrop(objectUrl);
    setShowCropModal(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const onCropComplete = useCallback((_: any, pixelCrop: { x: number; y: number; width: number; height: number }) => {
    setCompletedCrop(pixelCrop);
  }, []);

  const handleCropConfirm = async () => {
    if (!srcForCrop || !completedCrop) return;

    try {
      const croppedFile = await getCroppedImg(srcForCrop, completedCrop);
      const preview = URL.createObjectURL(croppedFile);

      setPreviewUrl(preview);
      onFileSelect(croppedFile);
      setShowCropModal(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xử lý ảnh.';
      toast.error(message);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSrcForCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentUrl || null;

  return (
    <div className="space-y-2 flex flex-col items-center">
      <div
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        className={`relative group w-32 h-32 border-2 border-foreground bg-muted overflow-hidden cursor-pointer transition-all hover:border-primary shadow-[4px_4px_0px_0px_var(--color-foreground)] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {displayUrl ? (
          <>
            <Image src={displayUrl} alt="Avatar Preview" fill className="object-cover" />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="text-white h-6 w-6" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <User className="h-10 w-10" />
            <span className="text-[8px] font-bold uppercase tracking-tighter">Upload Photo</span>
          </div>
        )}

        {displayUrl && !disabled && (
          <Button variant="ghost" size="icon-xs" onClick={clearImage} className="absolute top-1 right-1 z-10 bg-foreground text-background hover:border-primary hover:bg-primary">
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={disabled} />

      {showCropModal && srcForCrop && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background p-6 rounded-none max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Cắt Ảnh Đại Diện</h3>
              <Button variant="ghost" size="icon-sm" onClick={handleCropCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative w-full aspect-square bg-muted rounded-none overflow-hidden mb-4">
              <Cropper
                image={srcForCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCropCancel} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleCropConfirm} className="flex-1" disabled={!completedCrop}>
                  Xác Nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
