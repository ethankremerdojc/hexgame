import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

export interface MenuState {
  actionHandling: string,
  actionItemsToSelectFrom: any[],
  viewOnly: boolean,
  userSubscribed: boolean
}

const initialState: MenuState = {
  actionHandling: "",
  actionItemsToSelectFrom: [],
  viewOnly: false,
  userSubscribed: false
}

const menuSlice = createSlice({
  name: "menu ",
  initialState,
  reducers: {
    setActionHandling(state, action: PayloadAction<string>) {
      state.actionHandling = action.payload;
    },
    setActionItemsToSelectFrom(state, action: PayloadAction<any[]>) {
      state.actionItemsToSelectFrom = action.payload;
    },
    setViewOnly(state, action: PayloadAction<boolean>) {
      state.viewOnly = action.payload;
    },
    setUserSubscribed(state, action: PayloadAction<boolean>) {
      state.userSubscribed = action.payload;
    },
  }
})


export const getActionHandling = (state: RootState): string => state.menu.actionHandling;
export const getActionItemsToSelectFrom = (state: RootState): any[] => state.menu.actionItemsToSelectFrom;
export const getViewOnly = (state: RootState): boolean => state.menu.viewOnly;
export const getUserSubscribed = (state: RootState): boolean => state.menu.userSubscribed;

export const {
  setActionHandling,
  setActionItemsToSelectFrom,
  setViewOnly,
  setUserSubscribed
} = menuSlice.actions;

export default menuSlice.reducer;
