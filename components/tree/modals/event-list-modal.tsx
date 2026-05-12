import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { getSortedEvents, groupEventsByMonth } from '@/lib/utils/event-utils';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Cake, HeartCrack, Calendar } from 'lucide-react';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Danh sách sự kiện ngày sinh và ngày giỗ.
export function EventListModal({ isOpen, onClose }: EventListModalProps) {
  const persons = useStore((state) => state.persons);
  const setSelectedPersonId = useStore((state) => state.setSelectedPersonId);

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const groupedEvents = useMemo(() => {
    const sorted = getSortedEvents(persons);
    return groupEventsByMonth(sorted);
  }, [persons]);

  const hasAnyEvents = useMemo(() => 
    Object.values(groupedEvents).some(monthEvents => monthEvents.length > 0),
    [groupedEvents]
  );

  const handlePersonClick = (id: string) => {
    setSelectedPersonId(id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] h-[500px] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <DialogTitle className="text-lg">Sự kiện Gia phả</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-1">
          <div className="p-0">
            {!hasAnyEvents ? (
              <div className="text-center py-16">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground italic">
                  Chưa có dữ liệu sự kiện
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-foreground/5">
                {Object.entries(groupedEvents).map(([month, events]) => {
                  if (events.length === 0) return null;
                  
                  return (
                    <div key={month} className="bg-background">
                      <div className="bg-background border-b border-foreground/5 px-5 py-2">
                        <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-foreground bg-primary/10 inline-block px-2 py-0.5">
                          Tháng {month.padStart(2, '0')}
                        </h3>
                      </div>
                      
                      <div className="divide-y divide-foreground/5">
                        {events.map((event, idx) => {
                          const isToday = event.day === todayDay && event.month === todayMonth;
                          
                          return (
                            <button
                              key={`${event.personId}-${event.type}-${idx}`}
                              onClick={() => handlePersonClick(event.personId)}
                              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className={`
                                  font-mono font-black text-lg w-10 h-10 flex items-center justify-center border-2 shrink-0
                                  ${isToday ? 'bg-primary text-primary-foreground border-primary shadow-[2px_2px_0px_0px_var(--color-foreground)]' : 'border-foreground/10 text-muted-foreground'}
                                `}>
                                  {event.day.toString().padStart(2, '0')}
                                </div>
                                
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm leading-tight truncate uppercase font-serif">
                                      {event.fullName}
                                    </p>
                                    {isToday && (
                                      <span className="bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 uppercase tracking-tighter">
                                        HÔM NAY
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                      {event.type === 'birth' ? 'Ngày sinh' : 'Ngày giỗ'}
                                    </span>
                                    

                                    <div className={`
                                      flex items-center gap-1 px-1.5 py-0.5 border font-black text-[9px] uppercase tracking-tighter
                                      ${event.type === 'birth' 
                                        ? 'bg-male/10 text-male border-male/20' 
                                        : 'bg-foreground/5 text-muted-foreground border-foreground/10'}
                                    `}>
                                      {event.type === 'birth' ? (
                                        <Cake className="w-2.5 h-2.5" />
                                      ) : (
                                        <HeartCrack className="w-2.5 h-2.5" />
                                      )}
                                      {event.yearsCount} {event.type === 'birth' ? 'Tuổi' : 'Năm'}
                                    </div>


                                    {event.milestone && (
                                      <div className="bg-primary text-primary-foreground border-2 border-primary px-1.5 py-0.5 font-black text-[9px] uppercase tracking-tighter shadow-[2px_2px_0px_0px_var(--color-foreground)]">
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
