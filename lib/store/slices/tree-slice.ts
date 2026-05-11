import { StateCreator } from 'zustand';
import { FamilyTree, Relationship } from '@/types';
import { StoreState } from './app-slice';

export interface TreeSlice {
  currentTree: FamilyTree | null;
  relationships: Relationship[];
  
  setCurrentTree: (tree: FamilyTree | null) => void;
  setRelationships: (relationships: Relationship[]) => void;
  addRelationship: (rel: Relationship) => void;
  removeRelationship: (p1: string, p2: string) => void;
  removeRelationshipsByPersonId: (personId: string) => void;
}

export const createTreeSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  TreeSlice
> = (set) => ({
  currentTree: null,
  relationships: [],
  
  setCurrentTree: (tree) => set((state) => {
    state.currentTree = tree;
  }),
  setRelationships: (relationships) => set((state) => {
    state.relationships = relationships;
  }),
  addRelationship: (rel) => set((state) => {
    state.relationships.push(rel);
  }),
  removeRelationship: (p1, p2) => set((state) => {
    state.relationships = state.relationships.filter(r => 
      !( (r.person1_id === p1 && r.person2_id === p2) || (r.person1_id === p2 && r.person2_id === p1) )
    );
  }),
  removeRelationshipsByPersonId: (personId) => set((state) => {
    state.relationships = state.relationships.filter(r => 
      r.person1_id !== personId && r.person2_id !== personId
    );
  }),
});
