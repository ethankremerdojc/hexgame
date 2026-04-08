import {
  HexPosition, getElementParentCell
} from "./boardSlice.ts";

import type { 
  Cell, Coordinate, Element
} from "./boardSlice.ts";

import { randomItem, drawSvgToCanvas } from "./utils.js";
import personSvg from "./elements/person.svg?raw";
import forkSvg from "./elements/pitchfork.svg?raw";

const TAU = 2 * Math.PI;

const TEAM_COLORS = [
  "white", "purple", "red", "yellow"
]

export const CELL_MUTATION_RATE: number = 0.4;

interface CellType {
  type: string,
  color: string,
  weight: number
}

export const CELL_TYPES: CellType[] = [
  {
    type: "field",
    color: "rgb(16 108 14)",
    weight: 1
  },
  {
    type: "water",
    color: "rgb(32 35 196)",
    weight: 0.4
  },
  {
    type: "forest",
    color: "rgb(91 41 10)",
    weight: 0.5
  },
  {
    type: "mountain",
    color: "rgb(75 69 66)",
    weight: 0.3
  },
];

function getColorForType(t) {
  for (var ct of CELL_TYPES) {
    if (ct.type == t) {
      return ct.color
    }
  }
}


function pointInTriangle(P: Coordinate, A: Coordinate, B: Coordinate, C: Coordinate): boolean {
  function sign(p, a, b) {
    return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
  }

  const d1 = sign(P, A, B);
  const d2 = sign(P, B, C);
  const d3 = sign(P, C, A);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

export function pointInRectangle(point: Coordinate, topLeft: Coordinate, bottomRight: Coordinate): boolean {
  let top = topLeft.y;
  let bottom = bottomRight.y;
  let left = topLeft.x;
  let right = bottomRight.x;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
}

export class BoardGenerator {
  constructor(options: object={}, canvasWidth: number, canvasHeight: number) {
    const defaultGridOptions = {
      sides: 6,
      inset: 2,
      // Context
      lineWidth: 2,
      strokeStyle: 'gray',

      offsetX: 0,
      offsetY: 0
    };

    this.options = { ...defaultGridOptions, ...options };

    this.options.diameter = this.options.radius * 2;
  }

  // PUBLIC FUNC
  drawHexes(ctx: CanvasRenderingContext2D, cells: Cell[]): void {
    const opts = {...this.options};

    const hexPoints = this.createPoly(opts);

    let adjacentCells = [];

    if (this.options.selectedElement && this.options.selectedElement.type == "person") {
      let parentCell = getElementParentCell(this.options.selectedElement, cells);
      adjacentCells = BoardGenerator.getAdjacentCells(cells, parentCell);
    }

    for (var cell of cells) {
      let cellHighlighted = false;

      for (var a of adjacentCells) {
        if (cell.x == a.x && cell.y == a.y) {
          cellHighlighted = true;
        }
      }

      this.drawHex(ctx, this.gridToPixelOrigin(cell.x, cell.y, opts), hexPoints, opts, cell, cellHighlighted);
    }
  }

  createPoly(opts, points = []) {
    const
      { inset, radius, sides } = opts,
      size = radius - inset,
      step = TAU / sides;

    for (let i = 0; i < sides; i++) {
      points.push(this.toPolarCoordinate(0, 0, size, step * i));
    }
    return points;
  }

  drawBoundingBoxTriangles(ctx, cell, opts) {
    let cellOrigin = this.gridToPixelOrigin(cell.x, cell.y, opts);

    let boundingBoxTriangles = this.getBoundingBoxCornerTriangles(cellOrigin);

    for (var triangle of boundingBoxTriangles) {
      ctx.beginPath();
      ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
      ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
      ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
      ctx.closePath();
      ctx.strokeStyle = "orange"; 
      ctx.stroke();
    }
  }

  drawTileCoords(ctx, cell, origin) {
    ctx.fillStyle = "black";
    ctx.font = "20px serif";
    ctx.fillText(`(${cell.x}, ${cell.y})`, origin.x - originOffset, origin.y);
  }

  static getElemSizes(radius) {
    let halfRadius = radius/2;
    let buildingSize = 0.5 * radius;
    let objectSize = buildingSize * 0.5;
    let toolSize = objectSize / 3;

    return {
      halfRadius: halfRadius,
      buildingSize, buildingSize,
      objectSize: objectSize,
      toolSize: toolSize
    }
  }

  static getSizeForElement(elem: Element, radius: number): number {
    let { halfRadius, buildingSize, objectSize, toolSize } = BoardGenerator.getElemSizes(radius);
    if (elem.type == "building") {
      return buildingSize;
    }
    if (elem.type == "person") {
      return objectSize
    }
  }

  static getElementPosition(element, origin, opts) {
    let { halfRadius, buildingSize, objectSize, toolSize } = BoardGenerator.getElemSizes(opts.radius);

    let elemPos;
    switch (element.position) {
      case HexPosition.Top:
        elemPos = {x: origin.x - (objectSize/2), y: origin.y - opts.radius*0.75};
        break;
      case HexPosition.TopLeft:
        elemPos = {x: origin.x - (objectSize/2) - (opts.radius/2), y: origin.y - opts.radius*0.45};
        break;
      case HexPosition.TopRight:
        elemPos = {x: origin.x - (objectSize/2) + (opts.radius/2), y: origin.y - opts.radius*0.45};
        break;

      case HexPosition.Bottom:
        elemPos = {x: origin.x - (objectSize/2), y: origin.y + opts.radius*0.5};
        break;
      case HexPosition.BottomLeft:
        elemPos = {x: origin.x - (objectSize/2) - (opts.radius/2), y: origin.y + opts.radius*0.2};
        break;
      case HexPosition.BottomRight:
        elemPos = {x: origin.x - (objectSize/2) + (opts.radius/2), y: origin.y + opts.radius*0.2};
        break;

      case HexPosition.Center:
        elemPos = {x: origin.x - (buildingSize/2), y: origin.y - (buildingSize/2)};
        break;
      default:
        break;
    }

    if (["worker", "soldier", "archer"].includes(element.type)) {
      elemPos.x -= toolSize;
    }

    return elemPos;
  }

  drawElements(ctx, origin, cell, opts) {
    let { halfRadius, buildingSize, objectSize, toolSize } = BoardGenerator.getElemSizes(opts.radius);
    let halfToolSize = toolSize / 2;

    for (var element of cell.contents) {

      let elemPos = BoardGenerator.getElementPosition(element, origin, opts);
      let originOffset = null;

      if (element.subType == "capital") {
        ctx.fillStyle = element.team;
        ctx.fillRect(
          elemPos.x, elemPos.y,
          buildingSize, buildingSize
        );
      }

      if (element.type == "person") {
        drawSvgToCanvas(personSvg, ctx,
          elemPos.x, elemPos.y,
          objectSize, objectSize, 
          element.team
        );
      }

      if (element.subType == "worker") {
        drawSvgToCanvas(forkSvg, ctx,
          elemPos.x + objectSize + halfToolSize, elemPos.y,
          toolSize, objectSize,
        );
      }
    }
  }

  drawHex(ctx, origin, points, opts, cell, cellHighlighted) {
    ctx.strokeStyle = opts.strokeStyle;
    ctx.save();
    ctx.translate(origin.x, origin.y);
    this.polyPath3(ctx, points);
    ctx.restore();

    let cellColor = getColorForType(cell.type);
    ctx.fillStyle = cellColor;
    ctx.fill();

    this.drawElements(ctx, origin, cell, opts);

    let strokeSet = false;

    if (opts.selectedCell) {
      if (cell.x == opts.selectedCell.x && cell.y == opts.selectedCell.y) {
        ctx.strokeStyle = "white";
        ctx.stroke();
        strokeSet = true;
      }
    }
    if (cellHighlighted) {
      ctx.strokeStyle = "yellow";
      ctx.stroke();
      strokeSet = true;
    }

    // this.drawBoundingBoxTriangles(ctx, cell, opts);

    if (!strokeSet) {
      if (opts.strokeStyle) ctx.stroke();
    }

    if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
  }

  polyPath3(ctx, points = []) {
    const [{ x: startX, y: startY }] = points;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    points.forEach(({ x, y }) => { ctx.lineTo(x, y); });
    ctx.closePath();
  }

  gridToPixelOrigin(gridX, gridY, opts) {
    const m = this.gridMeasurements(opts);

    return this.toPoint(
      Math.floor(gridX * m.gridSpaceX) + opts.offsetX,
      Math.floor(gridY * m.gridSpaceY + (gridX % 2 ? m.gridOffsetY : 0) + opts.offsetY)
    );
  }

  pixelToGrid(px: number, py: number): Coordinate {
    const m = this.gridMeasurements(this.options);

    let newX = Math.round((px - this.options.offsetX) / m.gridSpaceX);
    let newY = Math.round((py - this.options.offsetY - (newX % 2 ? m.gridOffsetY : 0)) / m.gridSpaceY); // determine if we should do the mod here or later

    // Get the origin for whatever the system thinks we are on
    let initialOrigin = this.gridToPixelOrigin(newX, newY, this.options);

    let boundingBoxTriangles = this.getBoundingBoxCornerTriangles(initialOrigin);
    let boundingBoxCornerClicked = null;

    for (var triangle of boundingBoxTriangles) {
      if (pointInTriangle({x: px, y: py}, triangle.points[0], triangle.points[1], triangle.points[2])) {
        boundingBoxCornerClicked = triangle.name;
      }
    }

    if (boundingBoxCornerClicked) {
      let oldX = newX;

      if (boundingBoxCornerClicked.includes("left")) {
        newX -= 1;
      } else {
        newX += 1;
      }

      if (boundingBoxCornerClicked.includes("top")) { 
        if (newX % 2) {
          newY -= 1;
        }
      } else { // bottom
        if (oldX % 2) {
          newY += 1;
        }
      }
    }
    return {
      x: newX,
      y: newY
    }
  }

  getBoundingBoxCornerTriangles(origin) {
    const m = this.gridMeasurements(this.options);

    let halfSideLength = m.edgeLength / 2;
    let halfHexHeight = (Math.sqrt(3) / 2) * this.options.radius;
    let quarterHexHeight = halfHexHeight / 2;
    let cornerWidth = (this.options.radius - halfSideLength) / 2;
    let cornerHeight = halfHexHeight / 2;

    // point stuff

    let innerXLeft = origin.x - halfSideLength;
    let outerXLeft = innerXLeft - cornerWidth;
    let innerXRight = origin.x + halfSideLength;
    let outerXRight = innerXRight + cornerWidth;

    let topY = origin.y - halfHexHeight;
    let innerTopY = origin.y - quarterHexHeight;
    let bottomY = origin.y + halfHexHeight;
    let innerBottomY = origin.y + quarterHexHeight;

    const makeTriangle = (x1, y1, x2, y2, x3, y3, name) => {
      return {
        points: [
          { x: Math.floor(x1), y: Math.floor(y1) },
          { x: Math.floor(x2), y: Math.floor(y2) },
          { x: Math.floor(x3), y: Math.floor(y3) }
        ],
        name: name
      }
    };

    return [
      makeTriangle(outerXLeft, bottomY, outerXLeft, innerBottomY, innerXLeft, bottomY, "bottom-left"),
      makeTriangle(outerXRight, bottomY, outerXRight, innerBottomY, innerXRight, bottomY, "bottom-right"),
      makeTriangle(outerXLeft, topY, outerXLeft, innerTopY, innerXLeft, topY, "top-left"),
      makeTriangle(outerXRight, topY, outerXRight, innerTopY, innerXRight, topY, "top-right")
    ]
  }

  gridMeasurements(opts) {
    const { diameter, radius, sides } = opts,
      edgeLength = Math.sin(Math.PI / sides) * diameter,
      gridSpaceX = diameter - edgeLength / 2,
      gridSpaceY = Math.cos(Math.PI / sides) * diameter,
      gridOffsetY = gridSpaceY / 2;

    return {
      diameter,
      edgeLength,
      gridSpaceX,
      gridSpaceY,
      gridOffsetY
    };
  }

  toPoint(x, y) { return ({ x, y }) }

  toPolarCoordinate(centerX, centerY, radius, angle) {
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  // Random Board Generator Funcs

  static getNewCellType(oldType: CellType): CellType {
    let doMutation = Math.random() < CELL_MUTATION_RATE;

    if (!doMutation) {
      return oldType
    }

    return BoardGenerator.getRandomCellTypeByRates();
  }
  
  static getRandomCellTypeByRates(): Cell {
    let rateTotal = 0;

    for (var ct of CELL_TYPES) {
      rateTotal += ct.weight;
    }

    let randomPosition = Math.random() * rateTotal; 

    let tempTotal = 0;
    for (var ct of CELL_TYPES) {
      if (randomPosition < tempTotal + ct.weight) {
        return ct.type
      }
      tempTotal += ct.weight;
    }
  }

  static getHexBoardSize(canvasWidth: number, canvasHeight: number, radius: number): object {
    const hexWidth = radius * 2;
    const colStep = radius * 1.5;
    const rowStep = Math.sqrt(3) * radius;
    const rowOffset = rowStep / 2;

    const cols = Math.floor((canvasWidth - hexWidth) / colStep);
    const rows = Math.floor((canvasHeight - hexWidth - rowOffset) / rowStep) + 1;

    return {
      cols: Math.max(0, cols),
      rows: Math.max(0, rows),
    };
  }


  //TODO 
  //Below 2 may need to have while removed.

  static getAdjacentCells(cells: Cell[], cell: Cell): Cell[] {

    if (!cell) {
      return []
    }

    let potentials = [
      {x: cell.x  , y: cell.y + 1},
      {x: cell.x  , y: cell.y - 1},
      {x: cell.x-1, y: cell.y},
      {x: cell.x+1, y: cell.y},
    ];

    if (cell.x%2) {
      potentials.push({x: cell.x-1, y: cell.y+1});
      potentials.push({x: cell.x+1, y: cell.y+1});
    } else {
      potentials.push({x: cell.x-1, y: cell.y-1});
      potentials.push({x: cell.x+1, y: cell.y-1});
    }

    let adjacentCells = [];

    for (var p of potentials) {
      for (var c of cells) {
        if (p.x == c.x && p.y == c.y) {
          adjacentCells.push(c);
        }
      }
    }

    return adjacentCells
  }

  static addRandomCapitalToBoard(cells: Cell[], color: string): Cell[] {
    let newCells = structuredClone(cells);

    let randomCell;

    while (true) {
      randomCell = randomItem(newCells);
      if (randomCell.contents.length == 0) {
        break;
      }
    }

    randomCell.contents.push({type: "building", subType: "capital", team: color, position: HexPosition.Center});
    randomCell.contents.push({type: "person", subType: "worker", team: color, position: 0});
    return newCells;
  }

  static moveElement(cells: Cell[], elem: Element, cellToMoveTo: Cell): Cell[] {
    let newCells = [];

    let elemParentCell = getElementParentCell(elem, cells);

    for (var cell of cells) {
      let newCell = {...cell};

      if (cell.x == elemParentCell.x && cell.y == elemParentCell.y) {
        let newContents = [];

        for (var content of cell.contents) {
          if (content.id == elem.id) {
            continue
          }
          newContents.push(content);
        }

        newCell.contents = newContents;
      }
      else if (cell.x == cellToMoveTo.x && cell.y == cellToMoveTo.y) {
        let newContents = [...cell.contents];
        newContents.push(elem);
        newCell.contents = newContents;
      }
      newCells.push(newCell);
    }

    return newCells
  }

  static getRandomBoard(hexRadius: number, canvasWidth: number, canvasHeight: number, debugCellCount: number|null=null, playerCount: number=2): Cell[] {

    function getNeighborCell(cell) { 
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

      newCell.type = BoardGenerator.getNewCellType(cell.type);
      newCell.contents = [];

      return newCell
    }

    let boardSizes = BoardGenerator.getHexBoardSize(canvasWidth, canvasHeight, hexRadius)
    let boardWidth = boardSizes.cols;
    let boardHeight = boardSizes.rows;

    let cellCount;
    if (debugCellCount) {
      cellCount = debugCellCount;
    } else {
      let maxCellCount = boardWidth * boardHeight;
      cellCount = Math.floor(maxCellCount * 0.5);
    }

    let startCell = {
      x: Math.floor(boardWidth / 2), 
      y: Math.floor(boardHeight / 2), 
      type: CELL_TYPES[0].type,
      contents: []
    };

    let cells = [startCell];

    let maxAddAttemptCount = 20;

    for (let i=0; i < cellCount - 1; i++) {
      for (let j=0; j < maxAddAttemptCount; j++) {
        let newCell = getNeighborCell(randomItem(cells));

        let exists = false;
        for (var cell of cells) {
          if (cell.x == newCell.x && cell.y == newCell.y) {
            exists = true;
          }
        }

        if (!exists) {
          cells.push(newCell);
          break
        }
      }
    }

    let newCells = cells;

    for (let i=0; i<playerCount; i++) {
      newCells = BoardGenerator.addRandomCapitalToBoard(newCells, TEAM_COLORS[i]);
    }

    return newCells;
  }
}
