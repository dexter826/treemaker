import { supabase } from '../supabase';
import { FamilyTree, Person } from '../../types';
import { personService } from './person.service';

const mapTreeError = (error: unknown): Error => {
  const raw = error as { message?: string };
  return error instanceof Error ? error : new Error(String(raw?.message ?? 'Đã xảy ra lỗi cây gia phả.'));
};

const isFamilyTree = (value: unknown): value is FamilyTree => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FamilyTree>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.owner_id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.share_token === 'string'
  );
};

export const treeService = {
  async getAllByUser(userId: string): Promise<FamilyTree[]> {
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw mapTreeError(error);
    return data ?? [];
  },

  async getById(treeId: string): Promise<FamilyTree> {
    const { data, error } = await supabase.from('family_trees').select('*').eq('id', treeId).single();

    if (error) throw mapTreeError(error);
    return data;
  },

  async getByShareToken(token: string): Promise<FamilyTree | null> {
    const { data, error } = await supabase.from('family_trees').select('*').eq('share_token', token).single();

    if (error || !data) {
      return null;
    }
    return data;
  },


  async create(userId: string, name: string): Promise<FamilyTree> {
    const { data, error } = await supabase.rpc('create_tree_with_root', {
      p_owner_id: userId,
      p_name: name,
    });

    if (error) throw mapTreeError(error);
    if (!isFamilyTree(data)) {
      throw new Error('Dữ liệu cây gia phả trả về không hợp lệ.');
    }
    return data;
  },

  async update(treeId: string, updates: Partial<FamilyTree>): Promise<FamilyTree> {
    const { data, error } = await supabase
      .from('family_trees')
      .update(updates)
      .eq('id', treeId)
      .select()
      .single();

    if (error) throw mapTreeError(error);
    return data;
  },

  async delete(treeId: string): Promise<void> {
    const { error } = await supabase.from('family_trees').delete().eq('id', treeId);
    if (error) throw mapTreeError(error);
  },
};
