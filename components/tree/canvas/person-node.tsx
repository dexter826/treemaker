import { useMemo, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Flower2 } from 'lucide-react';
import { PersonCardActions } from '../parts/person-card-actions';
import { TREE_NODE_WIDTH, TREE_NODE_HEIGHT } from '../constants';
import { motion } from 'framer-motion';
import { getCountryByCode } from '@/lib/constants/countries';
import Flag from 'react-world-flags';
import { isDeceased, calculateAge, formatLifeSpan } from '@/lib/utils/person-utils';


export const PersonNode = memo(function PersonNode({ data }: { data: { person: Person } }) {
  const { person } = data;
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const showCardActions = useStore((state) => state.showCardActions);
  const setShowCardActions = useStore((state) => state.setShowCardActions);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);

  const delay = useMemo(() => {
    const hash = person.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 20) / 100;
  }, [person.id]);

  const isSelected = selectedPersonId === person.id;
  const isShowingActions = showCardActions === person.id;
  const deceased = isDeceased(person);
  const age = calculateAge(person);

  const handleOpen = () => {
    if (!isSelected && selectedPersonId) {
      setSelectedPersonId(null);
    }

    if (isShowingActions) {
      setShowCardActions(null);
    } else if (isReadOnly) {
      setViewPersonId(person.id);
    } else {
      setShowCardActions(person.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      style={{ width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT }}
      className={cn(
        'relative bg-background cursor-pointer transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'border-2 flex flex-col overflow-hidden',
        isSelected
          ? 'border-primary scale-[1.02] shadow-[6px_6px_0px_0px_var(--color-primary)]'
          : deceased 
            ? 'border-muted-foreground/30 opacity-90' 
            : 'border-foreground hover:shadow-[6px_6px_0px_0px_var(--color-foreground)]',
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <Handle 
        id="top" 
        type="target" 
        position={Position.Top} 
        className={cn(
          'w-3 h-3 rounded-none border-2 border-background top-0 translate-y-[-50%] z-10', 
          isSelected ? 'bg-primary' : deceased ? 'bg-muted-foreground/50' : 'bg-foreground'
        )} 
      />
      <Handle 
        id="bottom" 
        type="source" 
        position={Position.Bottom} 
        className={cn(
          'w-3 h-3 rounded-none border-2 border-background bottom-0 translate-y-[50%] z-10', 
          isSelected ? 'bg-primary' : deceased ? 'bg-muted-foreground/50' : 'bg-foreground'
        )} 
      />
      <Handle id="left" type="source" position={Position.Left} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />
      <Handle id="right" type="source" position={Position.Right} className="w-1 h-8 rounded-none border-0 bg-primary opacity-50 top-1/2 -translate-y-1/2" />

      {/* Gender Indicator Bar */}
      <div className={cn(
        'h-1.5 w-full shrink-0', 
        deceased ? 'opacity-40' : 'opacity-100',
        person.gender === 'male' ? 'bg-male' : 'bg-female'
      )} />

      {/* Photo Area */}
      <div className={cn(
        'relative flex-1 bg-muted overflow-hidden border-b-2', 
        isSelected ? 'border-primary' : deceased ? 'border-muted-foreground/20' : 'border-foreground'
      )}>
        <Avatar className={cn('w-full h-full rounded-none', deceased && 'grayscale-[0.6] brightness-90')}>
          <AvatarImage src={person.avatar_url || ''} className="object-cover w-full h-full" />
          <AvatarFallback className="bg-transparent rounded-none flex items-center justify-center">
            <User className={cn('h-12 w-12 opacity-20', isSelected ? 'text-primary' : 'text-foreground')} />
          </AvatarFallback>
        </Avatar>

        {/* Living Country Flag */}
        {person.country_code && !deceased && (
          <div 
            className="absolute top-2 right-2 z-20 w-8 h-5 flex items-center justify-center bg-background border border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)] overflow-hidden"
            title={`Đang sống tại: ${getCountryByCode(person.country_code)?.name}`}
          >
            <Flag code={person.country_code} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className={cn('p-3 flex flex-col justify-center min-h-[80px]', deceased ? 'bg-muted/30' : 'bg-background')}>
        <h3 
          className={cn(
            'font-serif font-black text-sm leading-tight line-clamp-2 uppercase tracking-tight', 
            isSelected ? 'text-primary' : deceased ? 'text-muted-foreground italic' : 'text-foreground'
          )} 
          title={person.full_name}
        >
          {person.full_name}
        </h3>

        <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wide mt-0.5">
          {person.nickname || '—'}
        </span>
        
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              {formatLifeSpan(person)}
              {deceased && <Flower2 className="w-3 h-3 text-muted-foreground/60" />}
            </span>
            {age !== null && (
              <span className="bg-foreground/5 px-1 py-0.5 border border-foreground/10 text-[9px] text-foreground/70">
                {age} tuổi
              </span>
            )}
          </div>
        </div>
      </div>

      {isShowingActions && !isReadOnly && <PersonCardActions person={person} onClose={() => setShowCardActions(null)} />}
    </motion.div>
  );
});


