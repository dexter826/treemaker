import { useState, useEffect } from 'react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { AvatarUpload } from './avatar-upload';
import { personService } from '@/lib/services/person.service';
import { Separator } from '@/components/ui/separator';

const normalizeSiblingOrder = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
};

export function PersonForm({ person, isReadOnly }: { person: Person; isReadOnly: boolean }) {
  const persons = useStore((state) => state.persons);
  const updatePerson = useStore((state) => state.updatePerson);
  const [formData, setFormData] = useState<Person>(person);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(person);
  }, [person]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'sibling_order') {
      const parsed = e.target.value === '' ? 0 : Number(e.target.value);
      setFormData({ ...formData, sibling_order: normalizeSiblingOrder(parsed) });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hasSiblingOrderConflict = (order: number) => {
    if (person.father_id === null && person.mother_id === null) return false;
    return persons.some(
      (p) =>
        p.id !== person.id &&
        p.tree_id === person.tree_id &&
        p.father_id === person.father_id &&
        p.mother_id === person.mother_id &&
        normalizeSiblingOrder(p.sibling_order) === order,
    );
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);

    try {
      const siblingOrder = normalizeSiblingOrder(formData.sibling_order);
      if (hasSiblingOrderConflict(siblingOrder)) {
        toast.error('Thứ tự sinh đã tồn tại trong cùng nhóm anh/chị/em.');
        return;
      }

      let avatarUrl = formData.avatar_url;
      if (selectedAvatarFile) {
        avatarUrl = await personService.uploadAvatar(selectedAvatarFile);
      }

      const data = await personService.update(person.id, {
        full_name: formData.full_name,
        nickname: formData.nickname,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        death_date: formData.death_date || null,
        bio: formData.bio,
        occupation: formData.occupation,
        address: formData.address,
        avatar_url: avatarUrl,
        sibling_order: siblingOrder,
      });

      updatePerson(data);
      setSelectedAvatarFile(null);
      toast.success('Hồ sơ đã được cập nhật.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật hồ sơ.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground text-center">Ảnh đại diện</Label>
          <AvatarUpload currentUrl={formData.avatar_url} onFileSelect={setSelectedAvatarFile} disabled={isReadOnly} />
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Họ và tên</Label>
            <Input name="full_name" value={formData.full_name} onChange={handleChange} readOnly={isReadOnly} placeholder="Ví dụ: Nguyễn Văn A" className="font-semibold w-full" />
          </div>

          <div className="col-span-1 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Giới tính</Label>
            <Select
              options={[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
              ]}
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val as 'male' | 'female' })}
              disabled={isReadOnly}
            />
          </div>

          <div className="col-span-3 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Tên gọi khác (Nickname)</Label>
            <Input name="nickname" value={formData.nickname || ''} onChange={handleChange} readOnly={isReadOnly} placeholder="Ví dụ: Bé Tí, Tèo..." className="font-semibold" />
          </div>
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Ngày sinh</Label>
          <DatePicker value={formData.birth_date} onChange={(val) => setFormData({ ...formData, birth_date: val })} disabled={isReadOnly} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Ngày mất</Label>
          <DatePicker value={formData.death_date} onChange={(val) => setFormData({ ...formData, death_date: val })} disabled={isReadOnly} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Thứ tự sinh</Label>
          <Input type="number" name="sibling_order" value={normalizeSiblingOrder(formData.sibling_order)} onChange={handleChange} readOnly={isReadOnly} min={0} step={1} className="font-semibold" />
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Nghề nghiệp</Label>
          <Input name="occupation" value={formData.occupation || ''} onChange={handleChange} readOnly={isReadOnly} placeholder="Ví dụ: Bác sĩ, Kỹ sư..." className="font-semibold" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Địa chỉ</Label>
          <Input name="address" value={formData.address || ''} onChange={handleChange} readOnly={isReadOnly} placeholder="Ví dụ: Hà Nội, Việt Nam" className="font-semibold" />
        </div>
      </div>

      <Separator className="bg-foreground/20" />

      <div className="space-y-1">
        <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Tiểu sử</Label>
        <Textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={4} readOnly={isReadOnly} className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 font-medium resize-none p-4" />
      </div>

      {!isReadOnly && (
        <Button className="w-full relative overflow-hidden" onClick={handleSave} disabled={isSaving || JSON.stringify(formData) === JSON.stringify(person)}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Đang lưu...' : 'Ghi nhận thay đổi'}
        </Button>
      )}
    </div>
  );
}
