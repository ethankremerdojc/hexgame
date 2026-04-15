import {
  ElementType, ElementSubType, CellType, TeamColor,
  CELL_INFO_BY_TYPE, 
  PERSON_BASE_HEALTH,
  STARTING_FOOD, STARTING_GOLD
} from "./boardSlice.ts";

import {
  randomItem, getEnumValueByIndex
} from "./utils.js";

import type { 
  Cell
} from "./boardSlice.ts";

export class BoardGenerator {

  generateBoard(
    hexRadius: number,
    canvasWidth: number,
    canvasHeight: number,
    playerCount: number=2,
    cellCount: number=-1,
    maxCellAdditionAttemptNum: number=10, // The number of times to try to add before giving up
  )
  {
    const { boardWidth, boardHeight } = this.getBoardWidthAndHeight(canvasWidth, canvasHeight, hexRadius);

    const startCell = {
      x: Math.floor(boardWidth / 2),
      y: Math.floor(boardHeight / 2),
      type: CellType.Field,
      elements: []
    };

    let cells = [startCell];

    if (cellCount === -1) {
      let maxCellCount = boardWidth * boardHeight;
      cellCount = Math.floor(maxCellCount * 0.5);
    };

    for (let i=0; i < cellCount - 1; i++) {
      for (let j=0; j < maxCellAdditionAttemptNum; j++) {
        let newCell = this.generateRandomNeighborCell(randomItem(cells), boardWidth, boardHeight);

        if (!this.cellAlreadyOnBoard(cells, newCell)) {
          cells.push(newCell);
          break
        }
      }
    }

    let result: Cell[] = this.addStarterElements(cells, playerCount);
    return result
  }

  getBoardWidthAndHeight(canvasWidth: number, canvasHeight: number, radius: number) {
    const hexWidth = radius * 2;
    const colStep = radius * 1.5;
    const rowStep = Math.sqrt(3) * radius;
    const rowOffset = rowStep / 2;

    const cols = Math.floor((canvasWidth - hexWidth) / colStep);
    const rows = Math.floor((canvasHeight - hexWidth - rowOffset) / rowStep) + 1;

    return {
      boardWidth: Math.max(0, cols),
      boardHeight: Math.max(0, rows),
    };
  }

  generateRandomNeighborCell(cell: Cell, boardWidth: number, boardHeight: number): any {
    let changingIndex = randomItem([0, 1]);
    let changeAmount = randomItem([-1, 1]);

    var newVal;
    if (changingIndex == 0) {
      newVal = cell.x + changeAmount;
    } else {
      newVal = cell.y + changeAmount;
    }

    if (newVal == 0) {
      newVal = cell.x + 1;
    }

    if (changingIndex == 0 && newVal == boardWidth + 1) {
      newVal = cell.x - 1;
    } else if (changingIndex == 1 && newVal == boardHeight + 1) {
      newVal = cell.y - 1;
    }

    let newCell: any;

    if (changingIndex == 0) {
      newCell = {
        x: newVal,
        y: cell.y
      }
    } else {
      newCell = {
        x: cell.x,
        y: newVal
      };
    }

    newCell.type = this.generateNewCellType(cell.type);
    newCell.elements = [];

    return newCell
  }

  generateNewCellType(oldType: CellType, mutationRate: number=0.5): any {
    let doMutation = Math.random() < mutationRate;
    if (!doMutation) { return oldType }
    return this.getRandomCellTypeByRates();
  }

  getRandomCellTypeByRates(): any {
    let rateTotal = 0;

    for (var info of Object.values(CELL_INFO_BY_TYPE)) {
      rateTotal += info.weight;
    }

    let randomPosition = Math.random() * rateTotal;

    let tempTotal = 0;
    for (var [type, info] of Object.entries(CELL_INFO_BY_TYPE)) {
      if (randomPosition < tempTotal + info.weight) {
        return type
      }
      tempTotal += info.weight;
    }
  }

  cellAlreadyOnBoard(board: Cell[], newCell: Cell): boolean {
    for (var cell of board) {
      if (cell.x == newCell.x && cell.y == newCell.y) {
        return true
      }
    }
    return false
  }

  addStarterElements(board: Cell[], playerCount: number): Cell[] {
    let newBoard = [...board];

    for (let i=0; i<playerCount; i++) {
      newBoard = this.addRandomCapitalToBoard(newBoard, getEnumValueByIndex(TeamColor, i));
    }

    return newBoard;
  }

  addRandomCapitalToBoard(board: Cell[], color: TeamColor): Cell[] {
    let newBoard = structuredClone(board);

    let emptyNonDesertCells = newBoard.filter(cell => cell.elements.length == 0).filter(cell => cell.type != CellType.Desert);

    if (emptyNonDesertCells.length == 0) {
      throw new Error("No empty cells to add capital to.");
    }

    let randomCell = randomItem(emptyNonDesertCells);

    randomCell.elements.push({type: ElementType.Building, subType: ElementSubType.Capital, team: color});

    randomCell.elements.push({type: ElementType.Person, subType: ElementSubType.Worker, team: color, heldElements:[], health: 10});
    randomCell.elements.push({type: ElementType.Person, subType: ElementSubType.Worker, team: color, heldElements:[], health: 10});

    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Gold, count: STARTING_GOLD});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Food, count: STARTING_FOOD});
    return newBoard;
  }
}
