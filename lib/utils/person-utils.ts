import { Person } from '@/types';

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


