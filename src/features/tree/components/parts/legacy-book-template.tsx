'use client';

import { Person, FamilyTree, Relationship } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getOrderedPersons } from '../../utils/tree-utils';
import './legacy-book.css';

interface LegacyBookTemplateProps {
  tree: FamilyTree;
  persons: Person[];
  relationships: Relationship[];
}

export function LegacyBookTemplate({
  tree,
  persons,
  relationships,
}: LegacyBookTemplateProps) {
  const orderedPersons = getOrderedPersons(persons, relationships);
  const exportDate = format(new Date(), 'dd/MM/yyyy', { locale: vi });

  return (
    <div
      id="legacy-book-export-container"
      className="legacy-book fixed top-0 -left-[9999px] w-[210mm]"
    >
      <div className="lb-cover page-export relative flex h-[297mm] w-[210mm] flex-col items-center justify-center p-[20mm]">
        <div className="lb-cover-frame absolute inset-[5mm]" />

        <Image
          src="/brand/roundel.svg"
          alt=""
          width={174}
          height={174}
          unoptimized
          className="z-10 mb-10 size-[46mm]"
        />

        <h1 className="lb-display z-10 text-center">Gia phả</h1>
        <p className="lb-subtitle z-10 mt-2 text-center">Dòng họ</p>

        <div className="lb-cover-rule z-10 my-10 w-32" />

        <h2 className="lb-tree-name z-10 text-center">{tree.name}</h2>

        <p className="lb-footer absolute bottom-[20mm] z-10">
          Xuất bản ngày {exportDate}
        </p>
      </div>

      {orderedPersons.map((person) => {
        const isMale = person.gender === 'male';
        const genderColor = isMale
          ? 'var(--print-male)'
          : 'var(--print-female)';

        return (
          <div
            key={person.id}
            className="page-export relative flex h-[297mm] w-[210mm] flex-col overflow-hidden p-[25mm]"
          >
            <div
              className="lb-gender-band absolute top-0 left-0 w-full"
              style={{ backgroundColor: genderColor }}
            />

            <div className="mb-12 flex items-start gap-8 pt-8">
              <Avatar className="lb-avatar size-40 shrink-0">
                <AvatarImage
                  src={person.avatar_url || ''}
                  className="object-cover"
                />
                <AvatarFallback
                  className="lb-avatar-fallback"
                  style={{ color: genderColor }}
                >
                  {person.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 pt-4">
                <h2 className="lb-name">{person.full_name}</h2>
                {person.nickname && (
                  <p className="lb-nickname mt-1">{person.nickname}</p>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                  <Chip
                    label="Giới tính"
                    value={isMale ? 'Nam' : 'Nữ'}
                    color={genderColor}
                  />
                  <Chip
                    label="Thứ tự sinh"
                    value={
                      person.sibling_order
                        ? `Con thứ ${person.sibling_order}`
                        : 'Chưa rõ'
                    }
                    color={genderColor}
                  />
                </div>
              </div>
            </div>

            <div className="mb-12 grid grid-cols-2 gap-12">
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
                    muted
                  />
                )}
                <InfoRow
                  label="Nghề nghiệp"
                  value={person.occupation || 'Không rõ'}
                />
                <InfoRow label="Nơi ở" value={person.address || 'Không rõ'} />
              </Section>

              <Section title="Quan hệ gia đình">
                <p className="lb-value-muted text-body-sm">
                  Xem sơ đồ ở trang đầu kỷ yếu để biết cha mẹ, vợ/chồng và con
                  của người này.
                </p>
              </Section>
            </div>

            <Section title="Tiểu sử và ghi chú" className="flex-1">
              <p className="lb-bio whitespace-pre-wrap">
                {person.bio ||
                  'Chưa có tiểu sử cho thành viên này. Bổ sung trong ứng dụng, nội dung sẽ vào kỷ yếu ở lần xuất sau.'}
              </p>
            </Section>

            <div className="lb-page-rule lb-footer absolute bottom-[10mm] left-0 w-full pt-4 text-center">
              Gia phả {tree.name} · Hồ sơ {person.full_name}
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
    <section className={cn('flex flex-col gap-4', className)}>
      <h3 className="lb-section-title pb-2">{title}</h3>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="lb-label">{label}</span>
      <span className={cn('lb-value', muted && 'lb-value-muted')}>{value}</span>
    </div>
  );
}

function Chip({
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
      className="lb-chip flex flex-col gap-1"
      style={{ backgroundColor: `color-mix(in srgb, ${color}, white 88%)` }}
    >
      <span className="lb-label">{label}</span>
      <span className="lb-value">{value}</span>
    </div>
  );
}
