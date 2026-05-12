"use client";

import { Person, FamilyTree, Relationship } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getOrderedPersons } from '@/lib/utils/tree-utils';

interface LegacyBookTemplateProps {
  tree: FamilyTree;
  persons: Person[];
  relationships: Relationship[];
}

// Template kết cấu các trang sách gia phả để chụp ảnh PDF.
export function LegacyBookTemplate({ tree, persons, relationships }: LegacyBookTemplateProps) {
  const orderedPersons = getOrderedPersons(persons, relationships);

  return (
    <div id="legacy-book-export-container" className="fixed -left-[9999px] top-0 w-[210mm]" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="page-export w-[210mm] h-[297mm] p-[20mm] flex flex-col items-center justify-center border-[10px] border-double relative" style={{ borderColor: 'var(--foreground)' }}>
        <div className="absolute inset-[5mm] border-2" style={{ borderColor: 'var(--foreground)' }} />
        <h1 className="font-serif font-black text-8xl text-center uppercase tracking-tighter mb-4 z-10">
          Gia Phả
        </h1>
        <h2 className="font-serif font-black text-2xl text-center uppercase tracking-[0.3em] mb-12 z-10 opacity-50">
          Dòng Họ
        </h2>
        <div className="w-32 h-2 mb-12 z-10" style={{ backgroundColor: 'var(--foreground)' }} />
        <h3 className="font-serif font-black text-5xl text-center uppercase tracking-tight z-10" style={{ color: 'var(--primary)' }}>
          {tree.name}
        </h3>
        <p className="mt-12 font-serif italic text-xl z-10">
          &quot;Lưu giữ cội nguồn cho mai sau&quot;
        </p>
        <div className="absolute bottom-[20mm] font-bold tracking-widest text-sm z-10">
          XUẤT BẢN NGÀY {format(new Date(), 'dd/MM/yyyy', { locale: vi }).toUpperCase()}
        </div>
      </div>

      {orderedPersons.map((person) => {
        const isMale = person.gender === 'male';
        const genderColor = isMale ? 'var(--male)' : 'var(--female)';
        
        return (
          <div key={person.id} className="page-export w-[210mm] h-[297mm] p-[25mm] flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
            <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: genderColor }} />
            
            <div className="flex items-start gap-8 mb-12 pt-8">
              <Avatar className="h-40 w-40 border-4 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shrink-0" style={{ borderColor: 'var(--foreground)' }}>
                <AvatarImage src={person.avatar_url || ''} className="object-cover" />
                <AvatarFallback className="rounded-none font-serif font-black text-6xl" style={{ color: genderColor, backgroundColor: '#ffffff' }}>
                  {person.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-4">
                <h2 className="font-serif font-black text-4xl uppercase tracking-tighter leading-none mb-2">
                  {person.full_name}
                </h2>
                {person.nickname && (
                  <p className="text-xl font-serif italic text-muted-foreground">
                    &quot;{person.nickname}&quot;
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                   <Badge label="Giới tính" value={isMale ? 'Nam' : 'Nữ'} color={genderColor} />
                   <Badge label="Thứ tự" value={person.sibling_order ? `Con thứ ${person.sibling_order}` : '-'} color={genderColor} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <Section title="Thông tin cơ bản">
                  <InfoRow label="Ngày sinh" value={person.birth_date ? format(new Date(person.birth_date), 'dd/MM/yyyy') : 'Không rõ'} />
                  {person.death_date && <InfoRow label="Ngày mất" value={format(new Date(person.death_date), 'dd/MM/yyyy')} isDestructive />}
                  <InfoRow label="Nghề nghiệp" value={person.occupation || 'Không rõ'} />
                  <InfoRow label="Địa chỉ" value={person.address || 'Không rõ'} />
                </Section>
              </div>
              
              <div className="space-y-6">
                <Section title="Quan hệ gia đình">
                  <p className="text-sm font-bold text-muted-foreground italic">
                    (Xem sơ đồ tổng quát để biết chi tiết các mối quan hệ)
                  </p>
                </Section>
              </div>
            </div>

            <Section title="Tiểu sử & Ghi chú" className="flex-1">
              <p className="text-lg leading-relaxed italic whitespace-pre-wrap">
                {person.bio || 'Chưa có thông tin tiểu sử chi tiết cho thành viên này.'}
              </p>
            </Section>

            <div className="absolute bottom-[10mm] left-0 w-full text-center font-bold text-sm text-muted-foreground pt-4" style={{ borderTop: `1px solid var(--border)` }}>
              Gia Phả {tree.name} • Hồ sơ: {person.full_name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground pb-2" style={{ borderBottom: `2px solid var(--border)` }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, isDestructive = false }: { label: string; value: string; isDestructive?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase text-muted-foreground/60">{label}</span>
      <span className={cn("text-lg font-bold", isDestructive && "text-destructive")}>{value}</span>
    </div>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border-2 px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col" style={{ borderColor: 'var(--foreground)', backgroundColor: `color-mix(in srgb, ${color}, transparent 90%)` }}>
       <span className="text-[8px] font-black uppercase leading-none mb-1">{label}</span>
       <span className="text-xs font-black leading-none">{value}</span>
    </div>
  );
}
