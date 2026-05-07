import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

import type {
  Cell, Element
} from "@/features/game/gameTypes"

import type {
  Coordinate
} from "@/features/board/boardTypes"

export interface BoardState {
  backupCells: Cell[],
  selectedCell: Cell|null,
  selectedElement: Element|null,
  offset: Coordinate,
  zoom: number,
  showMoveInfo: boolean,
}

const initialState: BoardState = {
  backupCells: [],
  selectedCell: null,
  selectedElement: null,
  offset: {x: 0, y: 0},
  zoom: 1.0,
  showMoveInfo: false,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setBackupCells(state, action: PayloadAction<Cell[]>) {
      state.backupCells = action.payload;
    },
    setSelectedCell(state, action: PayloadAction<Cell|null>) {
      state.selectedCell = action.payload;
    },
    setSelectedElement(state, action: PayloadAction<Element|null>) {
      state.selectedElement = action.payload;
    },
    setBoardOffset(state, action: PayloadAction<Coordinate>) {
      state.offset = action.payload;
    },
    setBoardZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    setShowMoveInfo(state, action: PayloadAction<boolean>) {
      state.showMoveInfo = action.payload;
    },
    clearAll(state) {
      state.selectedCell = null;
      state.selectedElement = null;
      state.showMoveInfo = null;
    }
  }
})

export const getSelectedCell = (state: RootState): Cell|null => state.board.selectedCell;
export const getSelectedElement = (state: RootState): Element|null => state.board.selectedElement;
export const getBoardOffset = (state: RootState): Coordinate => state.board.offset;
export const getBoardZoom = (state: RootState): number => state.board.zoom;
export const getShowMoveInfo = (state: RootState): boolean => state.board.showMoveInfo;
export const getBackupCells = (state: RootState): boolean => state.board.backupCells;

export const { 
  setBackupCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom,
  setShowMoveInfo,
  clearAll
} = boardSlice.actions;

export default boardSlice.reducer;
