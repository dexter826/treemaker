export type Gender = 'male' | 'female' | 'other';

export interface FamilyTree {
  id: string;
  owner_id: string;
  name: string;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  tree_id: string;
  full_name: string;
  gender: Gender;
  birth_date: string | null;
  death_date: string | null;
  avatar_url: string | null;
  bio: string | null;
  occupation: string | null;
  address: string | null;
  father_id: string | null;
  mother_id: string | null;
  spouse_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreeData {
  tree: FamilyTree;
  persons: Person[];
}
