export const COUNTRIES = [
  { code: 'VN', name: 'Việt Nam' },
  { code: 'US', name: 'Hoa Kỳ' },
  { code: 'JP', name: 'Nhật Bản' },
  { code: 'KR', name: 'Hàn Quốc' },
  { code: 'DE', name: 'Đức' },
  { code: 'FR', name: 'Pháp' },
  { code: 'UK', name: 'Vương quốc Anh' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'SG', name: 'Singapore' },
  { code: 'TW', name: 'Đài Loan' },
  { code: 'RU', name: 'Nga' },
  { code: 'CN', name: 'Trung Quốc' },
  { code: 'TH', name: 'Thái Lan' },
  { code: 'LA', name: 'Lào' },
  { code: 'KH', name: 'Campuchia' },
];

export const getCountryByCode = (code: string | null) => {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) || null;
};
