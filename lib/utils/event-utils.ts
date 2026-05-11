import { Person } from '@/types';

export type EventType = 'birth' | 'death';

export interface FamilyEvent {
  personId: string;
  fullName: string;
  type: EventType;
  day: number;
  month: number;
  originalDate: string;
}

/**
 * Trích xuất và sắp xếp sự kiện theo tháng/ngày dương lịch
 */
export const getSortedEvents = (persons: Person[]): FamilyEvent[] => {
  const events: FamilyEvent[] = [];

  persons.forEach((person) => {
    // Xử lý ngày sinh
    if (person.birth_date) {
      const date = new Date(person.birth_date);
      if (!isNaN(date.getTime())) {
        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'birth',
          day: date.getDate(),
          month: date.getMonth() + 1,
          originalDate: person.birth_date,
        });
      }
    }

    // Xử lý ngày mất
    if (person.death_date) {
      const date = new Date(person.death_date);
      if (!isNaN(date.getTime())) {
        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'death',
          day: date.getDate(),
          month: date.getMonth() + 1,
          originalDate: person.death_date,
        });
      }
    }
  });

  // Sắp xếp theo tháng, sau đó đến ngày
  return events.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
};

/**
 * Nhóm sự kiện theo tháng
 */
export const groupEventsByMonth = (events: FamilyEvent[]) => {
  const grouped: Record<number, FamilyEvent[]> = {};
  
  for (let i = 1; i <= 12; i++) {
    grouped[i] = events.filter(e => e.month === i);
  }
  
  return grouped;
};
