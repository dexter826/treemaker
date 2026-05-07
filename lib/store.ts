"use client"
import { create } from 'zustand';
import { Person, FamilyTree } from '../types';

interface AppState {
  userId: string | null;
  currentTree: FamilyTree | null;
  persons: Person[];
  selectedPersonId: string | null;
  viewPersonId: string | null;
  showCardActions: string | null;
  isReadOnly: boolean;
  isLoading: boolean;
  
  setUserId: (userId: string | null) => void;
  setCurrentTree: (tree: FamilyTree | null) => void;
  setPersons: (persons: Person[]) => void;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  removePerson: (id: string) => void;
  setSelectedPersonId: (id: string | null) => void;
  setViewPersonId: (id: string | null) => void;
  setShowCardActions: (id: string | null) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  userId: null,
  currentTree: null,
  persons: [],
  selectedPersonId: null,
  viewPersonId: null,
  showCardActions: null,
  isReadOnly: false,
  isLoading: true,
  
  setUserId: (userId) => set({ userId }),
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
  setViewPersonId: (id) => set({ viewPersonId: id }),
  setShowCardActions: (id) => set({ showCardActions: id }),
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
