import { StateCreator } from 'zustand';
import { PersonSlice } from './person-slice';
import { TreeSlice } from './tree-slice';

export interface AppSlice {
  userId: string | null;
  isLoading: boolean;
  isReadOnly: boolean;
  
  setUserId: (userId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsReadOnly: (readOnly: boolean) => void;
}

export type StoreState = AppSlice & PersonSlice & TreeSlice;

export const createAppSlice: StateCreator<
  StoreState,
  [["zustand/immer", never]],
  [],
  AppSlice
> = (set) => ({
  userId: null,
  isLoading: true,
  isReadOnly: false,
  
  setUserId: (userId) => set((state) => {
    state.userId = userId;
  }),
  setIsLoading: (loading) => set((state) => {
    state.isLoading = loading;
  }),
  setIsReadOnly: (readOnly) => set((state) => {
    state.isReadOnly = readOnly;
  }),
});
