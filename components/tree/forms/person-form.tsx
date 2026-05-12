import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { COUNTRIES } from '@/lib/constants/countries';
import { personSchema, PersonFormValues } from '@/lib/validations/person';
import { normalizeSiblingOrder } from '@/lib/utils';
import Flag from 'react-world-flags';

export function PersonForm({ person, isReadOnly }: { person: Person; isReadOnly: boolean }) {
  const persons = useStore((state) => state.persons);
  const updatePerson = useStore((state) => state.updatePerson);
  const [isAvatarCleared, setIsAvatarCleared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      full_name: person.full_name,
      gender: person.gender,
      nickname: person.nickname,
      birth_date: person.birth_date,
      death_date: person.death_date,
      sibling_order: person.sibling_order ?? 0,
      occupation: person.occupation,
      address: person.address,
      country_code: person.country_code,
      bio: person.bio,
      avatar_url: person.avatar_url,
      avatar_file: null,
    },
  });

  const hasSiblingOrderConflict = useCallback((order: number) => {
    if (person.father_id === null && person.mother_id === null) return false;
    return persons.some(
      (p) =>
        p.id !== person.id &&
        p.tree_id === person.tree_id &&
        p.father_id === person.father_id &&
        p.mother_id === person.mother_id &&
        normalizeSiblingOrder(p.sibling_order) === order,
    );
  }, [person, persons]);

  const onSave = async (data: PersonFormValues) => {
    if (isReadOnly) return;
    setIsSaving(true);

    try {
      const siblingOrder = normalizeSiblingOrder(data.sibling_order);
      if (hasSiblingOrderConflict(siblingOrder)) {
        toast.error('Thứ tự sinh đã tồn tại trong cùng nhóm anh/chị/em.');
        setIsSaving(false);
        return;
      }

      let avatarUrl = isAvatarCleared ? null : data.avatar_url;
      if (data.avatar_file) {
        avatarUrl = await personService.uploadAvatar(data.avatar_file);
      }

      const { avatar_file, ...updateData } = data;
      const updatedPerson = await personService.update(person.id, {
        ...updateData,
        avatar_url: avatarUrl,
        sibling_order: siblingOrder,
      });

      updatePerson(updatedPerson);
      setIsAvatarCleared(false);
      reset(data);
      toast.success('Đã cập nhật thành công.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật hồ sơ.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const deathDate = useStore((state) => state.persons.find(p => p.id === person.id)?.death_date);
  const deceased = !!deathDate;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground text-center">Ảnh đại diện</Label>
          <Controller
            name="avatar_file"
            control={control}
            render={({ field }) => (
              <AvatarUpload 
                currentUrl={person.avatar_url} 
                onFileSelect={(file) => {
                  field.onChange(file);
                  if (file) setIsAvatarCleared(false);
                  else if (!file && isAvatarCleared) setIsAvatarCleared(true);
                }} 
                disabled={isReadOnly} 
                error={errors.avatar_file?.message as string}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Họ và tên</Label>
            <Input 
              {...register('full_name')} 
              error={!!errors.full_name}
              readOnly={isReadOnly} 
              placeholder="Ví dụ: Nguyễn Văn A" 
              className="font-semibold w-full" 
            />
            {errors.full_name && <p className="text-[10px] text-destructive font-bold uppercase">{errors.full_name.message}</p>}
          </div>

          <div className="sm:col-span-1 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Giới tính</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isReadOnly}
                  error={!!errors.gender}
                />
              )}
            />
            {errors.gender && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.gender.message}</p>}
          </div>

          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Tên gọi khác</Label>
            <Input 
              {...register('nickname')} 
              error={!!errors.nickname}
              readOnly={isReadOnly} 
              placeholder="Ví dụ: Bé Tí, Tèo..." 
              className="font-semibold" 
            />
            {errors.nickname && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.nickname.message}</p>}
          </div>
        </div>
      </div>

      <div>
        <Separator className="bg-foreground/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Ngày sinh</Label>
          <Controller
            name="birth_date"
            control={control}
            render={({ field }) => (
              <DatePicker 
                value={field.value ?? null} 
                onChange={field.onChange} 
                disabled={isReadOnly} 
                error={!!errors.birth_date}
              />
            )}
          />
          {errors.birth_date && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.birth_date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Ngày mất</Label>
          <Controller
            name="death_date"
            control={control}
            render={({ field }) => (
              <DatePicker 
                value={field.value ?? null} 
                onChange={field.onChange} 
                disabled={isReadOnly} 
              />
            )}
          />
          {errors.death_date && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.death_date.message}</p>}
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Thứ tự sinh</Label>
          <Input 
            type="number" 
            {...register('sibling_order', { valueAsNumber: true })} 
            error={!!errors.sibling_order}
            readOnly={isReadOnly} 
            min={0} 
            step={1} 
            className="font-semibold" 
          />
          {errors.sibling_order && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.sibling_order.message}</p>}
        </div>
      </div>

      <div>
        <Separator className="bg-foreground/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
            Nghề nghiệp
          </Label>
          <Input 
            {...register('occupation')} 
            error={!!errors.occupation}
            readOnly={isReadOnly} 
            placeholder="Ví dụ: Bác sĩ, Giáo viên..."
            className="font-semibold" 
          />
          {errors.occupation && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.occupation.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
            Địa chỉ
          </Label>
          <Input 
            {...register('address')} 
            error={!!errors.address}
            readOnly={isReadOnly} 
            placeholder="Ví dụ: Hà Nội, Việt Nam"
            className="font-semibold" 
          />
          {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.address.message}</p>}
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Quốc gia cư trú</Label>
          <Controller
            name="country_code"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: '', label: '--- Không chọn ---', searchText: 'không chọn' },
                  ...COUNTRIES.map((c) => ({ 
                    value: c.code, 
                    label: (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-3.5 overflow-hidden flex-shrink-0 border border-foreground/20">
                          <Flag code={c.code} className="w-full h-full object-cover" />
                        </div>
                        <span>{c.name}</span>
                      </div>
                    ),
                    searchText: `${c.name} ${c.code}`
                  })),
                ]}
                value={field.value || ''}
                onChange={(val) => field.onChange(val || null)}
                disabled={isReadOnly}
                showSearch={true}
                error={!!errors.country_code}
              />
            )}
          />
        </div>
      </div>

      <div>
        <Separator className="bg-foreground/20" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">Tiểu sử</Label>
        <Textarea 
          {...register('bio')} 
          error={!!errors.bio}
          rows={4} 
          readOnly={isReadOnly} 
          className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 font-medium resize-none p-4" 
        />
        {errors.bio && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.bio.message}</p>}
      </div>

      {!isReadOnly && (
        <div>
          <Button 
            type="submit"
            className="w-full relative overflow-hidden" 
            disabled={isSaving || (!isDirty && !isAvatarCleared)}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      )}
    </form>
  );
}