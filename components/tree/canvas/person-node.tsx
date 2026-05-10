import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Heart, Mars, Venus, Briefcase } from 'lucide-react';
import { PersonCardActions } from '../parts/person-card-actions';
import { TREE_NODE_WIDTH, TREE_NODE_HEIGHT } from '../constants';

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
      style={{ width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT }}
      className={cn(
        'relative bg-background cursor-pointer transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'border-2 flex flex-col overflow-hidden',
        isSelected
          ? 'border-primary scale-[1.02] shadow-[6px_6px_0px_0px_var(--color-primary)]'
          : 'border-foreground hover:shadow-[6px_6px_0px_0px_var(--color-foreground)]',
      )}
      onClick={handleOpen}
    >
      <Handle 
        id="top" 
        type="target" 
        position={Position.Top} 
        className={cn(
          'w-3 h-3 rounded-none border-2 border-background top-0 translate-y-[-50%] z-10', 
          isSelected ? 'bg-primary' : 'bg-foreground'
        )} 
      />
      <Handle 
        id="bottom" 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          'w-3 h-3 rounded-none border-2 border-background bottom-0 translate-y-[50%] z-10', 
          isSelected ? 'bg-primary' : 'bg-foreground'
        )} 
      />
      <Handle id="left" type="source" position={Position.Left} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />
      <Handle id="right" type="source" position={Position.Right} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />

      {/* Gender Indicator Bar */}
      <div className={cn('h-1.5 w-full shrink-0', person.gender === 'male' ? 'bg-male' : 'bg-female')} />

      {/* Photo Area */}
      <div className={cn('relative flex-1 bg-muted overflow-hidden border-b-2', isSelected ? 'border-primary' : 'border-foreground')}>
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={person.avatar_url || ''} className="object-cover w-full h-full" />
          <AvatarFallback className="bg-transparent rounded-none flex items-center justify-center">
            <User className={cn('h-12 w-12 opacity-20', isSelected ? 'text-primary' : 'text-foreground')} />
          </AvatarFallback>
        </Avatar>

        {/* Floating Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {hasSpouse && (
            <div className="bg-background border-2 border-foreground p-1 shadow-[2px_2px_0px_0px_var(--color-foreground)]">
              <Heart className="w-3 h-3 text-primary fill-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 flex flex-col justify-center min-h-[80px] bg-background">
        <h3 className={cn('font-serif font-black text-sm leading-tight line-clamp-2 uppercase tracking-tight', isSelected ? 'text-primary' : 'text-foreground')} title={person.full_name}>
          {person.full_name}
        </h3>

        {person.nickname && (
          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wide mt-0.5">
            {person.nickname}
          </span>
        )}
        
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span>
              {person.birth_date ? new Date(person.birth_date).getFullYear() : '—'} 
              <span className="mx-1">/</span> 
              {person.death_date ? new Date(person.death_date).getFullYear() : '—'}
            </span>
            {person.birth_date && (
              <span className="bg-foreground/5 px-1 py-0.5 border border-foreground/10 text-[9px] text-foreground/70">
                {(() => {
                  const birth = new Date(person.birth_date).getFullYear();
                  const end = person.death_date ? new Date(person.death_date).getFullYear() : new Date().getFullYear();
                  return end - birth;
                })()} tuổi
              </span>
            )}
          </div>
        </div>
      </div>

      {isShowingActions && !isReadOnly && <PersonCardActions person={person} onClose={() => setShowCardActions(null)} />}
    </div>
  );
}

