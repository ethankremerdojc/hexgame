import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

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

export enum ElementAction {
  Move,
  Take,
  Drop,
  Fight,
  Build,
  Destroy
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



export type Element = {
  type: ElementType,
  subType: ElementSubType,
  team: TeamColor|null,
  position: HexPosition|null,
  id: string,
  count: number|null,
  heldElements: Element[]
}

// maybe make this hve a coordinate inside? 
export type Cell = {
  x: number,
  y: number,
  type: CellType,
  elements: Element[]
}

export type Coordinate = {
  x: number,
  y: number
}

export function colorForTeam(teamVal: TeamColor|null): string {

  if (teamVal === null) {
    return ""
  }

  return [
    "white",
    "purple",
    "red",
    "yellow",
    "blue",
    "green"
  ][teamVal]
}

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

export function parseElementId(id: string): any {
  const [coords, position] = id.split('|');
  const [x, y] = coords.split(',').map(Number);

  return { x, y, position };
}

function updateElemAttributes(elem: Element, cell: Cell): Element {
  let newElem = {...elem};
  newElem.id = `${cell.x},${cell.y}|${newElem.position}`; 

  if (newElem.type == ElementType.Person) {
    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {
      for (var he of newElem.heldElements) {
        if (!he.count) {
          he.count = 1;
        }
      }
    }
    if (!newElem.count) {
      newElem.count = 1;
    }
  }

  return newElem;
}

function updateCellElementPositions(elements: Element[]): Element[] {

  let personElements = [], buildingElements = [], itemElements = [];

  for (var elem of elements) {
    if (elem.type == ElementType.Person) {
      personElements.push(elem);
    }
    if (elem.type == ElementType.Building) {
      buildingElements.push(elem);
    }
    if (elem.type == ElementType.Item) {
      itemElements.push(elem);
    }
  }

  let newElements = [];

  if (buildingElements.length > 0) {
    let building = {...buildingElements[0]};
    building.position = 0;
    newElements.push(building);
  }

  for (let i=0; i < personElements.length; i++) {
    let newElem = {...personElements[i]};
    if (buildingElements.length == 0) {
      newElem.position = i;
    } else {
      newElem.position = i + 1;
    }
  }

  return newElements
}

function updateCellElements(cell: Cell): Element[] {

  let newElements = [...cell.elements];
  newElements = updateCellElementPositions(newElements);

  for (var elem of newElements) {
    newElements.push(updateElemAttributes(elem, cell));
  }

  return newElements;
}

function prepareCellsForStateSave(cells: Cell[]): Cell[] {
  let newCells = [];

  for (var cell of cells) {
    let newCell = {...cell};
    let newElements = updateCellElements(newCell);
    newCell.elements = newElements;
    newCells.push(newCell);
  }

  return newCells
}

export interface BoardState {
  cells: Cell[],
  selectedCell: Cell|null,
  selectedElement: Element|null,
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
      // state.cells = cells;
      let newCells = prepareCellsForStateSave(cells);
      state.cells = newCells;
    },
    setSelectedCell(state, action: PayloadAction<Cell|null>) {
      state.selectedCell = action.payload;
    },
    setBoardOffset(state, action: PayloadAction<Coordinate>) {
      state.offset = action.payload;
    },
    setBoardZoom(state, action: PayloadAction<number>) {
      state.zoom = action.payload;
    },
    setSelectedElement(state, action: PayloadAction<Element|null>) {
      state.selectedElement = action.payload;
    }
  },
});

export const getCells = (state: RootState): Cell[] => state.board.cells;
export const getSelectedCell = (state: RootState): Cell|null => state.board.selectedCell;
export const getSelectedElement = (state: RootState): Element|null => state.board.selectedElement;
export const getBoardZoom = (state: RootState): number => state.board.zoom;
export const getBoardOffset = (state: RootState): Coordinate => state.board.offset;

export const { 
  setCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom
} = boardSlice.actions;

export default boardSlice.reducer;
