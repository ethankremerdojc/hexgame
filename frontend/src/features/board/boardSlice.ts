// src/features/board/boardSlice.ts
//
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from "@reduxjs/toolkit";

export type Point = [number, number];

interface BoardState {
  points: Point[];
}

const initialState: BoardState = {
  points: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setPoints(state, action: PayloadAction<Point[]>) {
      state.points = action.payload;
    },
    addPoint(state, action: PayloadAction<Point>) {
      state.points.push(action.payload);
    },
    removePoint(state, action: PayloadAction<number>) {
      state.points.splice(action.payload, 1);
    },
    clearPoints(state) {
      state.points = [];
    },
  },
});

export const selectPoints = (state: RootState) => state.board.points;

export const { setPoints, addPoint, removePoint, clearPoints } = boardSlice.actions;
export default boardSlice.reducer;
