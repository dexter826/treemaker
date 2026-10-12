import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { getSortedEvents, groupEventsByMonth } from '../../utils/event-utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cake, HeartCrack, Calendar } from 'lucide-react';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Danh sách sự kiện ngày sinh và ngày giỗ.
export function EventListModal({ isOpen, onClose }: EventListModalProps) {
  const persons = useStore((state) => state.persons);
  const setViewPersonId = useStore((state) => state.setViewPersonId);

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const groupedEvents = useMemo(() => {
    const sorted = getSortedEvents(persons);
    return groupEventsByMonth(sorted);
  }, [persons]);

  const hasAnyEvents = useMemo(
    () =>
      Object.values(groupedEvents).some(
        (monthEvents) => monthEvents.length > 0
      ),
    [groupedEvents]
  );

  const handlePersonClick = (id: string) => {
    setViewPersonId(id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[500px] flex-col overflow-hidden sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Calendar className="text-primary h-5 w-5" strokeWidth={2.5} />
            <DialogTitle className="text-lg">Sự kiện Gia phả</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 pr-1">
          <div className="p-0">
            {!hasAnyEvents ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase italic">
                  Chưa có dữ liệu sự kiện
                </p>
              </div>
            ) : (
              <div className="divide-foreground/5 divide-y-2">
                {Object.entries(groupedEvents).map(([month, events]) => {
                  if (events.length === 0) return null;

                  return (
                    <div key={month} className="bg-background">
                      <div className="bg-background border-foreground/5 border-b px-5 py-2">
                        <h3 className="text-foreground bg-primary/10 inline-block px-2 py-0.5 font-sans text-[10px] font-bold tracking-[0.2em] uppercase">
                          Tháng {month.padStart(2, '0')}
                        </h3>
                      </div>

                      <div className="divide-foreground/5 divide-y">
                        {events.map((event, idx) => {
                          const isToday =
                            event.day === todayDay &&
                            event.month === todayMonth;

                          return (
                            <button
                              key={`${event.personId}-${event.type}-${idx}`}
                              onClick={() => handlePersonClick(event.personId)}
                              className="hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors"
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 font-mono text-lg font-black ${isToday ? 'bg-primary text-primary-foreground border-primary shadow-brutal-sm' : 'border-foreground/10 text-muted-foreground'} `}
                                >
                                  {event.day.toString().padStart(2, '0')}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate font-serif text-sm leading-tight font-bold uppercase">
                                      {event.fullName}
                                    </p>
                                    {isToday && (
                                      <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[8px] font-black tracking-tighter uppercase">
                                        HÔM NAY
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="text-muted-foreground/80 text-[9px] font-bold tracking-widest uppercase">
                                      {event.type === 'birth'
                                        ? 'Ngày sinh'
                                        : 'Ngày giỗ'}
                                    </span>

                                    <div
                                      className={`flex items-center gap-1 border px-1.5 py-0.5 text-[9px] font-black tracking-tighter uppercase ${
                                        event.type === 'birth'
                                          ? 'bg-male/10 text-male border-male/20'
                                          : 'bg-foreground/5 text-muted-foreground border-foreground/10'
                                      } `}
                                    >
                                      {event.type === 'birth' ? (
                                        <Cake className="h-2.5 w-2.5" />
                                      ) : (
                                        <HeartCrack className="h-2.5 w-2.5" />
                                      )}
                                      {event.yearsCount}{' '}
                                      {event.type === 'birth' ? 'Tuổi' : 'Năm'}
                                    </div>

                                    {event.milestone && (
                                      <div className="bg-primary text-primary-foreground border-primary shadow-brutal-sm border-2 px-1.5 py-0.5 text-[9px] font-black tracking-tighter uppercase">
                                        {event.milestone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
