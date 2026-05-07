import { supabase } from '../supabase';
import { FamilyTree, Person } from '../../types';
import { personService } from './person.service';

export const treeService = {
  async getAllByUser(userId: string): Promise<FamilyTree[]> {
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(treeId: string): Promise<FamilyTree> {
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('id', treeId)
      .single();

    if (error) throw error;
    return data;
  },

  async getByShareToken(token: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('family_trees')
      .select('id')
      .eq('share_token', token)
      .single();

    if (error || !data) return null;
    return data.id;
  },

  async create(userId: string, name: string): Promise<FamilyTree> {
    const { data: tree, error: treeError } = await supabase
      .from('family_trees')
      .insert({ owner_id: userId, name: name.trim() })
      .select()
      .single();

    if (treeError) throw treeError;

    const { error: rootError } = await supabase
      .from('persons')
      .insert({
        tree_id: tree.id,
        full_name: 'Khuyết Danh',
        gender: 'other'
      });

    if (rootError) throw rootError;

    return tree;
  },

  async update(treeId: string, updates: Partial<FamilyTree>): Promise<FamilyTree> {
    const { data, error } = await supabase
      .from('family_trees')
      .update(updates)
      .eq('id', treeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(treeId: string): Promise<void> {
    const { error } = await supabase
      .from('family_trees')
      .delete()
      .eq('id', treeId);

    if (error) throw error;
  },

  async loadWithPersons(treeId: string): Promise<{ tree: FamilyTree; persons: Person[] }> {
    const [tree, persons] = await Promise.all([
      this.getById(treeId),
      personService.getAllByTree(treeId)
    ]);
    return { tree, persons };
  }
};