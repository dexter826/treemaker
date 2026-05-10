export type Gender = 'male' | 'female';

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
  sibling_order: number | null;
  birth_date: string | null;
  death_date: string | null;
  avatar_url: string | null;
  bio: string | null;
  occupation: string | null;
  address: string | null;
  father_id: string | null;
  mother_id: string | null;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  tree_id: string;
  person1_id: string;
  person2_id: string;
  relationship_type: 'spouse';
  created_at: string;
}

export interface TreeData {
  tree: FamilyTree;
  persons: Person[];
  relationships: Relationship[];
}
