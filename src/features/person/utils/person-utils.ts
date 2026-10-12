import { Person } from '@/types';
import { normalizeSiblingOrder } from '@/lib/utils';

// Kiểm tra trạng thái đã mất dựa trên ngày mất.
export const isDeceased = (person: Person): boolean => {
  return !!person.death_date;
};

// Tính tuổi hiện tại hoặc tuổi khi qua đời.
export const calculateAge = (person: Person): number | null => {
  if (!person.birth_date) return null;

  const birthYear = new Date(person.birth_date).getFullYear();
  const endYear = person.death_date
    ? new Date(person.death_date).getFullYear()
    : new Date().getFullYear();

  return endYear - birthYear;
};

// Định dạng ngày theo DD/MM/YYYY.
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-GB').replace(/\//g, '/'); // Đảm bảo định dạng DD/MM/YYYY
};

// Kiểm tra xung đột thứ tự sinh trong cùng nhóm cha/mẹ.
export const hasSiblingOrderConflict = (
  person: Pick<Person, 'id' | 'tree_id' | 'father_id' | 'mother_id'>,
  persons: Person[],
  order: number
): boolean => {
  if (person.father_id === null && person.mother_id === null) return false;
  return persons.some(
    (p) =>
      p.id !== person.id &&
      p.tree_id === person.tree_id &&
      p.father_id === person.father_id &&
      p.mother_id === person.mother_id &&
      normalizeSiblingOrder(p.sibling_order) === order
  );
};
