import { Person } from '@/types';

export type EventType = 'birth' | 'death';

export interface FamilyEvent {
  personId: string;
  fullName: string;
  type: EventType;
  day: number;
  month: number;
  yearsCount: number;
  milestone?: string;
  originalDate: string;
}

/**
 * Trích xuất và sắp xếp sự kiện theo tháng/ngày dương lịch
 */
export const getSortedEvents = (persons: Person[]): FamilyEvent[] => {
  const events: FamilyEvent[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();

  persons.forEach((person) => {
    // Xử lý ngày sinh
    if (person.birth_date) {
      const date = new Date(person.birth_date);
      if (!isNaN(date.getTime())) {
        const birthYear = date.getFullYear();
        const age = currentYear - birthYear;
        
        let milestone;
        if (age >= 70 && age % 10 === 0) milestone = 'Mừng thọ';
        else if (age === 0) milestone = 'Mới sinh';

        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'birth',
          day: date.getDate(),
          month: date.getMonth() + 1,
          yearsCount: age,
          milestone,
          originalDate: person.birth_date,
        });
      }
    }

    // Xử lý ngày mất
    if (person.death_date) {
      const date = new Date(person.death_date);
      if (!isNaN(date.getTime())) {
        const deathYear = date.getFullYear();
        const yearsSinceDeath = currentYear - deathYear;
        
        let milestone;
        if (yearsSinceDeath === 1) milestone = 'Giỗ đầu';
        else if (yearsSinceDeath === 3) milestone = 'Giỗ hết';

        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'death',
          day: date.getDate(),
          month: date.getMonth() + 1,
          yearsCount: yearsSinceDeath,
          milestone,
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
