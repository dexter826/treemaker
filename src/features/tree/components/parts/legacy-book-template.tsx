'use client';

import { Person, FamilyTree, Relationship } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getOrderedPersons } from '../../utils/tree-utils';

interface LegacyBookTemplateProps {
  tree: FamilyTree;
  persons: Person[];
  relationships: Relationship[];
}

// Template kết cấu các trang sách gia phả để chụp ảnh PDF.
export function LegacyBookTemplate({
  tree,
  persons,
  relationships,
}: LegacyBookTemplateProps) {
  const orderedPersons = getOrderedPersons(persons, relationships);

  return (
    <div
      id="legacy-book-export-container"
      className="fixed top-0 -left-[9999px] w-[210mm]"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <div
        className="page-export relative flex h-[297mm] w-[210mm] flex-col items-center justify-center border-[10px] border-double p-[20mm]"
        style={{ borderColor: 'var(--foreground)' }}
      >
        <div
          className="absolute inset-[5mm] border-2"
          style={{ borderColor: 'var(--foreground)' }}
        />
        <h1 className="z-10 mb-4 text-center font-serif text-8xl font-black tracking-tighter uppercase">
          Gia Phả
        </h1>
        <h2 className="z-10 mb-12 text-center font-serif text-2xl font-black tracking-[0.3em] uppercase opacity-50">
          Dòng Họ
        </h2>
        <div
          className="z-10 mb-12 h-2 w-32"
          style={{ backgroundColor: 'var(--foreground)' }}
        />
        <h3
          className="z-10 text-center font-serif text-5xl font-black tracking-tight uppercase"
          style={{ color: 'var(--primary)' }}
        >
          {tree.name}
        </h3>
        <p className="z-10 mt-12 font-serif text-xl italic">
          &quot;Lưu giữ cội nguồn cho mai sau&quot;
        </p>
        <div className="absolute bottom-[20mm] z-10 text-sm font-bold tracking-widest">
          XUẤT BẢN NGÀY{' '}
          {format(new Date(), 'dd/MM/yyyy', { locale: vi }).toUpperCase()}
        </div>
      </div>

      {orderedPersons.map((person) => {
        const isMale = person.gender === 'male';
        const genderColor = isMale ? 'var(--male)' : 'var(--female)';

        return (
          <div
            key={person.id}
            className="page-export relative flex h-[297mm] w-[210mm] flex-col overflow-hidden p-[25mm]"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div
              className="absolute top-0 left-0 h-4 w-full"
              style={{ backgroundColor: genderColor }}
            />

            <div className="mb-12 flex items-start gap-8 pt-8">
              <Avatar
                className="shadow-brutal-lg h-40 w-40 shrink-0 rounded-none border-4"
                style={{ borderColor: 'var(--foreground)' }}
              >
                <AvatarImage
                  src={person.avatar_url || ''}
                  className="object-cover"
                />
                <AvatarFallback
                  className="rounded-none font-serif text-6xl font-black"
                  style={{ color: genderColor, backgroundColor: '#ffffff' }}
                >
                  {person.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 pt-4">
                <h2 className="mb-2 font-serif text-4xl leading-none font-black tracking-tighter uppercase">
                  {person.full_name}
                </h2>
                {person.nickname && (
                  <p className="text-muted-foreground font-serif text-xl italic">
                    &quot;{person.nickname}&quot;
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                  <Badge
                    label="Giới tính"
                    value={isMale ? 'Nam' : 'Nữ'}
                    color={genderColor}
                  />
                  <Badge
                    label="Thứ tự"
                    value={
                      person.sibling_order
                        ? `Con thứ ${person.sibling_order}`
                        : '-'
                    }
                    color={genderColor}
                  />
                </div>
              </div>
            </div>

            <div className="mb-12 grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <Section title="Thông tin cơ bản">
                  <InfoRow
                    label="Ngày sinh"
                    value={
                      person.birth_date
                        ? format(new Date(person.birth_date), 'dd/MM/yyyy')
                        : 'Không rõ'
                    }
                  />
                  {person.death_date && (
                    <InfoRow
                      label="Ngày mất"
                      value={format(new Date(person.death_date), 'dd/MM/yyyy')}
                      isDestructive
                    />
                  )}
                  <InfoRow
                    label="Nghề nghiệp"
                    value={person.occupation || 'Không rõ'}
                  />
                  <InfoRow
                    label="Địa chỉ"
                    value={person.address || 'Không rõ'}
                  />
                </Section>
              </div>

              <div className="space-y-6">
                <Section title="Quan hệ gia đình">
                  <p className="text-muted-foreground text-sm font-bold italic">
                    (Xem sơ đồ tổng quát để biết chi tiết các mối quan hệ)
                  </p>
                </Section>
              </div>
            </div>

            <Section title="Tiểu sử & Ghi chú" className="flex-1">
              <p className="text-lg leading-relaxed whitespace-pre-wrap italic">
                {person.bio ||
                  'Chưa có thông tin tiểu sử chi tiết cho thành viên này.'}
              </p>
            </Section>

            <div
              className="text-muted-foreground absolute bottom-[10mm] left-0 w-full pt-4 text-center text-sm font-bold"
              style={{ borderTop: `1px solid var(--border)` }}
            >
              Gia Phả {tree.name} • Hồ sơ: {person.full_name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3
        className="text-muted-foreground pb-2 text-xs font-black tracking-[0.2em] uppercase"
        style={{ borderBottom: `2px solid var(--border)` }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  isDestructive = false,
}: {
  label: string;
  value: string;
  isDestructive?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground/60 text-[10px] font-black uppercase">
        {label}
      </span>
      <span
        className={cn('text-lg font-bold', isDestructive && 'text-destructive')}
      >
        {value}
      </span>
    </div>
  );
}

function Badge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="shadow-brutal-sm flex flex-col border-2 px-3 py-1"
      style={{
        borderColor: 'var(--foreground)',
        backgroundColor: `color-mix(in srgb, ${color}, transparent 90%)`,
      }}
    >
      <span className="mb-1 text-[8px] leading-none font-black uppercase">
        {label}
      </span>
      <span className="text-xs leading-none font-black">{value}</span>
    </div>
  );
}
