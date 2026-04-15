import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { createSlice } from "@reduxjs/toolkit"

import { BoardUtils } from "./boardUtils"

export enum TeamColor {
  White,
  Purple,
  Red,
  Yellow,
  Blue,
  Green
}

export function nameForTeamColor(color: TeamColor): string {
  return [
    "White",
    "Purple",
    "Red",
    "Yellow",
    "Blue",
    "Green"
  ][color]
}

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
  SawMill,
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
  Desert,
  Forest,
  Mountain
}

export function buildingTypeForCellType(cellType: CellType): ElementSubType|null {
  if (cellType == CellType.Field) {
    return ElementSubType.Farm
  }
  if (cellType == CellType.Forest) {
    return ElementSubType.SawMill
  }
  if (cellType == CellType.Mountain) {
    return ElementSubType.Quarry
  }

  return null
}

export function itemTypeForCellType(cellType: CellType): ElementSubType|null {
  if (cellType == CellType.Field) {
    return ElementSubType.Food
  }
  if (cellType == CellType.Forest) {
    return ElementSubType.Wood
  }
  if (cellType == CellType.Mountain) {
    return ElementSubType.Ore
  }

  return null
}

export function getBuildingCost(elemSubType: ElementType) {
  let ingredients = [];

  switch (elemSubType) {
    case ElementSubType.Farm:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 5
      })
      break;
    case ElementSubType.Quarry:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 3
      })
      break;
    case ElementSubType.SawMill:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 2
      })
    default:
      break;
  }

  return ingredients
}

export function buildingCostToString(buildingCost: object[]): string {
  let result = "(";

  for (var ingredient of buildingCost) {
    result += `${nameForElementSubType(ingredient.subType)}: ${ingredient.count}, `;
  }

  return result.slice(0, -2) + ")"; // remove last two chars: ', '
}

export function nameForElementSubType(elemSubType: ElementType): string {
  return [
    "Capital",
    "Village",
    "Farm",
    "SawMill",
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

  // Person only
  heldElements: Element[],
  health: number|null,
  armor: number|null,
  weight: number|null,
  hasActionAvailable: boolean|null,
  isWorking: boolean|null,
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


export enum ElementAction {
  Move,
  Take,
  Drop,
  Fight,
  Build,
  Destroy,
  Work
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
  },
  { // Work
    title: "work",
    depletesAction: true,
    helpText: "Work on the current tile for more resources."
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
  1: { // Desert
    color: "rgb(32 35 196)",
    weight: 0.15
  },
  2: { // Forest
    color: "rgb(91 41 10)",
    weight: 0.4
  },
  3: { // Mountain
    color: "rgb(75 69 66)",
    weight: 0.25
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
        let he = {...newElem.heldElements[h]};
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

export function mergeItemElements(itemElements: Element[]): Element[] {
  let result = [];

  itemElements.forEach(ie => {
    let matchingElems = result.filter(re => re.subType == ie.subType);
    if (matchingElems[0]) {
      matchingElems[0].count += ie.count;
    } else{
      result.push({...ie});
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
      console.log(foodElementsHeld);

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
          cell.elements = cell.elements.filter(el => el.id != person.id);
        }
      }
    }
  }

  return newCells;
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
  playerTurn: TeamColor.White
};

export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 5;
export const PERSON_MAX_CARRY_WEIGHT = 5;
export const PERSON_BASE_DAMAGE = 4;
export const PERSON_BASE_HEALTH = 9;
export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

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

      state.cells = setupNewTurn(state.cells, state.playerTurn);
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

export const { 
  setCells,
  setSelectedCell,
  setSelectedElement,
  setBoardOffset,
  setBoardZoom,
  setShowMoveInfo,
  setPlayerCount,

  endTurn
} = boardSlice.actions;

export default boardSlice.reducer;
