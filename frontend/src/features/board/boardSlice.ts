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

export function nameForElementSubType(elemSubType: ElementType): string {
  return [
    "Capital",
    "Village",
    "Farm",
    "Quarry",
    "Worker",
    "Soldier",
    "Archer",
    "Food",
    "Wood",
    "Ore",
    "Gold"
  ][elemSubType]
}

export type Element = {
  type: ElementType,
  subType: ElementSubType,
  team: TeamColor|null,
  position: HexPosition|null,
  id: string,
  count: number|null,
  heldElements: Element[],
  weight: number|null,
  hasActionAvailable: boolean|null
}

export const PERSON_MAX_CARRY_WEIGHT = 3;

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


export enum ElementAction {
  Move,
  Take,
  Drop,
  Fight,
  Build,
  Destroy
}

interface ActionDetails {
  title: string,
  depletesAction: boolean,
  helpText: string,
}

const ELEMENT_ACTION_DETAILS: ActionDetails[] = [
  { // Move
    title: "move",
    depletesAction: true,
    helpText: "Move to an adjacent tile.",
  },
  { // Take
    title: "take",
    depletesAction: false,
    helpText: "Pickup an item at the current cell position.",
  },
  { // Drop
    title: "drop",
    depletesAction: false,
    helpText: "Drop an item at the current cell position.",
  },
  { // Fight
    title: "fight",
    depletesAction: true,
    helpText: "Do damage to another team's person."
  },
  { // Build
    title: "build",
    depletesAction: true,
    helpText: "Build a structure with the resources at the current tile."
  },
  { // Destroy
    title: "destroy",
    depletesAction: true,
    helpText: "Destroy a structure at the current tile."
  }
]

export function getActionDetails(actionType: number): ActionDetails {
  return ELEMENT_ACTION_DETAILS[actionType]
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
  const [coords, heldElementIndex, position, type, subType, count] = id.split('|');
  const [x, y] = coords.split(',').map(Number);

  return { x, y, heldElementIndex, position, type, subType, count };
}

function updateElemAttributes(elem: Element, cell: Cell): Element {
  let newElem = {...elem};
  newElem.id = `${cell.x},${cell.y}|null|${newElem.position}|${newElem.type}|${newElem.subType}|${newElem.count}`; 

  if (newElem.type == ElementType.Person) {
    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {
      let newHeldElements = [];
      for (let h = 0; h < newElem.heldElements.length; h++) {
        let he = structuredClone(newElem.heldElements[h]);
        if (!he.count) {
          he.count = 1;
        }

        he.id = `${cell.x},${cell.y}|${h}|${newElem.position}|${newElem.type}|${newElem.subType}|${newElem.count}`;
        newHeldElements.push(he);
      }
      newElem.heldElements = mergeItemElements(newHeldElements);
    }
    if (!newElem.count) {
      newElem.count = 1;
    }

    if (newElem.hasActionAvailable === null || newElem.hasActionAvailable === undefined) {
      newElem.hasActionAvailable = true;
    }
  }

  return newElem;
}

function mergeItemElements(itemElements: Element[]): Element[] {
  let result = [];

  itemElements.forEach(ie => {
    let matchingElems = result.filter(re => re.subType == ie.subType);
    if (matchingElems[0]) {
      matchingElems[0].count += ie.count;
    } else{
      result.push(structuredClone(ie));
    }
  })

  return result
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
    newElements.push(newElem);
  }

  return [...newElements, ...mergeItemElements(itemElements)];
}

function updateCellElements(cell: Cell): Element[] {

  let newElements = [...cell.elements];
  newElements = updateCellElementPositions(newElements);

  let result = [];

  for (var elem of newElements) {
    result.push(updateElemAttributes(elem, cell));
  }

  return result;
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
  zoom: number,
  showMoveInfo: boolean
}

const initialState: BoardState = {
  cells: [],
  selectedCell: null,
  selectedElement: null,
  offset: {x: 0, y: 0},
  zoom: 1.0,
  showMoveInfo: false
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setCells(state, action: PayloadAction<Cell[]>) {
      let cells = action.payload;
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
    },
    setShowMoveInfo(state, action: PayloadAction<boolean>) {
      state.showMoveInfo = action.payload;
    }
  },
});

export const getCells = (state: RootState): Cell[] => state.board.cells;
export const getSelectedCell = (state: RootState): Cell|null => state.board.selectedCell;
export const getSelectedElement = (state: RootState): Element|null => state.board.selectedElement;
export const getBoardZoom = (state: RootState): number => state.board.zoom;
export const getBoardOffset = (state: RootState): Coordinate => state.board.offset;
export const getShowMoveInfo = (state: RootState): boolean => state.board.showMoveInfo;

export const { 
  setCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom,
  setShowMoveInfo
} = boardSlice.actions;

export default boardSlice.reducer;
