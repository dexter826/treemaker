import { useMemo, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Person } from '@/types';
import { useStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import {
  TREE_NODE_WIDTH,
  TREE_NODE_HEIGHT,
  ANIMATION_DURATION,
} from '../../constants';
import { motion } from 'motion/react';
import { isDeceased, formatDate } from '@/features/person';

const handleClass =
  'export-exclude size-2 rounded-full border border-surface opacity-0 transition-opacity group-hover:opacity-100';

export const PersonNode = memo(function PersonNode({
  data,
}: {
  data: { person: Person };
}) {
  const person = data.person;
  const selectedPersonId = useStore((state) => state.selectedPersonId);
  const isReadOnly = useStore((state) => state.isReadOnly);
  const setViewPersonId = useStore((state) => state.setViewPersonId);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);

  const delay = useMemo(() => {
    const hash = person.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 20) / 100;
  }, [person.id]);

  const isSelected = selectedPersonId === person.id;
  const deceased = isDeceased(person);
  const male = person.gender === 'male';

  const handleOpen = () => {
    if (isReadOnly) {
      setViewPersonId(person.id);
      return;
    }
    setSelectedPersonId(isSelected ? null : person.id);
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
      aria-pressed={isSelected}
      style={{ width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT }}
      className={cn(
        'group focus-visible:ring-focus focus-visible:ring-offset-background cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_DURATION.CANVAS_LAYOUT / 1000, delay }}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={cn(
          handleClass,
          'top-0 -translate-y-1/2',
          isSelected ? 'bg-primary opacity-100' : 'bg-text-primary'
        )}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={cn(
          handleClass,
          'bottom-0 translate-y-1/2',
          isSelected ? 'bg-primary opacity-100' : 'bg-text-primary'
        )}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={cn(
          handleClass,
          'left-0 -translate-x-1/2',
          isSelected ? 'bg-primary opacity-100' : 'bg-text-primary'
        )}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={cn(
          handleClass,
          'right-0 translate-x-1/2',
          isSelected ? 'bg-primary opacity-100' : 'bg-text-primary'
        )}
      />

      <div
        className={cn(
          'border-border-default bg-surface rounded-node flex h-full items-center gap-3 border p-2 transition-colors',
          isSelected && 'border-primary bg-selected border-2',
          deceased && !isSelected && 'border-deceased bg-deceased-surface'
        )}
      >
        <Avatar
          size="default"
          className={cn('shrink-0', deceased && 'opacity-80 grayscale')}
        >
          <AvatarImage src={person.avatar_url || ''} alt="" />
          <AvatarFallback>
            <User className="text-text-faint size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span
              aria-hidden
              className={cn(
                'size-2 shrink-0 rounded-full',
                male ? 'bg-gender-male' : 'bg-gender-female'
              )}
            />
            <span className="sr-only">{male ? 'Nam' : 'Nữ'}</span>
            <h3
              className={cn(
                'text-name-person truncate font-serif',
                isSelected
                  ? 'text-on-selected'
                  : deceased
                    ? 'text-deceased'
                    : 'text-text-primary'
              )}
              title={person.full_name}
            >
              {person.full_name}
            </h3>
          </div>

          <p
            className={cn(
              'text-meta truncate tabular-nums',
              isSelected
                ? 'text-on-selected'
                : deceased
                  ? 'text-deceased'
                  : 'text-text-secondary'
            )}
          >
            {formatDate(person.birth_date)}
            {deceased && person.death_date
              ? ` – ${formatDate(person.death_date)}`
              : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
});
