import {
  HexPosition,
  CELL_INFO_BY_TYPE, colorForTeam,
  ElementType,
  ElementSubType,
  parseElementId
} from "./boardSlice.ts";

import {
  BoardUtils
} from "./boardUtils.ts"

import type { 
  Cell, Coordinate, Element
} from "./boardSlice.ts";

import { randomItem, drawSvgToCanvas } from "./utils.js";

//buildings
import capitalSvg from "./elements/capital.svg?raw";
import villageSvg from "./elements/house.svg?raw";

//persons
import personSvg from "./elements/person.svg?raw";
import forkSvg from "./elements/pitchfork.svg?raw";

//items
import foodSvg from "./elements/bread.svg?raw";
import goldSvg from "./elements/coin.svg?raw";
import woodSvg from "./elements/log.svg?raw";
import oreSvg from "./elements/rock.svg?raw";

function getSvgForElement(elem) {
  switch (elem.subType) {
    // buildings
    case ElementSubType.Capital:
      return capitalSvg;
      break;
    case ElementSubType.Village:
      return capitalSvg;
      break;
    // case ElementSubType.Farm:
    //   return capitalSvg;
    //   break;
    // case ElementSubType.Quarry:
    //   return capitalSvg;
    //   break;

    // Persons
    case ElementSubType.Worker:
    case ElementSubType.Soldier:
    case ElementSubType.Archer:
      return personSvg;
      break;

    // items
    case ElementSubType.Food:
      return foodSvg;
      break;
    case ElementSubType.Gold:
      return goldSvg;
      break;
    case ElementSubType.Wood:
      return woodSvg;
      break;
    case ElementSubType.Ore:
      return oreSvg;
      break;
    default:
      throw new Error("unknown element subtype: ", elem.subType);
      break;
  }
}

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
    let { halfRadius, buildingSize, objectSize, toolSize, itemSize } = BoardUtils.getElemSizes(radius);
    let halfToolSize = toolSize / 2;

    let nonItemElements = cell.contents.filter(e => e.type != ElementType.Item);
    let itemElements = cell.contents.filter(e => e.type == ElementType.Item);

    for (var element of nonItemElements) {

      let elemPos = BoardUtils.getElementPosition(element, origin, radius);
      let originOffset = null;

      let elemColor = colorForTeam(element.team);
      let elemSvg = getSvgForElement(element);

      if (element.type == ElementType.Building) {
        drawSvgToCanvas(elemSvg, ctx,
          elemPos.x, elemPos.y,
          buildingSize, buildingSize,
          elemColor
        );
      }

      if (element.type == ElementType.Person) {
        drawSvgToCanvas(elemSvg, ctx,
          elemPos.x, elemPos.y,
          objectSize, objectSize,
          elemColor
        );

        if (element.subType == ElementSubType.Worker) {
          drawSvgToCanvas(forkSvg, ctx,
            elemPos.x + objectSize + halfToolSize, elemPos.y,
            toolSize, objectSize,
          );
        }
      }
    }

    let itemElementsCount = itemElements.length;

    let twoRows = itemElementsCount > 5;

    for (let i=0; i < itemElementsCount; i++) {
      let element = itemElements[i];
      let elemPos = BoardUtils.getElementPosition(element, origin, radius);

      let itemSpace = 0.8;

      if (twoRows) {
        if (i<=4) {
          elemPos.y -= itemSize*0.8;
        } else {
          elemPos.y += itemSize*0.8;
        }
      }

      let subI;

      if (i <= 4) {
        subI = i;
      } else {
        subI = i - 5;
      }

      if (subI%2) {
        elemPos.x = origin.x - subI*0.5*(1+itemSpace)*itemSize - (1+(itemSpace*0.5))*itemSize;
      } else {
        elemPos.x = origin.x + subI*0.5*(1+itemSpace)*itemSize - 0.5*itemSize;
      }

      let elemSvg = getSvgForElement(element);

      drawSvgToCanvas(elemSvg, 
        ctx,
        elemPos.x, elemPos.y,
        itemSize, itemSize
      );

      ctx.fillStyle = "black";
      ctx.font = `${itemSize}px serif`;
      let countStr = element.count.toString();
      let digits = countStr.length;

      ctx.fillText(element.count, elemPos.x + 0.25*itemSize-(0.25*(digits-1)*itemSize), elemPos.y + itemSize*1.75)
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
