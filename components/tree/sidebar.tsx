import { useState } from 'react';
import { useStore } from '../../lib/store';
import { PersonForm } from './person-form';
import { Button } from '../ui/button';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function Sidebar() {
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const persons = useStore((state) => state.persons);
  const currentTree = useStore((state) => state.currentTree);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const removePerson = useStore((state) => state.removePerson);
  const addPersonStore = useStore((state) => state.addPerson);
  const updatePersonStore = useStore((state) => state.updatePerson);

  const [isAddingRelative, setIsAddingRelative] = useState<string | null>(null); // 'father', 'mother', 'spouse', 'child'
  const [newRelativeName, setNewRelativeName] = useState({ first: '', last: '' });

  if (!selectedPersonId) return null;

  const person = persons.find(p => p.id === selectedPersonId);
  
  if (!person || !currentTree) return null;

  const handleDelete = async () => {
    if (isReadOnly) return;
    if (!confirm('Are you sure you want to delete this person? relationships will be orphaned or severed.')) return;

    try {
      const { error } = await supabase.from('persons').delete().eq('id', person.id);
      if (error) throw error;
      
      removePerson(person.id);
      toast.success('Person deleted');
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const submitAddRelative = async () => {
    if (!isAddingRelative || isReadOnly) return;
    
    try {
      const newPersonData: any = {
        tree_id: currentTree.id,
        first_name: newRelativeName.first || 'Unknown',
        last_name: newRelativeName.last || '',
        gender: isAddingRelative === 'father' ? 'male' : isAddingRelative === 'mother' ? 'female' : 'other'
      };

      if (isAddingRelative === 'child') {
        if (person.gender === 'male') newPersonData.father_id = person.id;
        else if (person.gender === 'female') newPersonData.mother_id = person.id;
        // if known spouse exist, connect them as well
        if (person.spouse_id) {
            const spouse = persons.find(p => p.id === person.spouse_id);
            if (spouse && spouse.gender === 'female') newPersonData.mother_id = spouse.id;
            if (spouse && spouse.gender === 'male') newPersonData.father_id = spouse.id;
        }
      }

      const { data: newPerson, error } = await supabase
        .from('persons')
        .insert(newPersonData)
        .select()
        .single();

      if (error) throw error;
      
      addPersonStore(newPerson as any);

      // Link current person to the new relative if it's parent or spouse
      if (isAddingRelative === 'father') {
        const { error: linkErr } = await supabase.from('persons').update({ father_id: newPerson.id }).eq('id', person.id);
        if (linkErr) throw linkErr;
        updatePersonStore({ ...person, father_id: newPerson.id });
      } else if (isAddingRelative === 'mother') {
        const { error: linkErr } = await supabase.from('persons').update({ mother_id: newPerson.id }).eq('id', person.id);
        if (linkErr) throw linkErr;
        updatePersonStore({ ...person, mother_id: newPerson.id });
      } else if (isAddingRelative === 'spouse') {
        // Enforce symmetric spouse relation
        await supabase.from('persons').update({ spouse_id: newPerson.id }).eq('id', person.id);
        await supabase.from('persons').update({ spouse_id: person.id }).eq('id', newPerson.id);
        updatePersonStore({ ...person, spouse_id: newPerson.id });
        updatePersonStore({ ...newPerson, spouse_id: person.id } as any);
      }

      toast.success(`${isAddingRelative} added!`);
      setIsAddingRelative(null);
      setNewRelativeName({ first: '', last: '' });
      setSelectedPersonId(newPerson.id); // focus newly created
    } catch (err: any) {
      toast.error('Failed to add relative: ' + err.message);
    }
  };

  return (
    <>
      <div className="w-[350px] h-full bg-background border-l flex flex-col shadow-xl z-10 absolute right-0 top-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">{isReadOnly ? 'Details' : 'Edit Person'}</h2>
          <Button variant="ghost" size="icon" onClick={() => setSelectedPersonId(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <PersonForm person={person} isReadOnly={isReadOnly} />
            
            {!isReadOnly && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => setIsAddingRelative('father')} disabled={!!person.father_id}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add Father
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => setIsAddingRelative('mother')} disabled={!!person.mother_id}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add Mother
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => setIsAddingRelative('spouse')} disabled={!!person.spouse_id}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add Spouse
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start" onClick={() => setIsAddingRelative('child')}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add Child
                    </Button>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Person
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!isAddingRelative} onOpenChange={(v) => !v && setIsAddingRelative(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {isAddingRelative}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                autoFocus
                value={newRelativeName.first} 
                onChange={e => setNewRelativeName({ ...newRelativeName, first: e.target.value })}
                placeholder="e.g. John"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                value={newRelativeName.last} 
                onChange={e => setNewRelativeName({ ...newRelativeName, last: e.target.value })}
                placeholder="e.g. Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingRelative(null)}>Cancel</Button>
            <Button onClick={submitAddRelative}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
