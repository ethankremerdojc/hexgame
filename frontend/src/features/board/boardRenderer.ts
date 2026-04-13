import {
  CellType,
  colorForTeam,
  ElementType,
  ElementSubType,
} from "./boardSlice.ts";

import {
  BoardUtils
} from "./boardUtils.ts"

import type { 
  Cell, Coordinate, Element
} from "./boardSlice.ts";

import { 
  getGrassCanvas,
  getForestCanvas,
  getMountainCanvas,
  getWaterCanvas
} from "./canvasPatterns.ts";
import { drawSvgToCanvas } from "./utils.js";

//buildings
import capitalSvg from "./svg/capital.svg?raw";
// import villageSvg from "./svg/house.svg?raw";

//persons
import personSvg from "./svg/person.svg?raw";
import forkSvg from "./svg/pitchfork.svg?raw";

//items
import foodSvg from "./svg/bread.svg?raw";
import goldSvg from "./svg/coin.svg?raw";
import woodSvg from "./svg/log.svg?raw";
import oreSvg from "./svg/rock.svg?raw";

function getSvgForElement(elem: Element) {
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
      throw new Error(`unknown element subtype: ${elem.subType}`);
      break;
  }
}


const TAU = 2 * Math.PI;

export class BoardRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    cells: Cell[],
    selectedCell: Cell|null,
    selectedElement: Element|null,
    showMoveInfo: boolean, 
    radius: number,
    offsetX: number,
    offsetY: number,
    inset: number=1,
  ): void {
    const hexPoints = BoardRenderer.createPoly(radius, inset);

    let adjacentCells: Cell[] = [];

    if (showMoveInfo && selectedElement && selectedElement.type == ElementType.Person) {
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
        ctx, radius,
        pixelOrigin,
        hexPoints, cell,
        cellHighlighted, selectedCell, offsetX, offsetY
      );
    }
  }

  static drawHex(
    ctx: CanvasRenderingContext2D, radius: number, origin: Coordinate, points: any, 
    cell: Cell, cellHighlighted: boolean, selectedCell: Cell|null,
    offsetX: number, offsetY: number
  ) {
    ctx.save();
    ctx.translate(origin.x, origin.y);
    BoardRenderer.polyPath3(ctx, points);
    ctx.restore();

    BoardRenderer.fillCell(ctx, cell.type, radius, offsetX, offsetY);
    BoardRenderer.drawElements(ctx, origin, cell, radius);

    // we should be able to add a linewidth to all hexes as long as we draw the 
    // highlighted and selected cells last, reordering them or whatever

    ctx.lineWidth = 4;

    if (selectedCell && cell.x == selectedCell.x && cell.y == selectedCell.y) {
      ctx.strokeStyle = "purple";
      ctx.stroke();
    } else if (cellHighlighted) {
      ctx.strokeStyle = "yellow";
      ctx.stroke();
    }

    ctx.lineWidth = 1;
  }

  static fillCell(ctx: CanvasRenderingContext2D, cellType: CellType, radius: number, offsetX: number, offsetY: number) {
    let canvasEl: HTMLCanvasElement;

    switch (Number(cellType)) {
      case CellType.Field:
        canvasEl = getGrassCanvas(radius);
        break;
      case CellType.Forest:
        canvasEl = getForestCanvas(radius);
        break;
      case CellType.Mountain:
        canvasEl = getMountainCanvas(radius);
        break;
      case CellType.Water:
        canvasEl = getWaterCanvas(radius);
        break;
      default:
        throw new Error(`Can't fill cell by cell type ${cellType}`);
        break;
    }

    let pattern: CanvasPattern|null = ctx.createPattern(canvasEl, "repeat");

    if (!pattern) {
      throw new Error("Unable to create canvas pattern obj.");
    }

    if (typeof(pattern) != "string") {
      pattern.setTransform(
        new DOMMatrix().translate(
          offsetX,
          offsetY
        )
      );
    }

    ctx.fillStyle = pattern;
    ctx.fill();
  }

  static drawElements(ctx: CanvasRenderingContext2D, origin: Coordinate, cell: Cell, radius: number) {

    //TODO
    //Refactor

    let { buildingSize, objectSize, toolSize, itemSize } = BoardUtils.getElemSizes(radius);
    let nonItemElements = cell.elements.filter(e => e.type != ElementType.Item);
    let itemElements = cell.elements.filter(e => e.type == ElementType.Item);

    for (var element of nonItemElements) {
        
      let elemPos = BoardUtils.getElementPosition(element, origin, radius);

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

        // held elements
        for (let i=0; i<element.heldElements.length; i++) {
          let heldElement = element.heldElements[i];
          let heldElemSvg = getSvgForElement(heldElement);
          let miniItemSize = itemSize * 0.75;

          drawSvgToCanvas(heldElemSvg, ctx,
            elemPos.x - miniItemSize*1.25, elemPos.y + miniItemSize*i*1.2+miniItemSize*0.5,
            miniItemSize, miniItemSize,
          );

          ctx.fillStyle = "white";
          ctx.font = `${miniItemSize}px serif`;
          let countStr = heldElement.count ? heldElement.count.toString() : "";

          ctx.fillText(countStr, elemPos.x - 2*miniItemSize, elemPos.y + miniItemSize*1.3 + miniItemSize*i*1.2)
        }


        if (element.subType == ElementSubType.Worker) {
          drawSvgToCanvas(forkSvg, ctx,
            elemPos.x + objectSize, elemPos.y,
            toolSize, objectSize,
          );
        }


        //todo determine better 'has actions'
        if (!element.hasActionAvailable) {
          ctx.fillStyle = "black";
          ctx.font = `${objectSize}px serif`;

          ctx.fillText("X", elemPos.x, elemPos.y+objectSize)
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

      ctx.fillStyle = "white";
      ctx.font = `${itemSize}px serif`;
      let countStr = element.count ? element.count.toString() : "";
      let digits = countStr.length;

      ctx.fillText(countStr, elemPos.x + 0.25*itemSize-(0.25*(digits-1)*itemSize), elemPos.y + itemSize*1.75)
    }
  }

  static drawBoundingBoxTriangles(ctx: CanvasRenderingContext2D, cell: Cell, radius: number) {
    let cellOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, radius, 0, 0);

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

  // static drawTileCoords(ctx: CanvasRenderingContext2D, cell: Cell, origin: Coordinate) {
  //   ctx.fillStyle = "black";
  //   ctx.font = "20px serif";
  //   ctx.fillText(`(${cell.x}, ${cell.y})`, origin.x - originOffset, origin.y);
  // }

  static createPoly(radius: number, inset: number) {
    const
      size = radius - inset,
      step = TAU / 6;

    let points = [];

    for (let i = 0; i < 6; i++) {
      points.push(BoardUtils.toPolarCoordinate(0, 0, size, step * i));
    }
    return points;
  }

  static polyPath3(ctx: CanvasRenderingContext2D, points: any = []) {
    const [{ x: startX, y: startY }] = points;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    points.forEach(({ x, y }: Coordinate) => { ctx.lineTo(x, y); });
    ctx.closePath();
  }
}
