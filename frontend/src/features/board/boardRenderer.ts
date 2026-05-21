import type {
  Cell, Element
} from "@/features/game/gameTypes"

import type {
  Coordinate
} from "@/features/board/boardTypes"

import {
  CellTypes, ElementTypes, ElementSubTypes,
} from "@/features/game/gameTypes"

import {
  USABLE_ITEMS,
  ELEMENTS_YOU_SEE_IN_PERSON_UI,
  THIN_RENDERED_ELEMENTS,
  SHORT_RENDERED_ELEMENTS
} from "@/features/game/gameVars"

import BoardUtils from "./boardUtils.ts"

import { 
  colorForTeam,
} from "@/features/board/boardVars"

import { 
  getGrassCanvas,
  getForestCanvas,
  getMountainCanvas,
  getDesertCanvas,
  getClayfieldCanvas
} from "./canvasPatterns.ts";

import { drawSvgToCanvas } from "@/utils";

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
import workIconRaw from "./svg/actions/workIcon.svg?raw";

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

import ironArmorSvgRaw from "./svg/iron-armor.svg?raw";
import ironArmorSvg from "./svg/iron-armor.svg";

import forgeSvgRaw from "./svg/forge.svg?raw";
import forgeSvg from "./svg/forge.svg";

import noSvgRaw from "./svg/actions/noIcon.svg?raw";
import yesSvgRaw from "./svg/actions/yesIcon.svg?raw";

export function getSvgForSubType(subType: number, raw: boolean) {
  switch (subType) {

    // buildings
    case ElementSubTypes.Capital:
      if (raw) {
        return capitalSvgRaw;
      }
      return capitalSvg;
      break;
    case ElementSubTypes.Village:
      if (raw) {
        return villageSvgRaw;
      }
      return villageSvg;
      break;
    case ElementSubTypes.Farm:
      if (raw) {
        return farmSvgRaw;
      }
      return farmSvg;
      break;
    case ElementSubTypes.Quarry:
      if (raw) {
        return quarrySvgRaw;
      }
      return quarrySvg;
      break;
    case ElementSubTypes.Forge:
      if (raw) {
        return forgeSvgRaw;
      }
      return forgeSvg;
      break;
    case ElementSubTypes.SawMill:
      if (raw) {
        return sawmillSvgRaw;
      }
      return sawmillSvg;
      break;
    case ElementSubTypes.BrickFactory:
      if (raw) {
        return brickFactorySvgRaw;
      }
      return brickFactorySvg;
      break;



    // Persons
    case ElementSubTypes.Villager:
      if (raw) {
        return personSvgRaw;
      }
      return personSvg;
      break;
    case ElementSubTypes.Trader:
      if (raw) {
        return traderSvgRaw;
      }
      return traderSvg;
      break;



    // items
    case ElementSubTypes.Food:
      if (raw) {
        return foodSvgRaw;
      }
      return foodSvg;
      break;
    case ElementSubTypes.Gold:
      if (raw) {
        return goldSvgRaw;
      }
      return goldSvg;
      break;
    case ElementSubTypes.Wood:
      if (raw) {
        return woodSvgRaw;
      }
      return woodSvg;
      break;
    case ElementSubTypes.Ore:
      if (raw) {
        return oreSvgRaw;
      }
      return oreSvg;
      break;
    case ElementSubTypes.Clay:
      if (raw) {
        return claySvgRaw;
      }
      return claySvg;
      break;
    case ElementSubTypes.Leather:
      if (raw) {
        return leatherSvgRaw;
      }
      return leatherSvg;
      break;
    case ElementSubTypes.LeatherArmor:
      if (raw) {
        return leatherArmorSvgRaw;
      }
      return leatherArmorSvg;
      break;

    case ElementSubTypes.Sword:
      if (raw) {
        return swordSvgRaw;
      }
      return swordSvg;
      break;
    case ElementSubTypes.Bow:
      if (raw) {
        return bowSvgRaw;
      }
      return bowSvg;
      break;
    case ElementSubTypes.Shield:
      if (raw) {
        return shieldSvgRaw;
      }
      return shieldSvg;
      break;

    case ElementSubTypes.Mace:
      if (raw) {
        return maceSvgRaw;
      }
      return maceSvg;
      break;
    case ElementSubTypes.Spear:
      if (raw) {
        return spearSvgRaw;
      }
      return spearSvg;
      break;
    case ElementSubTypes.IronArmor:
      if (raw) {
        return ironArmorSvgRaw;
      }
      return ironArmorSvg;
      break;

    case ElementSubTypes.Cart:
      if (raw) {
        return cartSvgRaw;
      }
      return cartSvg;
      break;
    case ElementSubTypes.Horse:
      if (raw) {
        return horseSvgRaw;
      }
      return horseSvg;
      break;
    case ElementSubTypes.Cow:
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

import sevenHealthRaw from "./svg/playerUI/health/heartIcon-7h.svg?raw"
import sixHealthRaw from "./svg/playerUI/health/heartIcon-6h.svg?raw"
import fiveHealthRaw from "./svg/playerUI/health/heartIcon-5h.svg?raw"
import fourHealthRaw from "./svg/playerUI/health/heartIcon-4h.svg?raw"
import threeHealthRaw from "./svg/playerUI/health/heartIcon-3h.svg?raw"
import twoHealthRaw from "./svg/playerUI/health/heartIcon-2h.svg?raw"
import oneHealthRaw from "./svg/playerUI/health/heartIcon-1h.svg?raw"

import defenceIconRaw from "./svg/playerUI/defenceIcon.svg?raw"
import attackIconRaw from "./svg/playerUI/attackIcon.svg?raw"

function getHealthIcon(health: number) {
  return [
    oneHealthRaw,
    twoHealthRaw,
    threeHealthRaw,
    fourHealthRaw,
    fiveHealthRaw,
    sixHealthRaw,
    sevenHealthRaw
  ][health - 1]
}

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

    if (this.opts.showMoveInfo && this.selectedElement && this.selectedElement.type == ElementTypes.Person) {
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
    }

    for (var cell of this.cells) {
      let pixelOrigin = BoardUtils.gridToPixelOrigin(cell.x, cell.y, this.opts.radius, this.opts.offsetX, this.opts.offsetY);
      this.drawElements(pixelOrigin, cell);
    }
  }

  getCellPattern(cellType: number): HTMLCanvasElement {

    if (window.__cellPatterns === undefined) {
      let keys = [
        CellTypes.Field,
        CellTypes.Forest,
        CellTypes.Mountain,
        CellTypes.Desert,
        CellTypes.ClayField
      ]

      let cp: any = {};

      for (var key of keys) {
        cp[key] = {};
      }

      window.__cellPatterns = cp;
    }

    let truncRadius = Math.round(this.opts.radius * 1000000) / 1000000;

    if (window.__cellPatterns[cellType][truncRadius] === undefined) {
      let canvasEl;

      switch (cellType) {
        case CellTypes.Field:
          canvasEl = getGrassCanvas(truncRadius);
          break;
        case CellTypes.Forest:
          canvasEl = getForestCanvas(truncRadius);
          break;
        case CellTypes.Mountain:
          canvasEl = getMountainCanvas(truncRadius);
          break;
        case CellTypes.Desert:
          canvasEl = getDesertCanvas(truncRadius);
          break;
        case CellTypes.ClayField:
          canvasEl = getClayfieldCanvas(truncRadius);
          break
        default:
          throw new Error(`Unknown cell type: ${cellType}`)
          break;
      }

      window.__cellPatterns[cellType][truncRadius] = canvasEl;
    }

    let result = window.__cellPatterns[cellType][truncRadius];

    return result
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
    cellType: number,
  ) {

    let canvasEl: HTMLCanvasElement= this.getCellPattern(cellType);
    let pattern: CanvasPattern|null = this.ctx.createPattern(canvasEl, "repeat");

    if (!pattern) {
      throw new Error("Unable to create canvas pattern obj.");
    }

    pattern.setTransform(
      new DOMMatrix().translate(
        this.opts.offsetX,
        this.opts.offsetY
      )
    );

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
    let nonItemElements = cell.elements.filter(e => e.type != ElementTypes.Item);
    let itemElements = cell.elements.filter(e => e.type == ElementTypes.Item);

    for (var element of nonItemElements) {
      let isSelected = this.selectedElement ? this.selectedElement.id == element.id : false;

      let elemPos = BoardUtils.getElementPosition(element, origin, this.opts.radius);

      let elemColor = colorForTeam(element.team);
      let elemSvg = this.getSvgForElement(element);

      if (element.type == ElementTypes.Building) {
        drawSvgToCanvas(elemSvg, this.ctx,
          elemPos.x, elemPos.y,
          buildingSize, buildingSize,
          elemColor
        );
      }
      if (element.type == ElementTypes.Person) {
        this.drawPersonElement(element, elemPos, elemSvg, elemColor, isSelected);
      }
    }

    if (itemElements.length > 0) {
      this.drawItemElements(itemElements, origin);
    }
  }

  drawPersonUI(
    element: Element,
    elemPos: Coordinate,
    isSelected: boolean
  ) {
    let { objectSize } = this.elemSizes;

    this.ctx.save();

    let itemElementTypeCount = element.heldElements.filter((e: Element) => ELEMENTS_YOU_SEE_IN_PERSON_UI.includes(e.subType)).length;

    let itemRows;
    if (itemElementTypeCount == 0) {
      itemRows = 0
    } else if (itemElementTypeCount < 4) { // Extra row for padding
      itemRows = 2;
    } else {
      itemRows = 3;
    }

    let uiCols = 6;
    let uiRows = 2 + itemRows;

    let tileWidth = objectSize * 0.2;

    let topLeftX = elemPos.x - (objectSize * 0.3);
    let topLeftY = elemPos.y - (tileWidth * (uiRows + 2)) - objectSize * 0.2;


    // background rect
    this.ctx.fillStyle = "#252525";
    this.ctx.fillRect(
      topLeftX, topLeftY,
      tileWidth * (uiCols + 2), tileWidth * (uiRows + 2)
    )
    this.ctx.strokeStyle = "#e1e1e1";
    this.ctx.lineWidth = objectSize * 0.03;
    this.ctx.strokeRect(
      topLeftX, topLeftY,
      tileWidth * (uiCols + 2), tileWidth * (uiRows + 2)
    )

    //? Setup font color and style for ui
    this.ctx.fillStyle = "white";
    this.ctx.font = `${tileWidth}px sans-serif`;

    let paddedTopLeftX = topLeftX + (tileWidth / 2);
    let paddedTopLeftY = topLeftY + (tileWidth / 2);

    //! Name
    let elStr = element.name ? element.name : "";
    this.ctx.fillText(elStr, paddedTopLeftX, paddedTopLeftY + (tileWidth*0.8));

    //! Health
    drawSvgToCanvas(
      getHealthIcon(element.health), this.ctx,
      paddedTopLeftX + (uiCols * tileWidth), paddedTopLeftY,
      tileWidth, tileWidth
    )
    let healthString = element.health ? element.health.toString() : "";
    this.ctx.fillText(
      healthString, paddedTopLeftX + (uiCols * tileWidth) - (tileWidth * 0.8), paddedTopLeftY + (tileWidth*0.8),
    );

    //! Damage
    let totalDamageAmount = BoardUtils.getPersonDamageAmount(element);
    drawSvgToCanvas(
      attackIconRaw, this.ctx,
      paddedTopLeftX + (tileWidth * 0.7), paddedTopLeftY + tileWidth * 1.6,
      tileWidth * 0.5, tileWidth
    )
    this.ctx.fillText(
      totalDamageAmount.toString(),
      paddedTopLeftX, paddedTopLeftY + tileWidth * 2.4,
    );

    //! Armor
    let totalArmorAmount = BoardUtils.getPersonTotalArmorAmount(element, this.cells, false);
    drawSvgToCanvas(
      defenceIconRaw, this.ctx,
      paddedTopLeftX + (tileWidth * 2.8), paddedTopLeftY + tileWidth * 1.5,
      tileWidth * 0.5, tileWidth
    )
    this.ctx.fillText(
      totalArmorAmount.toString(), 
      paddedTopLeftX + (tileWidth * 2), paddedTopLeftY + tileWidth * 2.4,
    );

    let actionAvailableSvg;

    if (element.hasActionAvailable) {
      actionAvailableSvg = yesSvgRaw;
    } else {
      actionAvailableSvg = noSvgRaw;
    }

    drawSvgToCanvas(actionAvailableSvg, this.ctx,
      paddedTopLeftX + (uiCols * tileWidth), paddedTopLeftY + tileWidth * 1.5,
      tileWidth, tileWidth,
    );


    this.drawPersonHeldMaterials(element, {x: paddedTopLeftX, y: paddedTopLeftY + tileWidth * 3.5}, tileWidth);

    if (element.isWorking || element.isScavenging) {
      drawSvgToCanvas(
        workIconRaw, this.ctx,
        paddedTopLeftX + (tileWidth * 4.6), paddedTopLeftY + tileWidth * 1.5,
        tileWidth, tileWidth
      )
    }

    //? Selected Yellow Box
    if (isSelected) {
      this.drawHighlightBox(elemPos, objectSize, "yellow");
    }

    this.ctx.restore();
  }

  drawPersonHeldMaterials(
    element: Element,
    topLeft: Coordinate,
    tileWidth: number
  ) {
    let materials = element.heldElements.filter((el: Element) => !USABLE_ITEMS.includes(el.subType));

    let currentY = topLeft.y;

    for (let i=0; i < materials.length; i++) {
      let heldElement = materials[i];
      let heldElemSvg = this.getSvgForElement(heldElement);

      let matX;

      if (i == 0 || i == 3) {
        matX = topLeft.x;
      } else if (i == 1 || i == 4) {
        matX = topLeft.x + tileWidth * 2.55;
      } else {
        matX = topLeft.x + tileWidth * 5.1;
      }

      let countStr = heldElement.count ? heldElement.count.toString() : "";
      this.ctx.fillText(countStr, matX, currentY + (tileWidth * 0.85));

      // Duped Code
      let itemWidth = tileWidth;
      let itemHeight = tileWidth;
      let offsetX = 0;
      let offsetY = 0;

      if (THIN_RENDERED_ELEMENTS.includes(heldElement.subType)) {
        itemWidth = tileWidth * 0.4;
        offsetX = tileWidth * 0.3;
      } else if (SHORT_RENDERED_ELEMENTS.includes(heldElement.subType)) {
        itemHeight = tileWidth * 0.64;
        offsetY = tileWidth * 0.18;
      }

      drawSvgToCanvas(heldElemSvg, this.ctx,
        matX + tileWidth * 0.8 + offsetX, currentY + offsetY,
        itemWidth, itemHeight,
      );

      if (i == 2) {
        currentY += tileWidth * 1.25;
      }
    }
  }

  drawPersonElement(
    element: Element,
    elemPos: Coordinate,
    elemSvg: any,
    elemColor: string,
    isSelected: boolean
  ) {
    let { objectSize } = this.elemSizes;

    drawSvgToCanvas(elemSvg, this.ctx,
      elemPos.x, elemPos.y,
      objectSize, objectSize,
      elemColor
    );

    // Traders are persons
    if (element.subType != ElementSubTypes.Villager) return;

    this.drawPlayerObjects(element, elemPos);
    this.drawPersonUI(element, elemPos, isSelected);
  }

  getPlayerObjectPositionAndSizes(
    elemPos: Coordinate,
    subType: number
  ): any {

    let { objectSize, toolSize } = this.elemSizes;

    let width, height, x, y;

    switch (subType) {
      case ElementSubTypes.Sword:
      case ElementSubTypes.Mace:
      case ElementSubTypes.Spear:
      case ElementSubTypes.Bow:
        width = toolSize;
        height = objectSize;
        x = elemPos.x + objectSize*1.1;
        y = elemPos.y;
        break;
      case ElementSubTypes.Shield:
        width = toolSize;
        height = objectSize * 0.8;
        x = elemPos.x - objectSize*0.25;
        y = elemPos.y + objectSize*0.25;
        break;
      case ElementSubTypes.Cart:
        width = objectSize*0.8;
        height = objectSize*0.8;
        x = elemPos.x-objectSize*0.4;
        y = elemPos.y+objectSize*0.5;
        break;
      case ElementSubTypes.LeatherArmor:
      case ElementSubTypes.IronArmor:
        width = objectSize*1.24;
        height = objectSize*0.35;
        x = elemPos.x - objectSize*0.12;
        y = elemPos.y + objectSize*0.65;
        break;
      case ElementSubTypes.Horse:
        width = objectSize*1.5;
        height = objectSize;
        x = elemPos.x - objectSize*0.15;
        y = elemPos.y + objectSize*0.65;
        break;
    }

    return {
      width: width,
      height: height,
      x: x,
      y: y
    }
  }

  drawObjectUI(
    elemPos: Coordinate,
    object: Element,
  ) {
    let { objectSize, toolSize } = this.elemSizes;

    if (object.subType == ElementSubTypes.Horse) {
      if (object.hasActionAvailable === false) {
        drawSvgToCanvas(noSvgRaw, this.ctx,
          elemPos.x + objectSize*0.25, elemPos.y+objectSize,
          objectSize*0.5, objectSize*0.5,
        );
      }
    }

    if (object.subType == ElementSubTypes.Sword) {
      if (object.hasActionAvailable === false) {
        this.ctx.save();
        this.ctx.strokeStyle = "#5864e9";
        let lineWidth = objectSize/12;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(
          elemPos.x + objectSize*1.1, elemPos.y, 
          toolSize, objectSize
        );
        this.ctx.restore();
      }
    }
  }

  drawPlayerObject(
    object: Element,
    elemPos: Coordinate,
  ) {
    let {width, height, x, y} = this.getPlayerObjectPositionAndSizes(elemPos, object.subType);

    let svg = getSvgForSubType(object.subType, true);
    drawSvgToCanvas(
      svg, this.ctx,
      x, y, width, height
    )

    this.drawObjectUI(elemPos, object);
  }

  drawPlayerObjects(
    element: Element,
    elemPos: Coordinate,
  ) {
    let usableItems = element.heldElements.filter((el: Element) => USABLE_ITEMS.includes(el.subType));

    for (var item of usableItems) {
      this.drawPlayerObject(item, elemPos);
    }
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
          elemPos.y -= itemSize*1.1;
        } else {
          elemPos.y += itemSize*1.1;
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

      let itemWidth = itemSize;
      let itemHeight = itemSize;
      let offsetX = 0;
      let offsetY = 0;

      if (THIN_RENDERED_ELEMENTS.includes(element.subType)) {
        itemWidth = itemSize * 0.4;
        offsetX = itemSize * 0.3;
      } else if (SHORT_RENDERED_ELEMENTS.includes(element.subType)) {
        itemHeight = itemSize * 0.64;
        offsetY = itemSize * 0.18;
      }

      drawSvgToCanvas(elemSvg, 
        this.ctx,
        elemPos.x + offsetX, elemPos.y + offsetY,
        itemWidth, itemHeight
      );

      this.ctx.fillStyle = "white";
      this.ctx.font = `${itemSize}px serif`;
      let countStr = element.count ? element.count.toString() : "";
      let digits = countStr.length;

      this.ctx.fillText(countStr, elemPos.x + 0.25*itemSize-(0.25*(digits-1)*itemSize), elemPos.y + itemSize*1.85)
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
