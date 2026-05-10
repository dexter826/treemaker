import { supabase } from '../supabase';
import { Person, Relationship, TreeData } from '../../types';

export type RelationType = 'father' | 'mother' | 'spouse';

const normalizeSiblingOrder = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const mapPersonError = (error: unknown): Error => {
  const raw = error as { code?: string; message?: string };
  const message = String(raw?.message ?? 'Đã xảy ra lỗi hệ thống.');

  const errorMap: Record<string, string> = {
    '23505': 'Dữ liệu đã tồn tại hoặc bị trùng lặp.',
    'Father must be male': 'Người cha phải có giới tính Nam.',
    'Mother must be female': 'Người mẹ phải có giới tính Nữ.',
    'Spouses must have different genders': 'Vợ và chồng phải có giới tính khác nhau.',
    'Cannot link a person to themselves': 'Không thể tạo quan hệ với chính mình.',
    'Circular relationship detected': 'Phát hiện vòng lặp quan hệ (không thể gán tổ tiên làm con).',
    'Must be in the same tree': 'Chỉ có thể liên kết người trong cùng một cây.',
  };

  for (const [key, val] of Object.entries(errorMap)) {
    if (message.includes(key)) return new Error(val);
  }

  return error instanceof Error ? error : new Error(message);
};

export const personService = {
  async getTreeData(treeId: string): Promise<TreeData> {
    const [treeRes, personsRes, relsRes] = await Promise.all([
      supabase.from('family_trees').select('*').eq('id', treeId).single(),
      supabase.from('persons').select('*').eq('tree_id', treeId).order('sibling_order', { ascending: true }),
      supabase.from('relationships').select('*').eq('tree_id', treeId)
    ]);

    if (treeRes.error) throw mapPersonError(treeRes.error);
    if (personsRes.error) throw mapPersonError(personsRes.error);
    if (relsRes.error) throw mapPersonError(relsRes.error);

    return {
      tree: treeRes.data,
      persons: personsRes.data ?? [],
      relationships: relsRes.data ?? []
    };
  },

  async create(person: Partial<Person>): Promise<Person> {
    const payload = {
      ...person,
      sibling_order: normalizeSiblingOrder(person.sibling_order),
    };
    const { data, error } = await supabase.from('persons').insert(payload).select().single();
    if (error) throw mapPersonError(error);
    return data;
  },

  async update(personId: string, updates: Partial<Person>): Promise<Person> {
    const payload: Partial<Person> = { ...updates };
    if ('sibling_order' in updates) {
      payload.sibling_order = normalizeSiblingOrder(updates.sibling_order);
    }
    const { data, error } = await supabase.from('persons').update(payload).eq('id', personId).select().single();
    if (error) throw mapPersonError(error);
    return data;
  },

  async delete(personId: string): Promise<void> {
    const { error } = await supabase.from('persons').delete().eq('id', personId);
    if (error) throw mapPersonError(error);
  },

  async linkRelation(relationType: RelationType, sourceId: string, targetId: string): Promise<Relationship | null> {
    const { error } = await supabase.rpc('link_person_relation', {
      relation_type: relationType,
      source_id: sourceId,
      target_id: targetId,
    });
    if (error) throw mapPersonError(error);

    if (relationType === 'spouse') {
      const { data } = await supabase.from('relationships')
        .select('*')
        .or(`and(person1_id.eq.${sourceId},person2_id.eq.${targetId}),and(person1_id.eq.${targetId},person2_id.eq.${sourceId})`)
        .single();
      return data;
    }
    return null;
  },

  async unlinkRelation(relationType: RelationType, sourceId: string, targetId?: string): Promise<void> {
    const { error } = await supabase.rpc('unlink_person_relation', {
      relation_type: relationType,
      source_id: sourceId,
      target_id: targetId ?? null,
    });
    if (error) throw mapPersonError(error);
  },

  async uploadAvatar(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) throw mapPersonError(error);

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrl;
  },

};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
