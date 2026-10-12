'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Upload, X, User } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface AvatarUploadProps {
  currentUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
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
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Canvas is empty');
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        resolve(file);
      },
      'image/jpeg',
      0.9
    );
  });
}

export function AvatarUpload({
  currentUrl,
  onFileSelect,
  disabled,
  error,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [srcForCrop, setSrcForCrop] = useState<string | null>(null);
  const [isCleared, setIsCleared] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hãy chọn một ảnh.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(objectUrl);
    setSrcForCrop(objectUrl);
    setShowCropModal(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setIsCleared(false);
  };

  const onCropComplete = useCallback(
    (
      _croppedArea: unknown,
      pixelCrop: { x: number; y: number; width: number; height: number }
    ) => {
      setCompletedCrop(pixelCrop);
    },
    []
  );

  const handleCropConfirm = async () => {
    if (!srcForCrop || !completedCrop) return;

    try {
      const croppedFile = await getCroppedImg(srcForCrop, completedCrop);
      const preview = URL.createObjectURL(croppedFile);
      blobUrlsRef.current.add(preview);

      if (previewUrl && blobUrlsRef.current.has(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
        blobUrlsRef.current.delete(previewUrl);
      }

      setPreviewUrl(preview);
      onFileSelect(croppedFile);
      setShowCropModal(false);
      setIsCleared(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xử lý ảnh.';
      toast.error(message);
    }
  };

  const handleCropCancel = () => {
    if (srcForCrop && blobUrlsRef.current.has(srcForCrop)) {
      URL.revokeObjectURL(srcForCrop);
      blobUrlsRef.current.delete(srcForCrop);
    }
    setShowCropModal(false);
    setSrcForCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && blobUrlsRef.current.has(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
      blobUrlsRef.current.delete(previewUrl);
    }
    setPreviewUrl(null);
    setIsCleared(true);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || (!isCleared ? currentUrl : null);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        className={`group relative h-32 w-32 border-2 ${error ? 'border-destructive shadow-brutal-sm' : 'border-foreground shadow-brutal-md'} bg-muted hover:border-primary cursor-pointer overflow-hidden transition-all ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt="Avatar Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="h-6 w-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2">
            <User className="h-10 w-10" />
            <span className="text-[8px] font-bold tracking-tighter uppercase">
              Tải ảnh lên
            </span>
          </div>
        )}

        {displayUrl && !disabled && (
          <Button
            variant="outline"
            size="icon-xs"
            onClick={clearImage}
            className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground absolute top-1 right-1 z-10"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-destructive text-[10px] font-bold uppercase">
          {error}
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {showCropModal && srcForCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-background w-full max-w-md rounded-none p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Cắt ảnh</h3>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleCropCancel}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-muted relative mb-4 aspect-square w-full overflow-hidden rounded-none">
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
                  className="bg-muted border-foreground accent-primary h-2 w-full cursor-pointer appearance-none rounded-none border-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCropCancel}
                  className="h-12 flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCropConfirm}
                  className="h-12 flex-1"
                  disabled={!completedCrop}
                >
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
