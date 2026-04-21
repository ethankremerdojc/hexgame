import {
  CELL_INFO_BY_TYPE, 
  PERSON_BASE_HEALTH,
  STARTING_FOOD
} from "./vars"

import {
  randomItem, getEnumValueByIndex
} from "./utils.js";

import type {
  Cell
} from "./boardTypes"

import {
  CellType, ElementType, ElementSubType, TeamColor
} from "./boardTypes"

export class BoardGenerator {

  generateBoard(
    hexRadius: number,
    canvasWidth: number,
    canvasHeight: number,
    playerCount: number=2,
    cellCount: number=-1,
    traderCount: number=2,
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

    let result: Cell[] = this.addStarterElements(cells, playerCount, traderCount);
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

  addStarterElements(board: Cell[], playerCount: number, traderCount: number): Cell[] {
    let newBoard = [...board];

    for (let i=0; i<playerCount; i++) {
      newBoard = this.addRandomCapitalToBoard(newBoard, getEnumValueByIndex(TeamColor, i));
    }

    for (let i=0; i<traderCount; i++) {
      newBoard = this.addRandomTraderToBoard(newBoard);
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
    let twoFood = {type: ElementType.Item, subType: ElementSubType.Food, count: 2};

    randomCell.elements.push({type: ElementType.Building, subType: ElementSubType.Capital, team: color});

    randomCell.elements.push({type: ElementType.Person, subType: ElementSubType.Villager, team: color, heldElements:[{...twoFood}], health: PERSON_BASE_HEALTH});
    randomCell.elements.push({type: ElementType.Person, subType: ElementSubType.Villager, team: color, heldElements:[{...twoFood}], health: PERSON_BASE_HEALTH});

    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Food, count: STARTING_FOOD});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Wood, count: 4});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Clay, count: 4});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Ore, count: 4});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Horse, count: 1});
    randomCell.elements.push({type: ElementType.Item, subType: ElementSubType.Horse, count: 1});
    return newBoard;
  }

  addRandomTraderToBoard(board: Cell[]): Cell[] {
    let newBoard = structuredClone(board);
    let emptyCells = newBoard.filter(cell => cell.elements.length == 0);
    let emptyDesertCells = emptyCells.filter(cell => cell.type == CellType.Desert);

    let desertCell;

    if (emptyDesertCells.length == 0) {
      desertCell = randomItem(emptyCells);
      desertCell.type = CellType.Desert;
    } else {
      desertCell = randomItem(emptyDesertCells);
    }

    let trader = {type: ElementType.Person, subType: ElementSubType.Trader};
    desertCell.elements.push(trader);
    return newBoard
  }
}
