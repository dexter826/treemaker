import { useState, useEffect } from 'react';
import { Person } from '../../types';
import { useStore } from '../../lib/store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function PersonForm({ person, isReadOnly }: { person: Person, isReadOnly: boolean }) {
  const updatePerson = useStore((state) => state.updatePerson);
  const [formData, setFormData] = useState<Person>(person);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(person);
  }, [person]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('persons')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          gender: formData.gender,
          birth_date: formData.birth_date || null,
          death_date: formData.death_date || null,
          bio: formData.bio,
          occupation: formData.occupation,
        })
        .eq('id', person.id)
        .select()
        .single();
        
      if (error) throw error;
      
      updatePerson(data as Person);
      toast.success('Hồ sơ đã được cập nhật');
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tên / First Name</Label>
          <Input 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            readOnly={isReadOnly}
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Họ / Last Name</Label>
          <Input 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange}
            readOnly={isReadOnly}
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Giới Tính</Label>
        <div className="relative border-2 border-foreground">
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange as any}
            disabled={isReadOnly}
            className="appearance-none w-full bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-0 disabled:opacity-50 h-10 rounded-none cursor-pointer"
          >
            <option value="male">Nam / Male</option>
            <option value="female">Nữ / Female</option>
            <option value="other">Khác / Other</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l-2 border-foreground bg-foreground/5">
            <svg className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ngày Sinh</Label>
          <Input 
            type="date" 
            name="birth_date" 
            value={formData.birth_date || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ngày Mất</Label>
          <Input 
            type="date" 
            name="death_date" 
            value={formData.death_date || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
            className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold uppercase"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nghề Nghiệp / Tiểu Sử</Label>
        <Input 
          name="occupation" 
          value={formData.occupation || ''} 
          onChange={handleChange}
          readOnly={isReadOnly}
          placeholder="Ví dụ: Bác sĩ, Kỹ sư..."
          className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 h-10 font-bold"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ghi Chú</Label>
        <Textarea 
          name="bio" 
          value={formData.bio || ''} 
          onChange={handleChange}
          rows={4}
          readOnly={isReadOnly}
          className="rounded-none border-2 border-foreground focus:border-primary focus:ring-0 font-medium resize-none"
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
