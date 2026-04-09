import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from "@reduxjs/toolkit";

export enum HexPosition {
  Center,
  Top,
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

export enum ElementType {
  Building,
  Person,
  Item
}

export enum ElementSubType {

  // buildings 
  Capital,
  Village,
  Farm,
  Quarry,

  // persons
  Worker,
  Soldier,
  Archer,

  // items
  Food,
  Wood,
  Ore,
  Gold
}

export enum CellType {
  Field,
  Water,
  Forest,
  Mountain
}

export enum TeamColor {
  White,
  Purple,
  Red,
  Yellow,
  Blue,
  Green
}

export function colorForTeam(teamVal) {
  return [
    "white",
    "purple",
    "red",
    "yellow",
    "blue",
    "green"
  ][teamVal]
}

export type Element = {
  type: ElementType,
  subType: ElementSubType,
  team: TeamColor|void,
  position: HexPosition,
  id: string,
  count: number|void
}

export type Cell = {
  x: number,
  y: number,
  type: CellType,
  contents: Element[]
};

export const CELL_INFO_BY_TYPE = {
  0: { // Field
    color: "rgb(16 108 14)",
    weight: 1
  },
  1: { // Water
    color: "rgb(32 35 196)",
    weight: 0.4
  },
  2: { // Forest
    color: "rgb(91 41 10)",
    weight: 0.5
  },
  3: { // Mountain
    color: "rgb(75 69 66)",
    weight: 0.3
  }
}

export type Coordinate = {
  x: number,
  y: number
}

export function parseElementId(id) {
  const [coords, position] = id.split('|');
  const [x, y] = coords.split(',').map(Number);

  return { x, y, position };
}

interface BoardState {
  cells: Cell[],
  selectedCell: Cell,
  selectedElement: Element,
  offset: Coordinate,
  zoom: number
}

const initialState: BoardState = {
  cells: [],
  selectedCell: null,
  selectedElement: null,
  offset: {x: 0, y: 0},
  zoom: 1.0
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setCells(state, action: PayloadAction<Cell[]>) {
      let cells = action.payload;
      let newCells = [];

      for (var cell of cells) {
        let newCell = {...cell};
        let newContents = [];

        //TODO 
        // instead of 3 filters, loop through all and populate
        let personElements = cell.contents.filter(e => e.type == ElementType.Person);
        let buildingElements = cell.contents.filter(e => e.type == ElementType.Building);
        let itemElements = cell.contents.filter(e => e.type == ElementType.Item);
        
        if (buildingElements.length > 0) {
          let building = {...buildingElements[0]};
          building.position = 0;
          newContents.push(building);
        }

        for (let i=0; i < personElements.length; i++) {
          let newElem = {...personElements[i]};
          if (buildingElements.length == 0) {
            newElem.position = i;
          } else {
            newElem.position = i + 1;
          }

          newElem.id = `${cell.x},${cell.y}|${newElem.position}`;
          newContents.push(newElem);
        }

        for (var ie of itemElements) {
          newContents.push(ie);
        }

        newCell.contents = newContents;
        newCells.push(newCell);
      }
      state.cells = newCells;
    },
    setSelectedCell(state, action: PayloadAction<Cell>) {
      state.selectedCell = action.payload;
    },
    setBoardOffset(state, action: PayloadAction<Coordinate>) {
      state.offset = action.payload;
    },
    setBoardZoom(state, action: PayloadAction<Number>) {
      state.zoom = action.payload;
    },
    setSelectedElement(state, action: Payload<Element>) {
      state.selectedElement = action.payload;
    }
  },
});

export const getCells = (state: RootState) => state.board.cells;
export const getSelectedCell = (state: RootState) => state.board.selectedCell;
export const getSelectedElement = (state: RootState) => state.board.selectedElement;
export const getBoardZoom = (state: RootState) => state.board.zoom;
export const getBoardOffset = (state: RootState) => state.board.offset;

export const { 
  setCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom
} = boardSlice.actions;

export default boardSlice.reducer;
