import { useState } from 'react';
import { Person } from '../../types';
import { useStore } from '../../lib/store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { AvatarUpload } from './avatar-upload';
import { personService } from '../../lib/services/person.service';
import { Separator } from '../ui/separator';

export function PersonForm({ person, isReadOnly }: { person: Person, isReadOnly: boolean }) {
  const updatePerson = useStore((state) => state.updatePerson);
  const [formData, setFormData] = useState<Person>(person);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (file: File | null) => {
    setSelectedAvatarFile(file);
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    
    try {
      let avatarUrl = formData.avatar_url;

      if (selectedAvatarFile) {
        avatarUrl = await personService.uploadAvatar(selectedAvatarFile);
      }

      const data = await personService.update(person.id, {
        full_name: formData.full_name,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.death_date || null,
        bio: formData.bio,
        occupation: formData.occupation,
        address: formData.address,
        avatar_url: avatarUrl,
      });
      
      updatePerson(data);
      setSelectedAvatarFile(null);
      toast.success('Hồ sơ đã được cập nhật');
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Identity Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center">Ảnh Đại Diện</Label>
          <AvatarUpload 
            currentUrl={formData.avatar_url}
            onFileSelect={handleAvatarSelect}
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="col-span-2 space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Họ và Tên</Label>
            <Input 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              readOnly={isReadOnly}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold w-full"
            />
          </div>

          <div className="col-span-1 space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Giới Tính</Label>
            <Select 
              options={[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' }
              ]}
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val as any })}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      {/* Life Timeline Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ngày Sinh</Label>
          <DatePicker 
            value={formData.birth_date}
            onChange={(val) => setFormData({ ...formData, birth_date: val })}
            disabled={isReadOnly}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ngày Mất</Label>
          <DatePicker 
            value={formData.death_date}
            onChange={(val) => setFormData({ ...formData, death_date: val })}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      {/* Context Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nghề Nghiệp</Label>
          <Input 
            name="occupation" 
            value={formData.occupation || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
            placeholder="Ví dụ: Bác sĩ, Kỹ sư..."
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Địa Chỉ</Label>
          <Input 
            name="address" 
            value={formData.address || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
            placeholder="Ví dụ: Hà Nội, Việt Nam"
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold"
          />
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      {/* Bio Section */}
      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tiểu Sử</Label>
        <Textarea 
          name="bio" 
          value={formData.bio || ''} 
          onChange={handleChange}
          rows={4}
          readOnly={isReadOnly}
          className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 font-medium resize-none p-4"
        />
      </div>
      
      {!isReadOnly && (
        <Button 
          className="w-full rounded-none h-12 text-sm font-bold uppercase tracking-widest border-2 border-primary bg-primary text-primary-foreground hover:bg-background hover:text-primary transition-all duration-300 relative overflow-hidden"
          onClick={handleSave} 
          disabled={isSaving || JSON.stringify(formData) === JSON.stringify(person)}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Đang Lưu...' : 'Ghi Nhận Thay Đổi'}
        </Button>
      )}
    </div>
  );
}
