import { supabase } from '../supabase';
import { Person } from '../../types';

export const personService = {
  async getAllByTree(treeId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('tree_id', treeId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(personId: string): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', personId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(person: Partial<Person>): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .insert(person)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(personId: string, updates: Partial<Person>): Promise<Person> {
    const { data, error } = await supabase
      .from('persons')
      .update(updates)
      .eq('id', personId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(personId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', personId);

    if (error) throw error;
  },

  async addFather(personId: string, fatherId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .update({ father_id: fatherId })
      .eq('id', personId);

    if (error) throw error;
  },

  async addMother(personId: string, motherId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .update({ mother_id: motherId })
      .eq('id', personId);

    if (error) throw error;
  },

  async addSpouse(personId: string, spouseId: string): Promise<void> {
    await Promise.all([
      supabase.from('persons').update({ spouse_id: spouseId }).eq('id', personId),
      supabase.from('persons').update({ spouse_id: personId }).eq('id', spouseId)
    ]);
  },

  async removeFather(personId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .update({ father_id: null })
      .eq('id', personId);

    if (error) throw error;
  },

  async removeMother(personId: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .update({ mother_id: null })
      .eq('id', personId);

    if (error) throw error;
  },

  async removeSpouse(personId: string, spouseId: string): Promise<void> {
    await Promise.all([
      supabase.from('persons').update({ spouse_id: null }).eq('id', personId),
      supabase.from('persons').update({ spouse_id: null }).eq('id', spouseId)
    ]);
  },

  async uploadAvatar(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};