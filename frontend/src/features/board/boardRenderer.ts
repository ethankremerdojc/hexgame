import type {
  Cell, Element, Coordinate
} from "./boardTypes"

import {
  CellType, ElementType, ElementSubType, ElementAction
} from "./boardTypes"

import {
  BoardUtils
} from "./boardUtils.ts"

import {
  colorForTeam
} from "./vars";

import { 
  getGrassCanvas,
  getForestCanvas,
  getMountainCanvas,
  getDesertCanvas
} from "./canvasPatterns.ts";
import { drawSvgToCanvas } from "./utils.js";

//buildings
import capitalSvg from "./svg/capital.svg?raw";
import villageSvg from "./svg/house.svg?raw";
import farmSvg from "./svg/farm.svg?raw";
import sawmillSvg from "./svg/sawmill.svg?raw";
import quarrySvg from "./svg/quarry.svg?raw";

//persons
import personSvg from "./svg/person.svg?raw";
import forkSvg from "./svg/pitchfork.svg?raw";
import swordSvg from "./svg/sword.svg?raw";
import bowSvg from "./svg/bow.svg?raw";
import shieldSvg from "./svg/shield.svg?raw";

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
      return villageSvg;
      break;
    case ElementSubType.Farm:
      return farmSvg;
      break;
    case ElementSubType.Quarry:
      return quarrySvg;
      break;
    case ElementSubType.SawMill:
      return sawmillSvg;
      break;


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

    case ElementSubType.Sword:
      return swordSvg;
      break;
    case ElementSubType.Bow:
      return bowSvg;
      break;
    case ElementSubType.Shield:
      return shieldSvg;
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
        pixelOrigin, hexPoints, 
        cell, cellHighlighted, 
        selectedCell, selectedElement,
        offsetX, offsetY
      );
    }
  }

  static drawHex(
    ctx: CanvasRenderingContext2D, radius: number, 
    origin: Coordinate, points: any, 
    cell: Cell, cellHighlighted: boolean, 
    selectedCell: Cell|null, selectedElement: Cell|null,
    offsetX: number, offsetY: number
  ) {
    ctx.save();
    ctx.translate(origin.x, origin.y);
    BoardRenderer.polyPath3(ctx, points);
    ctx.restore();

    BoardRenderer.fillCell(ctx, cell.type, radius, offsetX, offsetY);
    BoardRenderer.drawElements(ctx, origin, cell, radius, selectedElement);

    // we should be able to add a linewidth to all hexes as long as we draw the 
    // highlighted and selected cells last, reordering them or whatever
    
    ctx.save();
    ctx.lineWidth = 4;

    if (selectedCell && cell.x == selectedCell.x && cell.y == selectedCell.y) {
      ctx.strokeStyle = "purple";
      ctx.stroke();
    } else if (cellHighlighted) {
      ctx.strokeStyle = "yellow";
      ctx.stroke();
    }

    ctx.restore();
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
      case CellType.Desert:
        canvasEl = getDesertCanvas(radius);
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

  static drawHighlightBox(
    ctx: CanvasRenderingContext2D, elemPos: Coordinate, objectSize: number, color: string
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    let lineWidth = objectSize/12;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(elemPos.x-lineWidth, elemPos.y-lineWidth, objectSize+2*lineWidth, objectSize+2*lineWidth);
    ctx.restore();
  }

  static drawPersonElement(
    ctx: CanvasRenderingContext2D, 
    element: Element, elemPos: Coordinate, 
    elemSvg: any, elemColor: string, 
    radius: number,
    isSelected: boolean
  ) {

    let { buildingSize, objectSize, toolSize, itemSize } = BoardUtils.getElemSizes(radius);

    drawSvgToCanvas(elemSvg, ctx,
      elemPos.x, elemPos.y,
      objectSize, objectSize,
      elemColor
    );

    let miniItemSize = itemSize / 1.5;

    // held elements
    for (let i=0; i<element.heldElements.length; i++) {
      let heldElement = element.heldElements[i];
      if ([ElementSubType.Sword, ElementSubType.Bow, ElementSubType.Shield].includes(heldElement.subType)) {
        continue
      }
      let heldElemSvg = getSvgForElement(heldElement);

      drawSvgToCanvas(heldElemSvg, ctx,
        elemPos.x - miniItemSize*1.25, elemPos.y + miniItemSize*i*1.2+miniItemSize*0.5,
        miniItemSize, miniItemSize,
      );

      ctx.fillStyle = "white";
      ctx.font = `${miniItemSize}px serif`;
      let countStr = heldElement.count ? heldElement.count.toString() : "";

      ctx.fillText(countStr, elemPos.x - 2*miniItemSize, elemPos.y + miniItemSize*1.3 + miniItemSize*i*1.2)
    }

    let holdingSword = element.heldElements.filter(el => el.subType == ElementSubType.Sword).length > 0;
    let holdingBow = element.heldElements.filter(el => el.subType == ElementSubType.Bow).length > 0;
    let holdingShield = element.heldElements.filter(el => el.subType == ElementSubType.Shield).length > 0;

    if (!holdingSword && !holdingBow) {
      drawSvgToCanvas(forkSvg, ctx,
        elemPos.x + objectSize, elemPos.y,
        toolSize, objectSize,
      );
    }
    if (holdingSword) {
      drawSvgToCanvas(swordSvg, ctx,
        elemPos.x + objectSize*1.1, elemPos.y,
        toolSize, objectSize,
      );
    }
    if (holdingBow) {
      drawSvgToCanvas(bowSvg, ctx,
        elemPos.x + objectSize*1.1, elemPos.y,
        toolSize, objectSize,
      );
    };
    if (holdingShield) {
      drawSvgToCanvas(shieldSvg, ctx,
        elemPos.x-objectSize*0.25, elemPos.y+objectSize*0.25,
        toolSize, objectSize*0.8,
      );
    }

    //todo determine better 'has actions'
    if (!element.hasActionAvailable) {
      ctx.fillStyle = "black";
      ctx.font = `${objectSize/2.5}px serif`;

      ctx.fillText("no actions", elemPos.x - objectSize*0.25, elemPos.y+objectSize*1.4)
    }

    // Health

    ctx.fillStyle = "red";
    ctx.font = `${miniItemSize*1.5}px serif`;
    let healthStr: string = element.health.toString() + " h";
    ctx.fillText(healthStr, elemPos.x + objectSize*1.4, elemPos.y + miniItemSize*1.5);

    // Working
    if (element.isWorking) {
      ctx.fillStyle = "blue";
      ctx.font = `${miniItemSize*1.5}px serif`;
      ctx.fillText("Working", elemPos.x + objectSize*1.4, elemPos.y + miniItemSize*2.5);
    }

    if (isSelected) {
      BoardRenderer.drawHighlightBox(ctx, elemPos, objectSize, "yellow");
    }
  }

  static drawItemElements(ctx, itemElements, origin, radius) {
    let { buildingSize, objectSize, toolSize, itemSize } = BoardUtils.getElemSizes(radius);

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

  static drawElements(ctx: CanvasRenderingContext2D, origin: Coordinate, cell: Cell, radius: number, selectedElement: Element) {
    let { buildingSize, objectSize, toolSize, itemSize } = BoardUtils.getElemSizes(radius);
    let nonItemElements = cell.elements.filter(e => e.type != ElementType.Item);
    let itemElements = cell.elements.filter(e => e.type == ElementType.Item);

    for (var element of nonItemElements) {
      let isSelected = selectedElement && selectedElement.id == element.id;

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
        BoardRenderer.drawPersonElement(ctx, element, elemPos, elemSvg, elemColor, radius, isSelected);
      }
    }

    BoardRenderer.drawItemElements(ctx, itemElements, origin, radius);
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
