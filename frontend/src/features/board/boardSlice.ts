import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from "@reduxjs/toolkit";

export type Element = {
  type: String,
  team: String
}

export type Cell = {
  x: Number,
  y: Number,
  type: String,
  contents: Element[]
};

interface BoardState {
  cells: Cell[];
}

const initialState: BoardState = {
  cells: [],
  selectedCell: null
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setCells(state, action: PayloadAction<Cell[]>) {
      state.cells = action.payload;
    },
    setSelectedCell(state, action: PayloadAction<Cell>) {
      state.selectedCell = action.payload;
    }
  },
});

export const selectCells = (state: RootState) => state.board.cells;
export const getSelectedCell = (state: RootState) => state.board.selectedCell;

export const { setCells, clearCells, setSelectedCell } = boardSlice.actions;
export default boardSlice.reducer;
