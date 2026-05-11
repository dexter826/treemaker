import { Person } from '@/types';

/**
 * Kiểm tra xem một người đã qua đời hay chưa dựa trên ngày mất.
 */
export const isDeceased = (person: Person): boolean => {
  return !!person.death_date;
};

/**
 * Tính toán tuổi hiện tại hoặc tuổi lúc mất.
 */
export const calculateAge = (person: Person): number | null => {
  if (!person.birth_date) return null;
  
  const birthYear = new Date(person.birth_date).getFullYear();
  const endYear = person.death_date 
    ? new Date(person.death_date).getFullYear() 
    : new Date().getFullYear();
    
  return endYear - birthYear;
};

/**
 * Định dạng chuỗi hiển thị năm sinh - năm mất.
 */
export const formatLifeSpan = (person: Person): string => {
  const birth = person.birth_date ? new Date(person.birth_date).getFullYear() : '—';
  const death = person.death_date ? new Date(person.death_date).getFullYear() : '—';
  
  return `${birth} / ${death}`;
};
