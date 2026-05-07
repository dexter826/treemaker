import { useState, useEffect } from 'react';
import { Person } from '../../types';
import { useStore } from '../../lib/store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

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
      toast.success('Person updated');
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange} 
            readOnly={isReadOnly}
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Gender</Label>
        <select 
          name="gender" 
          value={formData.gender} 
          onChange={handleChange as any}
          disabled={isReadOnly}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Birth Date</Label>
          <Input 
            type="date" 
            name="birth_date" 
            value={formData.birth_date || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </div>
        <div className="space-y-2">
          <Label>Death Date</Label>
          <Input 
            type="date" 
            name="death_date" 
            value={formData.death_date || ''} 
            onChange={handleChange}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Occupation</Label>
        <Input 
          name="occupation" 
          value={formData.occupation || ''} 
          onChange={handleChange}
          readOnly={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea 
          name="bio" 
          value={formData.bio || ''} 
          onChange={handleChange}
          rows={3}
          readOnly={isReadOnly}
        />
      </div>
      
      {!isReadOnly && (
        <Button 
          className="w-full" 
          onClick={handleSave} 
          disabled={isSaving || JSON.stringify(formData) === JSON.stringify(person)}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </div>
  );
}
