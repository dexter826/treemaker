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
 * Định dạng ngày tháng đầy đủ DD/MM/YYYY.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleDateString('en-GB').replace(/\//g, '/'); // Đảm bảo định dạng DD/MM/YYYY
};


