import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from "@reduxjs/toolkit";
import { BoardGenerator } from "./boardGen";

export enum HexPosition {
  Top,
  TopLeft,
  TopRight,
  Bottom,
  BottomLeft,
  BottomRight,
  Center
}

export type Element = {
  type: String,
  team: String,
  position: HexPosition
}

export function getSizeForElement(elem: Element, radius: number): number {
  let { halfRadius, buildingSize, objectSize, toolSize } = BoardGenerator.getElemSizes(radius);

  if (["worker", "soldier", "archer"].includes(elem.type)) {
    return objectSize
  }
  if (["pitchfork", "sword", "bow"].includes(elem.type)) {
    return toolSize
  }
  return buildingSize
}

export type Cell = {
  x: Number,
  y: Number,
  type: String,
  contents: Element[]
};

export type Coordinate = {
  x: Number,
  y: Number
}

interface BoardState {
  cells: Cell[];
}

const initialState: BoardState = {
  cells: [],
  selectedCell: null,
  offset: {x: 0, y: 0},
  zoom: 1.0
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
    },
    setBoardOffset(state, action: PayloadAction<Coordinate>) {
      state.offset = action.payload;
    },
    setBoardZoom(state, action: PayloadAction<Number>) {
      state.zoom = action.payload;
    }
  },
});

export const getCells = (state: RootState) => state.board.cells;
export const getSelectedCell = (state: RootState) => state.board.selectedCell;
export const getBoardZoom = (state: RootState) => state.board.zoom;
export const getBoardOffset = (state: RootState) => state.board.offset;

export const { 
  setCells,
  setSelectedCell,
  setBoardOffset,
  setBoardZoom
} = boardSlice.actions;

export default boardSlice.reducer;
