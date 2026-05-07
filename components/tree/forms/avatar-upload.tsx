"use client"

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Upload, X, User, Crop as CropIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface AvatarUploadProps {
  currentUrl: string | null
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop | PercentCrop): Promise<File> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('No 2d context')

  const naturalWidth = image.naturalWidth
  const naturalHeight = image.naturalHeight

  let cropX: number, cropY: number, cropWidth: number, cropHeight: number

  if (crop.unit === '%') {
    cropX = (crop.x / 100) * naturalWidth
    cropY = (crop.y / 100) * naturalHeight
    cropWidth = (crop.width / 100) * naturalWidth
    cropHeight = (crop.height / 100) * naturalHeight
  } else {
    cropX = crop.x
    cropY = crop.y
    cropWidth = crop.width
    cropHeight = crop.height
  }

  canvas.width = cropWidth
  canvas.height = cropHeight

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Canvas is empty')
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      resolve(file)
    }, 'image/jpeg', 0.9)
  })
}

export function AvatarUpload({ currentUrl, onFileSelect, disabled }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [srcForCrop, setSrcForCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>()
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setSrcForCrop(objectUrl)
    setShowCropModal(true)
  }

  const handleCropComplete = useCallback((_: Crop, percentageCrop: PercentCrop) => {
    setCompletedCrop(percentageCrop as unknown as PixelCrop)
  }, [])

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop)
      const preview = URL.createObjectURL(croppedFile)
      
      setPreviewUrl(preview)
      setSelectedFile(croppedFile)
      onFileSelect(croppedFile)
      setShowCropModal(false)
    } catch (error: any) {
      toast.error('Lỗi xử lý ảnh: ' + error.message)
    }
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setSrcForCrop(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || currentUrl || null

  return (
    <div className="space-y-2 flex flex-col items-center">
      <div 
        onClick={triggerFileInput}
        className={`relative group w-24 h-24 border-2 border-foreground bg-muted overflow-hidden cursor-pointer transition-all hover:border-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <button
            onClick={clearImage}
            className="absolute top-1 right-1 bg-foreground text-background p-1 hover:bg-primary transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {showCropModal && srcForCrop && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background p-4 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Cắt Ảnh Đại Diện</h3>
              <button onClick={handleCropCancel} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={handleCropComplete}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={srcForCrop}
                alt="Crop preview"
                className="max-h-[50vh]"
              />
            </ReactCrop>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleCropCancel} className="flex-1">
                Hủy
              </Button>
              <Button onClick={handleCropConfirm} className="flex-1">
                <CropIcon className="h-4 w-4 mr-2" />
                Xác Nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}