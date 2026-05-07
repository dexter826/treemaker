import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Heart } from 'lucide-react';
import { PersonCardActions } from '../parts/person-card-actions';

export function PersonNode({ data }: { data: { person: Person } }) {
  const { person } = data;
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const showCardActions = useStore((state) => state.showCardActions);
  const setShowCardActions = useStore((state) => state.setShowCardActions);
  const setViewPersonId = useStore((state) => state.setViewPersonId);

  const isSelected = selectedPersonId === person.id;
  const isShowingActions = showCardActions === person.id;

  const handleClick = () => {
    if (isShowingActions) {
      setShowCardActions(null);
    } else if (isReadOnly) {
      setViewPersonId(person.id);
    } else {
      setShowCardActions(person.id);
    }
  };

  const handleCloseActions = () => {
    setShowCardActions(null);
  };

  return (
    <div 
      className={cn(
        "relative w-[260px] bg-background cursor-pointer transition-all duration-300 group",
        "border-2",
        isSelected ? "border-primary scale-[1.02] shadow-[4px_4px_0px_0px_var(--color-primary)]" : "border-foreground hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]"
      )}
      onClick={handleClick}
    >
      <Handle id="top" type="target" position={Position.Top} className={cn("w-full h-2 rounded-none border-0 top-0 translate-y-[-50%]", isSelected ? "bg-primary" : "bg-foreground")} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={cn("w-full h-2 rounded-none border-0 bottom-0 translate-y-[50%]", isSelected ? "bg-primary" : "bg-foreground")} />
      
      <Handle id="left" type="target" position={Position.Left} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50" />
      <Handle id="right" type="source" position={Position.Right} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50" />

      <div className={cn("px-3 py-1 flex items-center justify-between border-b-2 text-[10px] uppercase font-bold tracking-widest", isSelected ? "border-primary bg-primary/5 text-primary" : "border-foreground bg-foreground/5 text-foreground")}>
        <span>{person.gender === 'male' ? 'Nam' : person.gender === 'female' ? 'Nữ' : 'Khác'}</span>
        {person.spouse_id && <Heart className="w-3 h-3 text-primary" />}
      </div>

      <div className="flex items-stretch">
        <div className={cn("p-3 flex items-center justify-center border-r-2", isSelected ? "border-primary" : "border-foreground")}>
          <Avatar className={cn("h-14 w-14 rounded-none border-2", isSelected ? "border-primary" : "border-foreground")}>
            <AvatarImage src={person.avatar_url || ''} className="object-cover" />
            <AvatarFallback className="bg-transparent rounded-none">
              <User className={cn("h-6 w-6", isSelected ? "text-primary" : "text-foreground")} />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex flex-col flex-1 p-3 justify-center min-w-0">
          <h3 className={cn("font-serif font-bold text-lg leading-tight uppercase", isSelected ? "text-primary" : "text-foreground")} title={person.full_name}>
            {person.full_name}
          </h3>
          
          <div className="mt-2 pt-2 border-t-2 border-foreground/10 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="tracking-widest">
              {person.birth_date ? new Date(person.birth_date).getFullYear() : '—'} 
              {' / '} 
              {person.death_date ? new Date(person.death_date).getFullYear() : '—'}
            </span>
          </div>
        </div>
      </div>

      {isShowingActions && !isReadOnly && (
        <PersonCardActions person={person} onClose={handleCloseActions} />
      )}
    </div>
  );
}
