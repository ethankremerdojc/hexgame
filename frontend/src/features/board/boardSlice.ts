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
  subType: String,
  team: String,
  position: HexPosition,
  id: String
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

function parseId(id) {
  const [coords, position] = id.split('|');
  const [x, y] = coords.split(',').map(Number);

  return { x, y, position };
}

export function getElementParentCell(elem: Element, cells: Cell[]) {
  let { x, y } = parseId(elem.id);
  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
      return cell
    }
  }
}

interface BoardState {
  cells: Cell[];
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

        let buildingsFound = 0;

        for (let i=0; i < cell.contents.length; i++) {
          let newElem = {...cell.contents[i]};
          if (newElem.type == "building") {
            newElem.position = HexPosition.Center;
            buildingsFound += 1;
          } else {
            newElem.position = Math.min(i-buildingsFound, 5);
          }
          newElem.id = `${cell.x},${cell.y}|${newElem.position}`;
          newContents.push(newElem);
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
