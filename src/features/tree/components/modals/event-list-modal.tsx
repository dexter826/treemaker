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
                <p className="text-text-secondary text-meta font-semibold italic">
                  Chưa có dữ liệu sự kiện
                </p>
              </div>
            ) : (
              <div className="divide-border-default divide-y">
                {Object.entries(groupedEvents).map(([month, events]) => {
                  if (events.length === 0) return null;

                  return (
                    <div key={month} className="bg-surface">
                      <div className="bg-surface border-border-default/5 border-b px-5 py-2">
                        <h3 className="text-text-primary bg-primary-soft text-meta inline-block px-2 py-0.5 font-sans font-semibold">
                          Tháng {month.padStart(2, '0')}
                        </h3>
                      </div>

                      <div className="divide-border-default divide-y">
                        {events.map((event, idx) => {
                          const isToday =
                            event.day === todayDay &&
                            event.month === todayMonth;

                          return (
                            <button
                              key={`${event.personId}-${event.type}-${idx}`}
                              onClick={() => handlePersonClick(event.personId)}
                              className="hover:bg-surface flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors"
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <div
                                  className={`text-title-md flex h-10 w-10 shrink-0 items-center justify-center border font-semibold tabular-nums ${isToday ? 'bg-primary text-on-primary border-primary' : 'border-border-default/10 text-text-secondary'} `}
                                >
                                  {event.day.toString().padStart(2, '0')}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate font-serif text-sm leading-tight font-bold">
                                      {event.fullName}
                                    </p>
                                    {isToday && (
                                      <span className="bg-primary text-on-primary text-meta px-1.5 py-0.5 font-semibold">
                                        Hôm nay
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="text-text-secondary text-meta font-semibold">
                                      {event.type === 'birth'
                                        ? 'Ngày sinh'
                                        : 'Ngày giỗ'}
                                    </span>

                                    <div
                                      className={`text-meta flex items-center gap-1 border px-1.5 py-0.5 font-semibold ${
                                        event.type === 'birth'
                                          ? 'bg-gender-male/10 text-gender-male border-gender-male/20'
                                          : 'bg-primary-soft text-text-secondary border-border-default'
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
                                      <div className="bg-primary text-on-primary border-primary text-meta border px-1.5 py-0.5 font-semibold">
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
