import {
  HexPosition,
  CELL_INFO_BY_TYPE, colorForTeam,
  ElementType,
  parseElementId
} from "./boardSlice.ts";

import {
  BoardUtils
} from "./boardUtils.ts"

import type { 
  Cell, Coordinate, Element
} from "./boardSlice.ts";

import { randomItem, drawSvgToCanvas } from "./utils.js";

import personSvg from "./elements/person.svg?raw";
import capitalSvg from "./elements/capital.svg?raw";
import forkSvg from "./elements/pitchfork.svg?raw";

const TAU = 2 * Math.PI;

//TODO
// move this to import
function getColorForType(t) {
  let info = CELL_INFO_BY_TYPE[t];
  return info.color;
}

export class BoardRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    cells: Cell[],
    selectedCell: Cell|null,
    selectedElement: Cell|null,
    radius: number,
    offsetX: number,
    offsetY: number,
    inset: number=2,
  ): void {
    const hexPoints = BoardRenderer.createPoly(radius, inset);

    let adjacentCells = [];

    if (selectedElement && selectedElement.type == ElementType.Person) {
      let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
      adjacentCells = BoardUtils.getAdjacentCells(cells, parentCell);
    }

    for (var cell of cells) {
      let cellHighlighted = false;

      for (var a of adjacentCells) {
        if (cell.x == a.x && cell.y == a.y) {
          cellHighlighted = true;
        }
      }

      let pixelOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, radius, offsetX, offsetY);

      BoardRenderer.drawHex(
        ctx, radius, pixelOrigin,
        hexPoints, cell,
        cellHighlighted, selectedCell
      );
    }
  }

  static drawHex(ctx, radius, origin, points, cell, cellHighlighted, selectedCell) {
    ctx.save();
    ctx.translate(origin.x, origin.y);
    BoardRenderer.polyPath3(ctx, points);
    ctx.restore();

    let cellColor = getColorForType(cell.type);
    ctx.fillStyle = cellColor;
    ctx.fill();

    BoardRenderer.drawElements(ctx, origin, cell, radius);

    if (selectedCell) {
      if (cell.x == selectedCell.x && cell.y == selectedCell.y) {
        ctx.strokeStyle = "white";
        ctx.stroke();
      }
    }
    if (cellHighlighted) {
      ctx.strokeStyle = "yellow";
      ctx.stroke();
    }

    // this.drawBoundingBoxTriangles(ctx, cell, opts);
  }

  static drawElements(ctx, origin, cell, radius) {
    let { halfRadius, buildingSize, objectSize, toolSize } = BoardUtils.getElemSizes(radius);
    let halfToolSize = toolSize / 2;

    for (var element of cell.contents) {

      let elemPos = BoardUtils.getElementPosition(element, origin, radius);
      let originOffset = null;

      let elemColor = colorForTeam(element.team);

      if (element.subType == "capital") {
        drawSvgToCanvas(capitalSvg, ctx,
          elemPos.x, elemPos.y,
          buildingSize, buildingSize,
          elemColor
        );
      }

      if (element.type == ElementType.Person) {
        drawSvgToCanvas(personSvg, ctx,
          elemPos.x, elemPos.y,
          objectSize, objectSize,
          elemColor
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

  static drawBoundingBoxTriangles(ctx, cell, radius) {
    let cellOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, radius);

    let boundingBoxTriangles = BoardUtils.getBoundingBoxCornerTriangles(radius, cellOrigin);

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

  static drawTileCoords(ctx, cell, origin) {
    ctx.fillStyle = "black";
    ctx.font = "20px serif";
    ctx.fillText(`(${cell.x}, ${cell.y})`, origin.x - originOffset, origin.y);
  }

  static createPoly(radius, inset) {
    const
      size = radius - inset,
      step = TAU / 6;

    let points = [];

    for (let i = 0; i < 6; i++) {
      points.push(BoardUtils.toPolarCoordinate(0, 0, size, step * i));
    }
    return points;
  }

  static polyPath3(ctx, points = []) {
    const [{ x: startX, y: startY }] = points;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    points.forEach(({ x, y }) => { ctx.lineTo(x, y); });
    ctx.closePath();
  }
}
