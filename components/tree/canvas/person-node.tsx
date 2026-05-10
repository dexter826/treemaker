import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Heart, Mars, Venus, Briefcase } from 'lucide-react';
import { PersonCardActions } from '../parts/person-card-actions';
import { TREE_NODE_WIDTH } from '../constants';

export function PersonNode({ data }: { data: { person: Person } }) {
  const { person } = data;
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const showCardActions = useStore((state) => state.showCardActions);
  const setShowCardActions = useStore((state) => state.setShowCardActions);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const relationships = useStore((state) => state.relationships);

  const isSelected = selectedPersonId === person.id;
  const isShowingActions = showCardActions === person.id;
  const hasSpouse = relationships.some(r => r.person1_id === person.id || r.person2_id === person.id);

  const handleOpen = () => {
    if (isShowingActions) {
      setShowCardActions(null);
    } else if (isReadOnly) {
      setViewPersonId(person.id);
    } else {
      setShowCardActions(person.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      style={{ width: TREE_NODE_WIDTH }}
      className={cn(
        'relative bg-background cursor-pointer transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'border-2',
        isSelected
          ? 'border-primary scale-[1.02] shadow-[4px_4px_0px_0px_var(--color-primary)]'
          : 'border-foreground hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]',
      )}
      onClick={handleOpen}
    >
      <Handle 
        id="top" 
        type="target" 
        position={Position.Top} 
        className={cn(
          'w-3 h-3 rounded-full border-2 border-background top-0 translate-y-[-50%] z-10', 
          isSelected ? 'bg-primary' : 'bg-foreground'
        )} 
      />
      <Handle 
        id="bottom" 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          'w-3 h-3 rounded-full border-2 border-background bottom-0 translate-y-[50%] z-10', 
          isSelected ? 'bg-primary' : 'bg-foreground'
        )} 
      />
      <Handle id="left" type="source" position={Position.Left} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />
      <Handle id="right" type="source" position={Position.Right} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />

      <div className={cn('px-3 py-1 flex items-center justify-between border-b-2 text-[10px] font-bold tracking-wider uppercase', isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-foreground bg-foreground/5 text-foreground')}>
        <div className="flex items-center gap-1.5">
          {person.gender === 'male' ? (
            <><Mars className="w-3 h-3 text-male" /><span>Nam</span></>
          ) : (
            <><Venus className="w-3 h-3 text-female" /><span>Nữ</span></>
          )}
        </div>
        {hasSpouse && <Heart className="w-2.5 h-2.5 text-primary fill-primary" />}
      </div>

      <div className="flex items-stretch min-h-[80px]">
        <div className={cn('p-2.5 flex items-center justify-center border-r-2', isSelected ? 'border-primary' : 'border-foreground')}>
          <Avatar className={cn('h-12 w-12 rounded-none border-2', isSelected ? 'border-primary' : 'border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]')}>
            <AvatarImage src={person.avatar_url || ''} className="object-cover" />
            <AvatarFallback className="bg-transparent rounded-none">
              <User className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-foreground')} />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col flex-1 p-2.5 justify-center min-w-0">
          <h3 className={cn('font-serif font-bold text-base leading-tight truncate', isSelected ? 'text-primary' : 'text-foreground')} title={person.full_name}>
            {person.full_name}
          </h3>
          
          {(person.occupation || person.bio) && (
            <div className="mt-1 flex items-start gap-1 text-[10px] text-muted-foreground line-clamp-1 italic">
              {person.occupation && <Briefcase className="w-2.5 h-2.5 mt-0.5 shrink-0" />}
              <span>{person.occupation || person.bio}</span>
            </div>
          )}

          <div className="mt-1.5 pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tighter">
            <span>
              {person.birth_date ? new Date(person.birth_date).getFullYear() : '—'} 
              <span className="mx-1">/</span> 
              {person.death_date ? new Date(person.death_date).getFullYear() : '—'}
            </span>
          </div>
        </div>
      </div>

      {isShowingActions && !isReadOnly && <PersonCardActions person={person} onClose={() => setShowCardActions(null)} />}
    </div>
  );
}

