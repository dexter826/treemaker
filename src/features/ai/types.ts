import { FamilyTree, Relationship } from '@/types';

export interface ChatPersonContext {
  id: string;
  name: string;
  gen: 'M' | 'F';
  fid: string | null;
  mid: string | null;
  birth: string | null;
}

export interface ChatDataContext {
  tree: FamilyTree | null;
  persons: ChatPersonContext[];
  relationships: Relationship[];
}
