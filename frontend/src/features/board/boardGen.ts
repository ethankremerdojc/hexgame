import { randomItem } from "./utils.js";

const TAU = 2 * Math.PI;

const TEAM_COLORS = [
  "white", "purple", "red", "yellow"
]

export const CELL_MUTATION_RATE = 0.4;

export const CELL_TYPES = [
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


function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  function sign(px, py, ax, ay, bx, by) {
    return (px - bx) * (ay - by) - (ax - bx) * (py - by);
  }

  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

export class BoardGenerator {
  constructor(options={}, canvasWidth, canvasHeight) {
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

  drawHexes(ctx, cells) {
    const opts = {...this.options};

    const hexPoints = this.createPoly(opts);

    for (var cell of cells) {
      this.drawPoly(ctx, this.gridToPixelOrigin(cell.x, cell.y, opts), hexPoints, opts, cell);
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

  drawElements(ctx, origin, cell, opts) {

    let buildingSize = 2/3 * opts.radius;
    let originOffset = buildingSize / 2;
   
    // ctx.fillStyle = "black";
    // ctx.font = "20px serif";
    // ctx.fillText(`(${cell.x}, ${cell.y})`, origin.x - originOffset, origin.y);

    // let cellOrigin = this.gridToPixelOrigin(cell.x, cell.y, opts);

    // let boundingBoxTriangles = this.getBoundingBoxCornerTriangles(cellOrigin);
    //
    // for (var triangle of boundingBoxTriangles) {
    //   ctx.beginPath();
    //   ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
    //   ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
    //   ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
    //   ctx.closePath();
    //   ctx.strokeStyle = "orange"; 
    //   ctx.stroke();
    // }

    for (var element of cell.contents) {
      if (element.type == "capital") {
        ctx.fillStyle = element.team;
        ctx.fillRect(
          origin.x - originOffset, origin.y - originOffset,
          buildingSize, buildingSize
        );
      }
    }
  }

  drawPoly(ctx, origin, points, opts, cell) {
    ctx.strokeStyle = opts.strokeStyle;
    ctx.save();
    ctx.translate(origin.x, origin.y);
    this.polyPath3(ctx, points);
    ctx.restore();

    let cellColor = getColorForType(cell.type);
    ctx.fillStyle = cellColor;
    ctx.fill();

    this.drawElements(ctx, origin, cell, opts);

    if (opts.selectedCell) {
      if (cell.x == opts.selectedCell.x && cell.y == opts.selectedCell.y) {
        ctx.strokeStyle = "white";
        ctx.stroke();
      } else {
        if (opts.strokeStyle) ctx.stroke();
      }
    } else {
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

  pixelToGrid(px, py) {
    const m = this.gridMeasurements(this.options);

    let newX = Math.round((px - this.options.offsetX) / m.gridSpaceX);
    let newY = Math.round((py - this.options.offsetY - (newX % 2 ? m.gridOffsetY : 0)) / m.gridSpaceY); // determine if we should do the mod here or later

    // Get the origin for whatever the system thinks we are on
    let initialOrigin = this.gridToPixelOrigin(newX, newY, this.options);
    let boundingBoxTriangles = this.getBoundingBoxCornerTriangles(initialOrigin);
    let boundingBoxCornerClicked = null;

    for (var triangle of boundingBoxTriangles) {
      if (pointInTriangle(
        px, py,
        triangle.points[0].x, triangle.points[0].y,
        triangle.points[1].x, triangle.points[1].y,
        triangle.points[2].x, triangle.points[2].y,
      )) {
        boundingBoxCornerClicked = triangle.name;
      }
    }

    if (boundingBoxCornerClicked) {

      if (boundingBoxCornerClicked.includes("left")) {
        newX -= 1;
      } else {
        newX += 1;
      }

      if (boundingBoxCornerClicked.includes("top")) {
        if (newX % 2) {
          newY -= 1;
        }
      } else {
        newY += 1;
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

  static getNewCellType(oldType) {
    let doMutation = Math.random() < CELL_MUTATION_RATE;

    if (!doMutation) {
      return oldType
    }

    return BoardGenerator.getRandomCellTypeByRates();
  }
  
  static getRandomCellTypeByRates() {
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

  static getHexBoardSize(canvasWidth, canvasHeight, radius) {
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

  static addCapitalToBoard(cells, color) {
    let newCells = structuredClone(cells);

    let randomCell;

    while (true) {
      randomCell = randomItem(newCells);
      if (randomCell.contents.length == 0) {
        break;
      }
    }

    randomCell.contents.push({type: "capital", team: color});
    return newCells;
  }

  static getRandomBoard(hexRadius, canvasWidth, canvasHeight, debugCellCount=null, playerCount=2) {

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

    for (let i=0; i < cellCount - 1; i++) {
      while (true) {
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
      newCells = BoardGenerator.addCapitalToBoard(newCells, TEAM_COLORS[i]);
    }

    return newCells;
  }
}
