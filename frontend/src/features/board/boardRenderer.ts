import type {
  Cell, Element, Coordinate
} from "./boardTypes"

import {
  CellType, ElementType, ElementSubType,
  USABLE_ITEMS
} from "./boardTypes"

import BoardUtils from "./boardUtils.ts"

import {
  colorForTeam
} from "./vars";

import { 
  getGrassCanvas,
  getForestCanvas,
  getMountainCanvas,
  getDesertCanvas,
  getClayfieldCanvas
} from "./canvasPatterns.ts";
import { drawSvgToCanvas } from "./utils.js";



//buildings
import capitalSvgRaw from "./svg/capital.svg?raw";
import capitalSvg from "./svg/capital.svg";

import villageSvgRaw from "./svg/house.svg?raw";
import villageSvg from "./svg/house.svg";

import farmSvgRaw from "./svg/farm.svg?raw";
import farmSvg from "./svg/farm.svg";

import sawmillSvgRaw from "./svg/sawmill.svg?raw";
import sawmillSvg from "./svg/sawmill.svg";

import quarrySvgRaw from "./svg/quarry.svg?raw";
import quarrySvg from "./svg/quarry.svg";

import brickFactorySvgRaw from "./svg/brickFactory.svg?raw";
import brickFactorySvg from "./svg/brickFactory.svg";



//persons
import personSvgRaw from "./svg/person.svg?raw";
import personSvg from "./svg/person.svg";

import traderSvgRaw from "./svg/trader.svg?raw";
import traderSvg from "./svg/trader.svg";



// held items
import forkSvgRaw from "./svg/pitchfork.svg?raw";

import swordSvgRaw from "./svg/sword.svg?raw";
import swordSvg from "./svg/sword.svg";

import bowSvgRaw from "./svg/bow.svg?raw";
import bowSvg from "./svg/bow.svg";

import shieldSvgRaw from "./svg/shield.svg?raw";
import shieldSvg from "./svg/shield.svg";

import cartSvgRaw from "./svg/cart.svg?raw";
import cartSvg from "./svg/cart.svg";

import horseSvgRaw from "./svg/horse.svg?raw";
import horseSvg from "./svg/horse.svg";

import cowSvgRaw from "./svg/cow.svg?raw";
import cowSvg from "./svg/cow.svg";

//items
import foodSvgRaw from "./svg/bread.svg?raw";
import foodSvg from "./svg/bread.svg";

import goldSvgRaw from "./svg/coin.svg?raw";
import goldSvg from "./svg/coin.svg";

import woodSvgRaw from "./svg/log.svg?raw";
import woodSvg from "./svg/log.svg";

import oreSvgRaw from "./svg/rock.svg?raw";
import oreSvg from "./svg/rock.svg";

import claySvgRaw from "./svg/clay.svg?raw";
import claySvg from "./svg/clay.svg";

import leatherSvgRaw from "./svg/leather.svg?raw";
import leatherSvg from "./svg/leather.svg";

import leatherArmorSvgRaw from "./svg/leather-armor.svg?raw";
import leatherArmorSvg from "./svg/leather-armor.svg";

import maceSvgRaw from "./svg/mace.svg?raw";
import maceSvg from "./svg/mace.svg";

import spearSvgRaw from "./svg/spear.svg?raw";
import spearSvg from "./svg/spear.svg";

import shovelSvgRaw from "./svg/shovel.svg?raw";

import ironArmorSvgRaw from "./svg/iron-armor.svg?raw";
import ironArmorSvg from "./svg/iron-armor.svg";

import forgeSvgRaw from "./svg/forge.svg?raw";
import forgeSvg from "./svg/forge.svg";

import noSvgRaw from "./svg/actions/noIcon.svg?raw";

export function getSvgForSubType(subType: ElementSubType, raw: boolean) {
  switch (subType) {

    // buildings
    case ElementSubType.Capital:
      if (raw) {
        return capitalSvgRaw;
      }
      return capitalSvg;
      break;
    case ElementSubType.Village:
      if (raw) {
        return villageSvgRaw;
      }
      return villageSvg;
      break;
    case ElementSubType.Farm:
      if (raw) {
        return farmSvgRaw;
      }
      return farmSvg;
      break;
    case ElementSubType.Quarry:
      if (raw) {
        return quarrySvgRaw;
      }
      return quarrySvg;
      break;
    case ElementSubType.Forge:
      if (raw) {
        return forgeSvgRaw;
      }
      return forgeSvg;
      break;
    case ElementSubType.SawMill:
      if (raw) {
        return sawmillSvgRaw;
      }
      return sawmillSvg;
      break;
    case ElementSubType.BrickFactory:
      if (raw) {
        return brickFactorySvgRaw;
      }
      return brickFactorySvg;
      break;



    // Persons
    case ElementSubType.Villager:
      if (raw) {
        return personSvgRaw;
      }
      return personSvg;
      break;
    case ElementSubType.Trader:
      if (raw) {
        return traderSvgRaw;
      }
      return traderSvg;
      break;



    // items
    case ElementSubType.Food:
      if (raw) {
        return foodSvgRaw;
      }
      return foodSvg;
      break;
    case ElementSubType.Gold:
      if (raw) {
        return goldSvgRaw;
      }
      return goldSvg;
      break;
    case ElementSubType.Wood:
      if (raw) {
        return woodSvgRaw;
      }
      return woodSvg;
      break;
    case ElementSubType.Ore:
      if (raw) {
        return oreSvgRaw;
      }
      return oreSvg;
      break;
    case ElementSubType.Clay:
      if (raw) {
        return claySvgRaw;
      }
      return claySvg;
      break;
    case ElementSubType.Leather:
      if (raw) {
        return leatherSvgRaw;
      }
      return leatherSvg;
      break;
    case ElementSubType.LeatherArmor:
      if (raw) {
        return leatherArmorSvgRaw;
      }
      return leatherArmorSvg;
      break;

    case ElementSubType.Sword:
      if (raw) {
        return swordSvgRaw;
      }
      return swordSvg;
      break;
    case ElementSubType.Bow:
      if (raw) {
        return bowSvgRaw;
      }
      return bowSvg;
      break;
    case ElementSubType.Shield:
      if (raw) {
        return shieldSvgRaw;
      }
      return shieldSvg;
      break;

    case ElementSubType.Mace:
      if (raw) {
        return maceSvgRaw;
      }
      return maceSvg;
      break;
    case ElementSubType.Spear:
      if (raw) {
        return spearSvgRaw;
      }
      return spearSvg;
      break;
    case ElementSubType.IronArmor:
      if (raw) {
        return ironArmorSvgRaw;
      }
      return ironArmorSvg;
      break;

    case ElementSubType.Cart:
      if (raw) {
        return cartSvgRaw;
      }
      return cartSvg;
      break;
    case ElementSubType.Horse:
      if (raw) {
        return horseSvgRaw;
      }
      return horseSvg;
      break;
    case ElementSubType.Cow:
      if (raw) {
        return cowSvgRaw;
      }
      return cowSvg;
      break;

    default:
      throw new Error(`unknown element subtype: ${subType}, type: ${typeof(subType)}`);
      break;
  }
}

const TAU = 2 * Math.PI;


export default class BoardRenderer {
  ctx: CanvasRenderingContext2D;
  cells: Cell[];
  selectedCell: Cell|null;
  selectedElement: Element|null;
  opts: {
    showMoveInfo: boolean;
    radius: number;
    offsetX: number;
    offsetY: number;
    inset: number;
  };
  elemSizes: any;

  constructor(
    ctx: CanvasRenderingContext2D,
    cells: Cell[],
    selectedCell: Cell|null,
    selectedElement: Element|null,
    showMoveInfo: boolean, 
    radius: number,
    offsetX: number,
    offsetY: number,
    inset: number=1,
  ) {
    this.ctx = ctx;
    this.cells = cells;
    this.selectedCell = selectedCell;
    this.selectedElement = selectedElement;

    this.opts = {
      showMoveInfo: showMoveInfo,
      radius: radius,
      offsetX: offsetX,
      offsetY: offsetY,
      inset: inset
    };

    this.elemSizes = BoardUtils.getElemSizes(radius);
  }

  render(): void { // Only function that should be called
    // INITIAL: 15-30ms per render
    // AFTER: 0.8ms

    const hexPoints: Coordinate[] = this.createPoly();

    let cellsToMoveTo: Cell[] = [];

    if (this.opts.showMoveInfo && this.selectedElement && this.selectedElement.type == ElementType.Person) {
      cellsToMoveTo = BoardUtils.getCellsPersonCanMoveTo(this.selectedElement, this.cells);
    }

    for (var cell of this.cells) {
      let cellHighlighted = false;

      for (var cm of cellsToMoveTo) {
        if (cell.x == cm.x && cell.y == cm.y) {
          cellHighlighted = true;
        }
      }

      let pixelOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, this.opts.radius, this.opts.offsetX, this.opts.offsetY);

      this.drawHex(pixelOrigin, hexPoints, cell, cellHighlighted);
      this.drawElements(pixelOrigin, cell);
    }
  }

  getCellPattern(cellType: CellType): HTMLCanvasElement {

    if (window.__cellPatterns === undefined) {
      let keys = [
        CellType.Field,
        CellType.Forest,
        CellType.Mountain,
        CellType.Desert,
        CellType.ClayField
      ]

      let result: any = {};

      for (var _key of keys) {
        let key = Number(_key);
        let canvasEl;

        //TODO if we store each based on radius, it won't add much
        switch (Number(key)) {
          case CellType.Field:
            canvasEl = getGrassCanvas(this.opts.radius);
            break;
          case CellType.Forest:
            canvasEl = getForestCanvas(this.opts.radius);
            break;
          case CellType.Mountain:
            canvasEl = getMountainCanvas(this.opts.radius);
            break;
          case CellType.Desert:
            canvasEl = getDesertCanvas(this.opts.radius);
            break;
          case CellType.ClayField:
            canvasEl = getClayfieldCanvas(this.opts.radius);
            break
          default:
            break;
        }

        result[key] = canvasEl;
      }

      window.__cellPatterns = result;
    }

    return window.__cellPatterns[cellType];
  }

  drawHex(
    origin: Coordinate,
    points: Coordinate[],
    cell: Cell,
    cellHighlighted: boolean,
  ) {
   
    this.ctx.save();
    this.ctx.translate(origin.x, origin.y);
    this.polyPath3(points);
    this.ctx.restore();

    this.fillCell(cell.type);

    this.ctx.save();
    this.ctx.lineWidth = 4;

    if (this.selectedCell && cell.x == this.selectedCell.x && cell.y == this.selectedCell.y) {
      this.ctx.strokeStyle = "purple";
      this.ctx.stroke();
    } else if (cellHighlighted) {
      this.ctx.strokeStyle = "yellow";
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  fillCell(
    cellType: CellType,
  ) {

    let canvasEl: HTMLCanvasElement= this.getCellPattern(cellType);
    let pattern: CanvasPattern|null = this.ctx.createPattern(canvasEl, "repeat");

    if (!pattern) {
      throw new Error("Unable to create canvas pattern obj.");
    }

    if (typeof(pattern) != "string") {
      pattern.setTransform(
        new DOMMatrix().translate(
          this.opts.offsetX,
          this.opts.offsetY
        )
      );
    }

    this.ctx.fillStyle = pattern;
    this.ctx.fill();
  }

  //===================== Elements ==========================

  getSvgForElement(element: Element) {
    let subType = element.subType;

    if (window.__cachedSvgs === undefined) {
      window.__cachedSvgs = {};
    }

    if (!window.__cachedSvgs[subType]) {
      window.__cachedSvgs[subType] = getSvgForSubType(subType, true);
    }
    return window.__cachedSvgs[subType];
  }

  drawElements(
    origin: Coordinate,
    cell: Cell,
  ) {
    let { buildingSize } = this.elemSizes;
    let nonItemElements = cell.elements.filter(e => e.type != ElementType.Item);
    let itemElements = cell.elements.filter(e => e.type == ElementType.Item);

    for (var element of nonItemElements) {
      let isSelected = this.selectedElement ? this.selectedElement.id == element.id : false;

      let elemPos = BoardUtils.getElementPosition(element, origin, this.opts.radius);

      let elemColor = colorForTeam(element.team);
      let elemSvg = this.getSvgForElement(element);

      if (element.type == ElementType.Building) {
        drawSvgToCanvas(elemSvg, this.ctx,
          elemPos.x, elemPos.y,
          buildingSize, buildingSize,
          elemColor
        );
      }
      if (element.type == ElementType.Person) {
        this.drawPersonElement(element, elemPos, elemSvg, elemColor, isSelected);
      }
    }

    if (itemElements.length > 0) {
      this.drawItemElements(itemElements, origin);
    }
  }

  drawPersonElement(
    element: Element,
    elemPos: Coordinate,
    elemSvg: any,
    elemColor: string,
    isSelected: boolean
  ) {

    let { objectSize, toolSize, itemSize } = this.elemSizes;
    drawSvgToCanvas(elemSvg, this.ctx,
      elemPos.x, elemPos.y,
      objectSize, objectSize,
      elemColor
    );

    if (element.subType != ElementSubType.Villager) {
      return
    }

    let miniItemSize = itemSize / 1.5;

    // held elements
    let nonUsableElements = element.heldElements.filter((el: Element) => !USABLE_ITEMS.includes(el.subType));

    for (let i=0; i<nonUsableElements.length; i++) {
      let heldElement = nonUsableElements[i];

      let heldElemSvg = this.getSvgForElement(heldElement);

      drawSvgToCanvas(heldElemSvg, this.ctx,
        elemPos.x - miniItemSize*1.25, elemPos.y + miniItemSize*i*1.2+miniItemSize*0.5,
        miniItemSize, miniItemSize,
      );

      this.ctx.fillStyle = "white";
      this.ctx.font = `${miniItemSize}px serif`;
      let countStr = heldElement.count ? heldElement.count.toString() : "";

      this.ctx.fillText(countStr, elemPos.x - 2*miniItemSize, elemPos.y + miniItemSize*1.3 + miniItemSize*i*1.2)
    }

    let holdingSword = element.heldElements.filter(el => el.subType == ElementSubType.Sword).length > 0;
    let holdingBow = element.heldElements.filter(el => el.subType == ElementSubType.Bow).length > 0;
    let holdingMace = element.heldElements.filter(el => el.subType == ElementSubType.Mace).length > 0;
    let holdingSpear = element.heldElements.filter(el => el.subType == ElementSubType.Spear).length > 0;
    let holdingShield = element.heldElements.filter(el => el.subType == ElementSubType.Shield).length > 0;
    let holdingCart = element.heldElements.filter(el => el.subType == ElementSubType.Cart).length > 0;
    let wearingLeatherArmor = element.heldElements.filter(el => el.subType == ElementSubType.LeatherArmor).length > 0;
    let wearingIronArmor = element.heldElements.filter(el => el.subType == ElementSubType.IronArmor).length > 0;
    let ridingHorse = element.heldElements.filter(el => el.subType == ElementSubType.Horse).length > 0;

    if (element.isWorking) {
      drawSvgToCanvas(forkSvgRaw, this.ctx,
        elemPos.x + objectSize*1.5, elemPos.y,
        toolSize, objectSize,
      );
    }
    if (element.isScavenging) {
      drawSvgToCanvas(shovelSvgRaw, this.ctx,
        elemPos.x + objectSize*1.5, elemPos.y,
        toolSize, objectSize,
      );
    }

    if (wearingLeatherArmor) {
      drawSvgToCanvas(leatherArmorSvgRaw, this.ctx,
        elemPos.x - objectSize*0.12, elemPos.y+objectSize*0.65,
        objectSize*1.24, objectSize*0.35,
      );
    }

    if (wearingIronArmor) {
      drawSvgToCanvas(ironArmorSvgRaw, this.ctx,
        elemPos.x - objectSize*0.12, elemPos.y+objectSize*0.65,
        objectSize*1.24, objectSize*0.35,
      );
    }

    if (ridingHorse) {
      drawSvgToCanvas(horseSvgRaw, this.ctx,
        elemPos.x - objectSize*0.15, elemPos.y+objectSize*0.65,
        objectSize*1.5, objectSize,
      );

      let horse = element.heldElements.filter(el => el.subType == ElementSubType.Horse)[0];

      if (horse.hasActionAvailable === false) {
        drawSvgToCanvas(noSvgRaw, this.ctx,
          elemPos.x - objectSize*0.15, elemPos.y+objectSize*0.65,
          objectSize*1.5, objectSize,
        );
      }
    }

    if (holdingSword || holdingSpear || holdingMace || holdingBow) {
      let svg: null|string = null;

      if (holdingSword) {
        svg = swordSvgRaw;
      } else if (holdingMace) {
        svg = maceSvgRaw;
      } else if (holdingSpear) {
        svg = spearSvgRaw;
      } else {
        svg = bowSvgRaw;
      }

      drawSvgToCanvas(svg, this.ctx,
        elemPos.x + objectSize*1.1, elemPos.y,
        toolSize, objectSize,
      );
    }

    if (holdingShield) {
      drawSvgToCanvas(shieldSvgRaw, this.ctx,
        elemPos.x-objectSize*0.25, elemPos.y+objectSize*0.25,
        toolSize, objectSize*0.8,
      );
    };
    if (holdingCart) {
      drawSvgToCanvas(cartSvgRaw, this.ctx,
        elemPos.x-objectSize*0.4, elemPos.y+objectSize*0.5,
        objectSize*0.8, objectSize*0.6,
      );
    }

    //todo determine better 'has actions'
    if (!element.hasActionAvailable) {
      drawSvgToCanvas(noSvgRaw, this.ctx,
        elemPos.x + objectSize*0.25, elemPos.y+objectSize*0.4,
        objectSize*0.5, objectSize*0.5,
      );
    }

    // Health

    this.ctx.fillStyle = "red";
    this.ctx.font = `${miniItemSize*1.8}px serif`;
    let healthStr: string = element.health.toString();
    this.ctx.fillText(healthStr, elemPos.x - miniItemSize*1.8, elemPos.y - miniItemSize*0.25);

    if (isSelected) {
      this.drawHighlightBox(elemPos, objectSize, "yellow");
    }

    // Name

    this.ctx.fillStyle = "white";
    this.ctx.font = `${miniItemSize*1.2}px serif`;
    let elStr = element.name ? element.name : "";
    this.ctx.fillText(
      elStr, 
      elemPos.x,
      elemPos.y - objectSize*0.2
    );
  }

  drawHighlightBox(
    elemPos: Coordinate,
    objectSize: number,
    color: string
  ) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    let lineWidth = objectSize/12;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(elemPos.x-lineWidth, elemPos.y-lineWidth, objectSize+2*lineWidth, objectSize+2*lineWidth);
    this.ctx.restore();
  }

  drawItemElements(
    itemElements: Element[], 
    origin: Coordinate,
  ) {
    let { itemSize } = this.elemSizes;

    let itemElementsCount = itemElements.length;

    let twoRows = itemElementsCount > 5;
    
    for (let i=0; i < itemElementsCount; i++) {
      let element = itemElements[i];
      let elemPos = BoardUtils.getElementPosition(element, origin, this.opts.radius);

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

      let elemSvg = this.getSvgForElement(element);

      drawSvgToCanvas(elemSvg, 
        this.ctx,
        elemPos.x, elemPos.y,
        itemSize, itemSize
      );

      this.ctx.fillStyle = "white";
      this.ctx.font = `${itemSize}px serif`;
      let countStr = element.count ? element.count.toString() : "";
      let digits = countStr.length;

      this.ctx.fillText(countStr, elemPos.x + 0.25*itemSize-(0.25*(digits-1)*itemSize), elemPos.y + itemSize*1.75)
    }
  }

  //===================== Shape things ==========================

  createPoly(): Coordinate[] {
    const
      size = this.opts.radius - this.opts.inset,
      step = TAU / 6;

    let points = [];

    for (let i = 0; i < 6; i++) {
      points.push(BoardUtils.toPolarCoordinate(0, 0, size, step * i));
    }
    return points;
  }

  polyPath3(points: Coordinate[]) {
    const [{ x: startX, y: startY }] = points;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    points.forEach(({ x, y }: Coordinate) => { this.ctx.lineTo(x, y); });
    this.ctx.closePath();
  }
}

// drawBoundingBoxTriangles(cell: Cell) {
//   let cellOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, radius, 0, 0);
//
//   let boundingBoxTriangles = BoardUtils.getBoundingBoxCornerTriangles(radius, cellOrigin);
//
//   for (var triangle of boundingBoxTriangles) {
//     ctx.beginPath();
//     ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
//     ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
//     ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
//     ctx.closePath();
//     ctx.strokeStyle = "orange"; 
//     ctx.stroke();
//   }
// }

// static drawTileCoords(ctx: CanvasRenderingContext2D, cell: Cell, origin: Coordinate) {
//   ctx.fillStyle = "black";
//   ctx.font = "20px serif";
//   ctx.fillText(`(${cell.x}, ${cell.y})`, origin.x - originOffset, origin.y);
// 
