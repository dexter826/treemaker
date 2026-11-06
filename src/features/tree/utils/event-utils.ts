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

// PostgREST trả cột DATE dưới chuỗi 'YYYY-MM-DD'. Ném chuỗi đó cho new Date()
// sẽ hiểu là nửa đêm UTC, rồi getDate()/getMonth() đọc lại theo giờ máy, làm
// ngày lùi một bậc với người dùng west-of-UTC.
const parseDateParts = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return year && month && day ? { year, month, day } : null;
};

// Sắp xếp sự kiện theo tháng và ngày dương lịch.
export const getSortedEvents = (persons: Person[]): FamilyEvent[] => {
  const events: FamilyEvent[] = [];
  const currentYear = new Date().getFullYear();

  persons.forEach((person) => {
    if (person.birth_date) {
      const birth = parseDateParts(person.birth_date);
      if (birth) {
        const age = currentYear - birth.year;

        let milestone;
        if (age >= 70 && age % 10 === 0) milestone = 'Mừng thọ';
        else if (age === 0) milestone = 'Mới sinh';

        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'birth',
          day: birth.day,
          month: birth.month,
          yearsCount: age,
          milestone,
          originalDate: person.birth_date,
        });
      }
    }

    if (person.death_date) {
      const death = parseDateParts(person.death_date);
      if (death) {
        const yearsSinceDeath = currentYear - death.year;

        let milestone;
        if (yearsSinceDeath === 1) milestone = 'Giỗ đầu';
        else if (yearsSinceDeath === 3) milestone = 'Giỗ hết';

        events.push({
          personId: person.id,
          fullName: person.full_name,
          type: 'death',
          day: death.day,
          month: death.month,
          yearsCount: yearsSinceDeath,
          milestone,
          originalDate: person.death_date,
        });
      }
    }
  });

  return events.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
};

// Nhóm danh sách sự kiện theo tháng.
export const groupEventsByMonth = (events: FamilyEvent[]) => {
  const grouped: Record<number, FamilyEvent[]> = {};

  for (let i = 1; i <= 12; i++) {
    grouped[i] = events.filter((e) => e.month === i);
  }

  return grouped;
};
