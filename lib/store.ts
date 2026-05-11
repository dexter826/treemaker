"use client"

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createAppSlice, StoreState } from './store/slices/app-slice';
import { createPersonSlice } from './store/slices/person-slice';
import { createTreeSlice } from './store/slices/tree-slice';

export const useStore = create<StoreState>()(
  immer((...a) => ({
    ...createAppSlice(...a),
    ...createPersonSlice(...a),
    ...createTreeSlice(...a),
  }))
);
