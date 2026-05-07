"use client"

import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Loader2, Upload, X, User } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface AvatarUploadProps {
  currentUrl: string | null
  onUploadSuccess: (url: string) => void
  disabled?: boolean
}

export function AvatarUpload({ currentUrl, onUploadSuccess, disabled }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng và dung lượng (giới hạn 2MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB')
      return
    }

    // Tạo preview cục bộ
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload lên Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Lấy URL công khai
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUploadSuccess(publicUrl)
      toast.success('Ảnh đã được tải lên')
    } catch (error: any) {
      toast.error('Lỗi upload: ' + error.message)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    onUploadSuccess('') // Xóa URL ảnh
  }

  const displayUrl = previewUrl || currentUrl

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
            {!disabled && !isUploading && (
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

        {isUploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {displayUrl && !disabled && !isUploading && (
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
        disabled={disabled || isUploading}
      />
    </div>
  )
}
