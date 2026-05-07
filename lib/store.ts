"use client"
import { create } from 'zustand';
import { Person, FamilyTree } from '../types';

interface AppState {
  currentTree: FamilyTree | null;
  persons: Person[];
  selectedPersonId: string | null;
  isReadOnly: boolean;
  isLoading: boolean;
  
  setCurrentTree: (tree: FamilyTree | null) => void;
  setPersons: (persons: Person[]) => void;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  removePerson: (id: string) => void;
  setSelectedPersonId: (id: string | null) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  currentTree: null,
  persons: [],
  selectedPersonId: null,
  isReadOnly: false,
  isLoading: true,
  
  setCurrentTree: (tree) => set({ currentTree: tree }),
  setPersons: (persons) => set({ persons }),
  addPerson: (person) => set((state) => ({ persons: [...state.persons, person] })),
  updatePerson: (updated) => set((state) => ({
    persons: state.persons.map((p) => p.id === updated.id ? updated : p)
  })),
  removePerson: (id) => set((state) => ({
    persons: state.persons.filter(p => p.id !== id),
    selectedPersonId: state.selectedPersonId === id ? null : state.selectedPersonId
  })),
  setSelectedPersonId: (id) => set({ selectedPersonId: id }),
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
