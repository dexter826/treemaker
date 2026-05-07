import { Handle, Position } from '@xyflow/react';
import { Person } from '../../types';
import { useStore } from '../../lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { User, Heart } from 'lucide-react';

export function PersonNode({ data }: { data: { person: Person } }) {
  const { person } = data;
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const selectedPersonId = useStore((state) => state.selectedPersonId);

  const isSelected = selectedPersonId === person.id;

  return (
    <div 
      className={cn(
        "relative rounded-xl border-2 bg-card p-3 w-[220px] shadow-sm transition-all cursor-pointer",
        isSelected ? "border-primary ring-4 ring-primary/20 shadow-md" : "border-border hover:border-primary/50",
        person.gender === 'male' && !isSelected && "border-blue-200 dark:border-blue-900/50",
        person.gender === 'female' && !isSelected && "border-pink-200 dark:border-pink-900/50"
      )}
      onClick={() => setSelectedPersonId(person.id)}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
      
      {/* Spouse handles (left/right) */}
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 opacity-50" />
      <Handle type="target" position={Position.Right} id="right" className="w-2 h-2 opacity-50" />

      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={person.avatar_url || ''} />
          <AvatarFallback className="bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" title={`${person.first_name} ${person.last_name}`}>
            {person.first_name} {person.last_name}
          </h3>
          
          <div className="text-xs text-muted-foreground mt-0.5 truncate flex items-center justify-between">
            <span>{person.birth_date ? new Date(person.birth_date).getFullYear() : '?'} - {person.death_date ? new Date(person.death_date).getFullYear() : 'Present'}</span>
            {person.spouse_id && <Heart className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      </div>
    </div>
  );
}
