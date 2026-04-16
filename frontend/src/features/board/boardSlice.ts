import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

import {
  TeamColor,
  HexPosition,
  ElementType,
  ElementSubType,
  CellType,
  ElementAction
} from "./boardTypes"

import type {
  Element,
  Cell,
  Coordinate
} from "./boardTypes"

import {
  WORKER_ITEM_GENERATION_AMOUNT,
  BUILDING_ITEM_GENERATION_AMOUNT,
  PERSON_BASE_HEALTH,
  itemTypeForCellType
} from "./vars"

import { BoardUtils } from "./boardUtils"

function updateElemAttributes(elem: Element, cell: Cell): Element {
  let newElem = {...elem};
  newElem.id = `${cell.x},${cell.y}|null|${newElem.position}|${newElem.type}|${newElem.subType}|${newElem.count}`; 
  
  if (newElem.count === undefined) {
    newElem.count = 1;
  }

  if (newElem.type == ElementType.Person) {
    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {
      let newHeldElements = [];
      for (let h = 0; h < newElem.heldElements.length; h++) {
        let he = {...newElem.heldElements[h]};
        if (!he.count) {
          he.count = 1;
        }

        he.id = `${cell.x},${cell.y}|${h}|${newElem.position}|${newElem.type}|${newElem.subType}|${newElem.count}`;
        newHeldElements.push(he);
      }
      newElem.heldElements = BoardUtils.mergeItemElements(newHeldElements);
    }

    if (newElem.hasActionAvailable === null || newElem.hasActionAvailable === undefined) {
      newElem.hasActionAvailable = true;
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
    newElements.push(newElem);
  }

  return [...newElements, ...BoardUtils.mergeItemElements(itemElements)];
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

function depleteFoodForPersonsOnTeam(playerTeam: TeamColor, newCells: Cell[]): Cell[] {
  let cellsWithPlayersOnTeam = newCells.filter(
    cell => cell.elements.filter(
      elem => elem.type == ElementType.Person && elem.team == playerTeam
    ).length > 0);

  for (var cell of cellsWithPlayersOnTeam) {
    let persons = cell.elements.filter(elem => elem.type == ElementType.Person && elem.team == playerTeam);

    for (var person of persons) {

      let foodElementsOnTile = cell.elements.filter(el => el.subType == ElementSubType.Food);

      if (foodElementsOnTile.length > 0) {
        let foodElem = foodElementsOnTile[0];
        if (foodElem.count == 1) {
          cell.elements = cell.elements.filter(el => el.id != foodElem.id);
        } else {
          foodElem.count -= 1;
        }

        continue
      }

      let foodElementsHeld = person.heldElements.filter(el => el.subType == ElementSubType.Food);

      if (foodElementsHeld.length > 0) {
        let foodElem = foodElementsHeld[0];
        if (foodElem.count == 1) {
          person.heldElements = person.heldElements.filter(el => el.id != foodElem.id);
        } else {
          foodElem.count -= 1;
        }
      } else {
        person.health -= 2;
        if (person.health < 1) {
          cell.elements = [...cell.elements, ...person.heldElements];
          cell.elements = cell.elements.filter(el => el.id != person.id);
        }
      }
    }
  }

  return newCells;
}

function makePersonsWithActionOnTeamWork(playerTeam: TeamColor, cells: Cell[]): Cell[] {
  let cellsWithPlayersOnTeam = cells.filter(
    cell => cell.elements.filter(
      elem => elem.type == ElementType.Person && elem.team == playerTeam
    ).length > 0);

  for (var cell of cellsWithPlayersOnTeam) {
    let persons = cell.elements.filter(elem => elem.type == ElementType.Person && elem.team == playerTeam);
    for (var person of persons) {
      if (person.hasActionAvailable) {
        person.isWorking = true;
      }
    }
  }

  return cells
}

export interface BoardState {
  playerCount: number,
  turnNumber: number,

  cells: Cell[],
  selectedCell: Cell|null,
  selectedElement: Element|null,
  offset: Coordinate,
  zoom: number,
  showMoveInfo: boolean,
  playerTurn: TeamColor,
}

const initialState: BoardState = {
  playerCount: 3,
  turnNumber: 1,

  cells: [],
  selectedCell: null,
  selectedElement: null,
  offset: {x: 0, y: 0},
  zoom: 1.0,
  showMoveInfo: false,

  playerTurn: TeamColor.White,
  actionHandling: null,
  actionItemsToSelectFrom: [],

  backupCells: null
};

function setupNewTurn(newCells: Cell[], playerTurn: TeamColor): Cell[] {
  let cellsWithOwnPersons = newCells.filter(
    cell => cell.elements.filter(el => el.type == ElementType.Person && el.team == playerTurn).length > 0);

  for (var cell of cellsWithOwnPersons) {

    let ownPersons = cell.elements.filter(el => el.type == ElementType.Person && el.team == playerTurn);
    let workers = ownPersons.filter(el => el.isWorking);

    for (var p of ownPersons) {
      p.hasActionAvailable = true;
      p.isWorking = false;
    }

    if (workers.length < 1) { continue }

    let buildingExists = cell.elements.filter(el => el.type == ElementType.Building && el.subType != ElementSubType.Capital).length > 0;

    let itemCreationCount;
    if (buildingExists) {
      itemCreationCount = BUILDING_ITEM_GENERATION_AMOUNT * workers.length;
    } else {
      itemCreationCount = WORKER_ITEM_GENERATION_AMOUNT * workers.length;
    };

    cell.elements.push({type: ElementType.Item, subType: itemTypeForCellType(cell.type), count: itemCreationCount});
  }

  newCells = prepareCellsForStateSave(newCells);
  return newCells
}

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setCells(state, action: PayloadAction<Cell[]>) {
      let cells = action.payload;
      let newCells = prepareCellsForStateSave(cells);
      state.cells = newCells;
    },


    setBackupCells(state, action: PayloadAction<Cell[]>) {
      state.backupCells = action.payload;
    },
    revertToBeginningOfTurn(state) {
      state.cells = prepareCellsForStateSave(state.backupCells);
      state.selectedCell = null;
      state.showMoveInfo = false;
      state.selectedElement = null;
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
    },
    setPlayerTurn(state, action: PayloadAction<TeamColor>) {
      state.playerTurn = action.payload;
    },
    setPlayerCount(state, action: PayloadAction<number>) {
      state.playerCount = action.payload;
    },
    setActionHandling(state, action: PayloadAction<string|null>) {
      state.actionHandling = action.payload;
    },
    setActionItemsToSelectFrom(state, action: PayloadAction<any[]>) {
      state.actionItemsToSelectFrom = action.payload;
    },
    endTurn(state) {
      let currentPlayerTurn = state.playerTurn;
      if (currentPlayerTurn == state.playerCount - 1) {
        state.playerTurn = 0;
      } else {
        state.playerTurn += 1;
      }

      state.selectedCell = null;
      state.selectedElement = null;
      state.showMoveInfo = false;

      let cells = depleteFoodForPersonsOnTeam(currentPlayerTurn, state.cells);
      cells = makePersonsWithActionOnTeamWork(currentPlayerTurn, state.cells);

      state.cells = setupNewTurn(state.cells, state.playerTurn);
      state.backupCells = state.cells;
    }
  },
});

export const getCells = (state: RootState): Cell[] => state.board.cells;
export const getSelectedCell = (state: RootState): Cell|null => state.board.selectedCell;
export const getSelectedElement = (state: RootState): Element|null => state.board.selectedElement;
export const getBoardZoom = (state: RootState): number => state.board.zoom;
export const getBoardOffset = (state: RootState): Coordinate => state.board.offset;
export const getShowMoveInfo = (state: RootState): boolean => state.board.showMoveInfo;
export const getPlayerTurn = (state: RootState): TeamColor => state.board.playerTurn;
export const getPlayerCount = (state: RootState): number => state.board.playerCount;
export const getActionHandling = (state: RootState): number => state.board.actionHandling;
export const getActionItemsToSelectFrom = (state: RootState): number => state.board.actionItemsToSelectFrom;

export const { 
  setCells,
  setBackupCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom,
  setShowMoveInfo,
  setPlayerCount,
  setActionHandling,
  setActionItemsToSelectFrom,
  revertToBeginningOfTurn,
  endTurn
} = boardSlice.actions;

export default boardSlice.reducer;
