import {
  HexPosition, ElementType, CellType, TeamColor,
  CELL_INFO_BY_TYPE
} from "./boardSlice.ts";

import {
  randomItem, getRandomEnumValue
} from "./utils.js";

import type { 
  Cell, Coordinate, Element
} from "./boardSlice.ts";

export class BoardGenerator {

  generateBoard(
    hexRadius: number,
    canvasWidth: number,
    canvasHeight: number,
    playerCount: number|null=2,
    cellCount: number=-1,
    maxCellAdditionAttemptNum: number=10, // The number of times to try to add before giving up
  )
  {
    const { boardWidth, boardHeight } = this.getBoardWidthAndHeight(canvasWidth, canvasHeight, hexRadius);

    const startCell = {
      x: Math.floor(boardWidth / 2),
      y: Math.floor(boardHeight / 2),
      type: CellType.Field,
      contents: []
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

    let result = this.addStarterElements(cells, playerCount);
    return result
  }

  getBoardWidthAndHeight(canvasWidth, canvasHeight, radius) {
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

  generateRandomNeighborCell(cell: Cell, boardWidth: number, boardHeight: number): Cell {
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

    let newCell;
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
    newCell.contents = [];

    return newCell
  }

  generateNewCellType(oldType: CellType, mutationRate: number=0.4): CellType {
    let doMutation = Math.random() < mutationRate;
    if (!doMutation) { return oldType }
    return this.getRandomCellTypeByRates();
  }

  getRandomCellTypeByRates(): Cell {
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
      newBoard = this.addRandomCapitalToBoard(newBoard, getRandomEnumValue(TeamColor));
    }

    return newBoard;
  }

  addRandomCapitalToBoard(board: Cell[], color: TeamColor): Cell[] {
    let newBoard = structuredClone(board);

    let emptyCells = newBoard.filter(cell => cell.contents.length == 0);

    if (emptyCells.length == 0) {
      throw new Error("No empty cells to add capital to.");
    }

    let randomCell = randomItem(emptyCells);

    randomCell.contents.push({type: ElementType.Building, subType: "capital", team: color});
    randomCell.contents.push({type: ElementType.Person, subType: "worker", team: color});
    return newBoard;
  }
}
