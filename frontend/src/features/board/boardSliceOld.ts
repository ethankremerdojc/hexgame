import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"
import {
  postUpdateToBackend 
} from "@/app/api"

import {
  TeamColor,
  ElementType,
  ElementSubType,
  CellType,
  // objectToElement
} from "./boardTypes"

import type {
  Element,
  Cell,
  Coordinate
} from "./boardTypes"

import {
  WORKER_ITEM_GENERATION_AMOUNT,
  BUILDING_ITEM_GENERATION_AMOUNT,
  NO_FOOD_PENALTY,
  itemTypeForCellType,
  COW_PRODUCING_TILES
} from "./vars"

import BoardUtils from "./boardUtils"

import { randomItem } from "./utils"

import { NAMES_LIST } from "./randomNames.ts";

export function getRandomName(): string {
  return randomItem(NAMES_LIST)
}

export function getElementId(): string {
  return genRanHex(10);
}

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export function updateElemAttributes(elem: Element): Element {
  let newElem = {...elem};

  // items need new ids each type we update, buildings and persons dont
  if (elem.type == ElementType.Item || !elem.id) {
    newElem.id = getElementId();
  }

  if (newElem.type == ElementType.Person) {
    if (!newElem.name) {
      newElem.name = getRandomName();
    }

    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {

      let newHeldElements = [];

      for (let h = 0; h < newElem.heldElements.length; h++) {
        let he = {...newElem.heldElements[h]};
        if (!he.count) {
          he.count = 1;
        }

        if (!elem.id) {
          he.id = getElementId();
        }
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
  newElements = newElements.map(el => objectToElement(el));
  newElements = updateCellElementPositions(newElements);

  let result = [];

  for (var elem of newElements) {
    result.push(updateElemAttributes(elem));
  }

  return result;
}

export function prepareCellsForStateSave(cells: Cell[]): Cell[] {
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
      if (person.health === null) {
        throw new Error(`Person had no health attribute.`)
      }

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
        person.health -= NO_FOOD_PENALTY;
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
        if (cell.type == CellType.Desert) {
          person.isScavenging = true;
        } else {
          person.isWorking = true;
        }
      }
    }
  }

  return cells
}

function checkForWinner(cells: Cell[], playerTurn: TeamColor): boolean {
  // verify that there is only 1 capital and it is the one of the current team
  let capitals = [];

  for (var cell of cells) {
    let cellCapitals: Element[] = cell.elements.filter((el: Element) => el.subType == ElementSubType.Capital);
    if (cellCapitals.length < 1) { continue }
    capitals.push(cellCapitals[0]);
  }

  console.log("num capitals: ", capitals.length);

  if (capitals.length > 1) { return false };

  if (capitals[0].team == playerTurn) { return true };

  throw new Error("Somehow the only capital is one of a different player.");
}

function setupNewTurn(newCells: Cell[], playerTurn: TeamColor, roundNumber: number): Cell[] {
  let cellsWithOwnPersons = newCells.filter(
    cell => cell.elements.filter(el => el.type == ElementType.Person && el.team == playerTurn).length > 0);

  for (var cell of cellsWithOwnPersons) {

    let ownPersons = cell.elements.filter(el => el.type == ElementType.Person && el.team == playerTurn);
    let workers = ownPersons.filter(el => el.isWorking);
    let scavengers = ownPersons.filter(el => el.isScavenging);

    for (var p of ownPersons) {
      p.hasActionAvailable = true;
      p.isWorking = false;
      p.isScavenging = false;

      let horses = p.heldElements.filter((el: Element) => el.subType == ElementSubType.Horse);
      for (var horse of horses) {
        horse.hasActionAvailable = true;
      }
    }

    let horses = cell.elements.filter(el => el.subType == ElementSubType.Horse);
    for (var horse of horses) {
      horse.hasActionAvailable = true;
    };

    let cows = cell.elements.filter(el => el.subType == ElementSubType.Cow);
    if (cows.length > 0) {
      if (workers.length > 0 && COW_PRODUCING_TILES.includes(Number(cell.type))) {
        let leatherCount = Math.min(cows[0].count, 3);
        let leatherEl = {type: ElementType.Item, subType: ElementSubType.Leather, count: leatherCount};
        cell.elements.push(objectToElement(leatherEl));
      }
    }

    for (var scavenger of scavengers) {
      let scavengedItem = BoardUtils.getScavengedItem(scavenger, roundNumber);
      cell.elements.push(scavengedItem);
    }

    if (workers.length < 1) { continue }

    let buildingExists = cell.elements.filter(el => el.type == ElementType.Building && el.subType != ElementSubType.Capital && el.subType != ElementSubType.Village).length > 0;

    let itemCreationCount;
    if (buildingExists) {
      itemCreationCount = BUILDING_ITEM_GENERATION_AMOUNT * workers.length;
    } else {
      itemCreationCount = WORKER_ITEM_GENERATION_AMOUNT * workers.length;
    };

    cell.elements.push(objectToElement({type: ElementType.Item, subType: itemTypeForCellType(cell.type), count: itemCreationCount}));
  }

  newCells = prepareCellsForStateSave(newCells);
  return newCells
}

export interface BoardState {
  playerCount: number,

  cells: Cell[],
  selectedCell: Cell|null,
  selectedElement: Element|null,
  offset: Coordinate,
  zoom: number,
  showMoveInfo: boolean,
  playerTurn: TeamColor,

  actionHandling: string,
  actionItemsToSelectFrom: any[],

  backupCells: Cell[],
  viewOnly: boolean,
  gameId: number,
  usernames: string[],
  loggedInUsername: string,

  userSubscribed: boolean,
  turnNumber: number,
  gameOver: boolean
}

const initialState: BoardState = {
  playerCount: 0,

  cells: [],
  selectedCell: null,
  selectedElement: null,
  offset: {x: 0, y: 0},
  zoom: 1.0,
  showMoveInfo: false,

  playerTurn: TeamColor.White,
  actionHandling: "",
  actionItemsToSelectFrom: [],

  backupCells: [],
  viewOnly: false,
  gameId: -1,
  usernames: [],
  loggedInUsername: "",
  userSubscribed: false,
  turnNumber: 0,
  gameOver: false
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
    setActionHandling(state, action: PayloadAction<string>) {
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

      const winnerExists = checkForWinner(cells, currentPlayerTurn);
      if (winnerExists) {
        console.log("winner exists")
        state.cells = cells;
        state.gameOver = true;
        postUpdateToBackend(
          state.cells,
          state.playerTurn,
          state.gameId,
          false,
          state.loggedInUsername
        );
      } else {
        state.cells = setupNewTurn(cells, state.playerTurn, state.turnNumber);
        state.backupCells = state.cells;

        if (state.playerTurn == 0) {
          state.turnNumber += 1;
        }

        postUpdateToBackend(state.cells, state.playerTurn, state.gameId);
      }
    },
    setViewOnly(state, action: PayloadAction<boolean>) {
      state.viewOnly = action.payload;
    },
    setGameId(state, action: PayloadAction<number>) {
      state.gameId = action.payload;
    },
    setTurnNumber(state, action: PayloadAction<number>) {
      state.turnNumber = action.payload;
    },
    setUsernames(state, action: PayloadAction<string[]>) {
      state.usernames = action.payload;
    },
    setLoggedInUsername(state, action: PayloadAction<string>) {
      state.loggedInUsername = action.payload;
    },
    setUserSubscribed(state, action: PayloadAction<boolean>) {
      state.userSubscribed = action.payload;
    },

    setGameOver(state, action: PayloadAction<boolean>) {
      state.gameOver = action.payload;
    },
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
export const getActionHandling = (state: RootState): string => state.board.actionHandling;
export const getActionItemsToSelectFrom = (state: RootState): any[] => state.board.actionItemsToSelectFrom;
export const getViewOnly = (state: RootState): boolean => state.board.viewOnly;
export const getGameId = (state: RootState): number => state.board.gameId;
export const getUsernames = (state: RootState): string[] => state.board.usernames;
export const getCurrentPlayerName = (state: RootState): string => state.board.usernames[state.board.playerTurn];
export const getLoggedInUsername = (state: RootState): string => state.board.loggedInUsername;
export const getUserSubscribed = (state: RootState): boolean => state.board.userSubscribed;
export const getTurnNumber = (state: RootState): number => state.board.turnNumber;
export const getGameOver = (state: RootState): boolean => state.board.gameOver;

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
  endTurn,
  setViewOnly,
  setGameId,
  setPlayerTurn,
  setUsernames,
  setLoggedInUsername,
  setUserSubscribed,
  setTurnNumber,
  setGameOver
} = boardSlice.actions;

export default boardSlice.reducer;
