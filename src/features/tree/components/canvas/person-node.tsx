import { useMemo, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Flower2, Cake } from 'lucide-react';
import { TREE_NODE_WIDTH, TREE_NODE_HEIGHT } from '../../constants';
import { motion } from 'framer-motion';
import { getCountryByCode } from '@/lib/constants/countries';
import Flag from 'react-world-flags';
import {
  PersonCardActions,
  isDeceased,
  calculateAge,
  formatDate,
} from '@/features/person';

export const PersonNode = memo(function PersonNode({
  data,
}: {
  data: { person: Person };
}) {
  const { person } = data;
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const showCardActions = useStore((state) => state.showCardActions);
  const setShowCardActions = useStore((state) => state.setShowCardActions);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);

  const delay = useMemo(() => {
    const hash = person.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
      style={{
        width: TREE_NODE_WIDTH,
        height: TREE_NODE_HEIGHT,
        perspective: 1000,
      }}
      className={cn(
        'focus-visible:ring-primary focus-visible:ring-offset-background group relative transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        isSelected && 'scale-[1.02]'
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.02 : 1,
      }}
      transition={{ duration: 0.3, delay }}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={cn(
          'border-background export-exclude top-0 z-20 h-2 w-2 translate-y-[-50%] rounded-none border-2 transition-all duration-300',
          'opacity-0 group-hover:opacity-100',
          isSelected
            ? 'bg-primary opacity-100'
            : deceased
              ? 'bg-deceased-fg'
              : 'bg-foreground'
        )}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={cn(
          'border-background export-exclude bottom-0 z-20 h-2 w-2 translate-y-[50%] rounded-none border-2 transition-all duration-300',
          'opacity-0 group-hover:opacity-100',
          isSelected
            ? 'bg-primary opacity-100'
            : deceased
              ? 'bg-deceased-fg'
              : 'bg-foreground'
        )}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={cn(
          'border-background export-exclude left-0 z-20 h-2 w-2 translate-x-[-50%] rounded-none border-2 transition-all duration-300',
          'opacity-0 group-hover:opacity-100',
          isSelected
            ? 'bg-primary opacity-100'
            : deceased
              ? 'bg-deceased-fg'
              : 'bg-foreground'
        )}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={cn(
          'border-background export-exclude right-0 z-20 h-2 w-2 translate-x-[50%] rounded-none border-2 transition-all duration-300',
          'opacity-0 group-hover:opacity-100',
          isSelected
            ? 'bg-primary opacity-100'
            : deceased
              ? 'bg-deceased-fg'
              : 'bg-foreground'
        )}
      />

      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: isShowingActions ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front Side */}
        <div
          className={cn(
            'bg-background absolute inset-0 flex flex-col overflow-hidden border-2 transition-shadow duration-150 [backface-visibility:hidden]',
            isSelected
              ? 'border-primary shadow-brutal-primary-lg'
              : deceased
                ? 'border-deceased-border bg-deceased-bg shadow-brutal-sm opacity-95'
                : 'border-foreground shadow-brutal-md hover:shadow-brutal-lg'
          )}
        >
          {/* Gender Indicator Bar */}
          <div
            className={cn(
              'h-1.5 w-full shrink-0',
              deceased ? 'opacity-40' : 'opacity-100',
              person.gender === 'male' ? 'bg-male' : 'bg-female'
            )}
          />

          {/* Photo Area */}
          <div
            className={cn(
              'bg-muted relative flex-1 overflow-hidden border-b-2',
              isSelected
                ? 'border-primary'
                : deceased
                  ? 'border-deceased-border'
                  : 'border-foreground'
            )}
          >
            <Avatar
              className={cn(
                'h-full w-full rounded-none',
                deceased && 'opacity-85 grayscale-[0.5]'
              )}
            >
              <AvatarImage
                src={person.avatar_url || ''}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex items-center justify-center rounded-none bg-transparent">
                <User
                  className={cn(
                    'h-12 w-12 opacity-20',
                    isSelected
                      ? 'text-primary'
                      : deceased
                        ? 'text-deceased-fg'
                        : 'text-foreground'
                  )}
                />
              </AvatarFallback>
            </Avatar>

            {/* Country Flag */}
            {person.country_code && (
              <div
                className={cn(
                  'bg-background border-foreground shadow-brutal-sm absolute top-2 right-2 z-20 flex h-5 w-8 items-center justify-center overflow-hidden border',
                  deceased && 'opacity-80 grayscale-[0.5]'
                )}
                title={getCountryByCode(person.country_code)?.name}
              >
                <Flag
                  code={person.country_code}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Info Area */}
          <div
            className={cn(
              'flex min-h-[80px] flex-col justify-center p-3',
              deceased ? 'bg-deceased-bg text-deceased-fg' : 'bg-background'
            )}
          >
            <h3
              className={cn(
                'line-clamp-2 font-serif text-sm leading-tight font-black tracking-tight uppercase',
                isSelected
                  ? 'text-primary'
                  : deceased
                    ? 'text-deceased-fg italic'
                    : 'text-foreground'
              )}
              title={person.full_name}
            >
              {person.full_name}
            </h3>

            <span className="text-primary/80 mt-0.5 text-[10px] font-bold tracking-wide uppercase">
              {person.nickname || '—'}
            </span>

            <div className="text-muted-foreground/80 mt-2 flex flex-col gap-1 text-[9px] font-bold tracking-wider uppercase">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Cake className="text-primary/60 h-2.5 w-2.5" />
                    <span>{formatDate(person.birth_date)}</span>
                  </div>
                  {deceased && (
                    <div className="flex items-center gap-1.5">
                      <Flower2 className="text-muted-foreground/60 h-2.5 w-2.5" />
                      <span>{formatDate(person.death_date)}</span>
                    </div>
                  )}
                </div>
                {age !== null && (
                  <span className="bg-foreground/5 border-foreground/10 text-foreground/70 self-end border px-1 py-0.5 text-[9px]">
                    {age} tuổi
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        {!isReadOnly && (
          <PersonCardActions
            person={person}
            onClose={() => setShowCardActions(null)}
          />
        )}
      </motion.div>
    </motion.div>
  );
});
