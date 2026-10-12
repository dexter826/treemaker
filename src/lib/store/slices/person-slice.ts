import { StateCreator } from 'zustand';
import { Person } from '@/types';
import { StoreState } from './app-slice';

export interface PersonSlice {
  persons: Person[];
  selectedPersonId: string | null;
  viewPersonId: string | null;
  showCardActions: string | null;
  
  setPersons: (persons: Person[]) => void;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  removePerson: (id: string) => void;
  setSelectedPersonId: (id: string | null) => void;
  setViewPersonId: (id: string | null) => void;
  setShowCardActions: (id: string | null) => void;
}

export const createPersonSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  PersonSlice
> = (set) => ({
  persons: [],
  selectedPersonId: null,
  viewPersonId: null,
  showCardActions: null,
  
  setPersons: (persons) => set((state) => {
    state.persons = persons;
  }),
  addPerson: (person) => set((state) => {
    state.persons.push(person);
  }),
  updatePerson: (updated) => set((state) => {
    const index = state.persons.findIndex((p) => p.id === updated.id);
    if (index !== -1) {
      state.persons[index] = updated;
    }
  }),
  removePerson: (id) => set((state) => {
    state.persons = state.persons.filter(p => p.id !== id);
    
    state.relationships = state.relationships.filter(r => 
      r.person1_id !== id && r.person2_id !== id
    );

    if (state.selectedPersonId === id) state.selectedPersonId = null;
    if (state.viewPersonId === id) state.viewPersonId = null;
    if (state.showCardActions === id) state.showCardActions = null;
  }),
  setSelectedPersonId: (id) => set((state) => {
    state.selectedPersonId = id;
  }),
  setViewPersonId: (id) => set((state) => {
    state.viewPersonId = id;
  }),
  setShowCardActions: (id) => set((state) => {
    state.showCardActions = id;
  }),
});
