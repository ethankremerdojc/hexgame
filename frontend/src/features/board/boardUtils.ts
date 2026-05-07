import type {
  Cell, Element, Coordinate, TeamColor
} from "@/features/game/gameTypes"

import {
  HexPosition, 
} from "@/features/board/boardTypes"

import {
  ElementType, 
  ElementSubType, 
  CellType, 
  // MATERIAL_ELEMENT_SUBTYPES,
  // getHandsRequiredToHold,
  // ITEMS_YOU_CAN_HOLD_ONE_OF,
  // WEAPON_SUBTYPES,
  // objectToElement
} from "@/features/game/gameTypes"

import {
  PERSON_BASE_HEALTH,
  PERSON_MAX_CARRY_WEIGHT,
  CART_CARRY_WEIGHT_INCREASE,
  getBuildingCost,
  nameForElementSubType,
  getTradeCostForSubType,
  COMMON_SCAVENGABLE_ITEMS,
  RARE_SCAVENGABLE_ITEMS,
  SCAVENGE_CHANCES
} from "./vars"



export default class BoardUtils {

  // #CHATGPT-SPECIAL
  static getPseudoRandomFromPersonAndRoundNumber(elementId: string, roundNumber: number): number {
    // use personElem id + round number, convert to float between 0 and 1
    const str = `${elementId}:${roundNumber}`;

    let hash = 1779033703;

    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }

    // Final avalanche mix
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    hash ^= hash >>> 16;

    return (hash >>> 0) / 4294967296;
  }

  static getScavengedItem(personElem: Element, roundNumber: number): Element {
    let randomNum = BoardUtils.getPseudoRandomFromPersonAndRoundNumber(personElem.id, roundNumber);
    let options: ElementSubType[];

    if (randomNum < SCAVENGE_CHANCES.MATERIAL) {
      options = MATERIAL_ELEMENT_SUBTYPES;
    } else if (randomNum < SCAVENGE_CHANCES.COMMON + SCAVENGE_CHANCES.MATERIAL) {
      options = COMMON_SCAVENGABLE_ITEMS;
    } else {
      options = RARE_SCAVENGABLE_ITEMS;
    }

    let randomNum2 = BoardUtils.getPseudoRandomFromPersonAndRoundNumber(personElem.id + "item", roundNumber);
    let index = Math.floor(randomNum2 * options.length);
    let result = objectToElement({type: ElementType.Item, subType: options[index]});
    return result
  }

  static getElemSizes(radius: number): any {
    let halfRadius = radius/2;
    let buildingSize = radius*0.4;
    let objectSize = buildingSize * 0.65;
    let toolSize = objectSize / 3;
    let itemSize = objectSize / 2.5;

    return {
      halfRadius: halfRadius,
      buildingSize: buildingSize,
      objectSize: objectSize,
      toolSize: toolSize,
      itemSize: itemSize
    }
  }

  static getSizeForElement(elem: Element, radius: number): number {
    let { buildingSize, objectSize, toolSize } = BoardUtils.getElemSizes(radius);
    if (elem.type == ElementType.Person) {
      return objectSize
    }
    if (elem.type == ElementType.Item) {
      return toolSize
    }
    if (elem.type == ElementType.Building) {
      return buildingSize
    }

    throw new Error(`Unknown element type: ${elem.type}`);
  }

  static getElementPosition(element: Element, origin: Coordinate, radius: number): Coordinate {
    let objectSize = BoardUtils.getSizeForElement(element, radius);
    let halfObjectSize = objectSize / 2;
    let halfRadius = radius / 2;


    if (element.type == ElementType.Item) {
      return {x: -1, y: origin.y + radius*0.5};
    }

    let elemPos;

    switch (element.position) {
      case HexPosition.Top:
        elemPos = {x: origin.x - halfObjectSize, y: origin.y - radius*0.75};
        break;
      case HexPosition.TopLeft:
        elemPos = {x: origin.x - halfObjectSize - halfRadius*0.8, y: origin.y - radius*0.5};
        break;
      case HexPosition.TopRight:
        elemPos = {x: origin.x - halfObjectSize + halfRadius*0.8, y: origin.y - radius*0.5};
        break;

      // case HexPosition.Bottom:
      //   break;
      case HexPosition.BottomLeft:
        elemPos = {x: origin.x - halfObjectSize - halfRadius*1.1, y: origin.y - halfRadius*0.25};
        break;
      case HexPosition.BottomRight:
        elemPos = {x: origin.x - halfObjectSize + halfRadius*1.1, y: origin.y - halfRadius*0.25};
        break;

      case HexPosition.Center:
        elemPos = {x: origin.x - halfObjectSize, y: origin.y - halfObjectSize};
        break;
      default:

        if (element.position === undefined || element.position === null) {
          throw new Error(`No element.position found for element ${element}`);
        }

        throw new Error(`Unknown Hex position: ${element.position}`);
        break;
    }

    // if (element.type == ElementType.Person) {
    //   let toolSize = objectSize / 3;
    //   elemPos.x -= toolSize;
    // }

    return elemPos;
  }

  static gridMeasurements(radius: number): any {
    const diameter = radius*2;
    const edgeLength = Math.sin(Math.PI / 6) * diameter,
          gridSpaceX = diameter - edgeLength / 2,
          gridSpaceY = Math.cos(Math.PI / 6) * diameter,
          gridOffsetY = gridSpaceY / 2;

    return {
      diameter,
      edgeLength,
      gridSpaceX,
      gridSpaceY,
      gridOffsetY
    };
  }

  static pointInTriangle(P: Coordinate, A: Coordinate, B: Coordinate, C: Coordinate): boolean {
    function sign(p: Coordinate, a: Coordinate, b: Coordinate) {
      return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
    }

    const d1 = sign(P, A, B);
    const d2 = sign(P, B, C);
    const d3 = sign(P, C, A);

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNeg && hasPos);
  }

  static pointInRectangle(point: Coordinate, topLeft: Coordinate, bottomRight: Coordinate): boolean {
    let top = topLeft.y;
    let bottom = bottomRight.y;
    let left = topLeft.x;
    let right = bottomRight.x;

    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
  }

  static toPolarCoordinate(centerX: number, centerY: number, radius: number, angle: number): any {
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  static getBoundingBoxCornerTriangles(radius: number, origin: Coordinate): any[] {
    const m = BoardUtils.gridMeasurements(radius);

    let halfSideLength = m.edgeLength / 2;
    let halfHexHeight = (Math.sqrt(3) / 2) * radius;
    let quarterHexHeight = halfHexHeight / 2;
    let cornerWidth = (radius - halfSideLength) / 2;

    // point stuff

    let innerXLeft = origin.x - halfSideLength;
    let outerXLeft = innerXLeft - cornerWidth;
    let innerXRight = origin.x + halfSideLength;
    let outerXRight = innerXRight + cornerWidth;

    let topY = origin.y - halfHexHeight;
    let innerTopY = origin.y - quarterHexHeight;
    let bottomY = origin.y + halfHexHeight;
    let innerBottomY = origin.y + quarterHexHeight;

    const makeTriangle = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, name: string): any => {
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

  static pixelToGrid(px: number, py: number, radius: number, offsetX: number, offsetY: number): Coordinate {
    const m = BoardUtils.gridMeasurements(radius);

    let newX = Math.round((px - offsetX) / m.gridSpaceX);
    let newY = Math.round((py - offsetY - (newX % 2 ? m.gridOffsetY : 0)) / m.gridSpaceY); // determine if we should do the mod here or later
    
    // Get the origin for whatever the system thinks we are on
    let initialOrigin = BoardUtils.gridToPixelOrigin(newX, newY, radius, offsetX, offsetY);

    let boundingBoxTriangles = BoardUtils.getBoundingBoxCornerTriangles(radius, initialOrigin);
    let boundingBoxCornerClicked = null;

    for (var triangle of boundingBoxTriangles) {
      if (BoardUtils.pointInTriangle({x: px, y: py}, triangle.points[0], triangle.points[1], triangle.points[2])) {
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

  static gridToPixelOrigin(gridX: number, gridY: number, radius: number, offsetX: number, offsetY: number) {
    function toPoint(x: number, y: number): any { return ({ x, y }) }

    const m = BoardUtils.gridMeasurements(radius);

    return toPoint(
      Math.floor(gridX * m.gridSpaceX) + offsetX,
      Math.floor(gridY * m.gridSpaceY + (gridX % 2 ? m.gridOffsetY : 0) + offsetY)
    );
  }

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

  static getElementParentCell(elem: Element, cells: Cell[]): Cell {

    for (var cell of cells) {
      if (cell.elements) {
        for (var el of cell.elements) {
          if (el.id == elem.id) {
            return cell
          }
        }
      }
    }
    throw new Error("unable to find element parent.")
  }

  static getBoardWidthAndHeight(canvasWidth: number, canvasHeight: number, radius: number) {
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

  static getInitialRadius(canvasWidth: number, cells: Cell[]) {
    // inverse of above func
    let boardWidth = 0;
    for (var cell of cells) {
      if (cell.x > boardWidth) {
        boardWidth = cell.x;
      }
    }

    return canvasWidth / (1.5*boardWidth + 2);
  }

  static getPersonCarryingWeight(elem: Element): number {
    let result = 0;
    elem.heldElements.forEach(he => {
      let itemWeight;
      if (he.weight) {
        itemWeight = he.weight;
      } else {
        itemWeight = 1;
      }
      let heldElementCount = he.count ? he.count : 1;
      result += itemWeight * heldElementCount;
    })
    return result
  }

  static getCarryingCapacity(personElem: Element): number {
    let holdingCart = personElem.heldElements.filter(el => el.subType == ElementSubType.Cart).length > 0;
    if (!holdingCart) {
      return PERSON_MAX_CARRY_WEIGHT;
    }
    return PERSON_MAX_CARRY_WEIGHT + CART_CARRY_WEIGHT_INCREASE;
  }
  
  static getCellsPersonCanMoveTo(personElem: Element, cells: Cell[]): Cell[] {
    let parentCell = BoardUtils.getElementParentCell(personElem, cells);
    let adjacentCells = BoardUtils.getAdjacentCells(cells, parentCell);

    let result = [];

    for (var cell of adjacentCells) {
      if (cell.elements.filter(e => e.type == ElementType.Person).length > 4) {
        continue
      }
      if (cell.elements.filter(e => e.type == ElementType.Person && e.team == personElem.team).length > 2) {
        continue
      }
      result.push(cell);
    }

    return result
  }

  static getPersonRemainingCarryWeight(elem: Element): number {
    let result = BoardUtils.getCarryingCapacity(elem) - BoardUtils.getPersonCarryingWeight(elem);
    return result
  }

  static getEnemyPersons(personElem: Element, parentCell: Cell): Element[] {
    let result: Element[] = [];
    parentCell.elements.forEach(elem => {
      if (elem.subType == ElementSubType.Villager && elem.team != personElem.team) {
        result.push(elem);
      }
    })
    return result;
  }

  static enemyExistsOnCell(personElem: Element, cell: Cell): boolean {
    return BoardUtils.getEnemyPersons(personElem, cell).length > 0
  }

  static resourcesExistForPerson(resourcesRequired: any[], personElem: Element, cells: Cell[]): boolean {
    let parentCell = BoardUtils.getElementParentCell(personElem, cells);
    let mergedItemElements = BoardUtils.mergeItemElements(parentCell.elements.filter(e => e.type == ElementType.Item));

    for (var resourceRequired of resourcesRequired) {
      let relevantItemElement = mergedItemElements.filter(e => e.subType == resourceRequired.subType)[0];

      let tileCount; 
      let playerCount;

      if (!relevantItemElement) {
        tileCount = 0;
      } else {
        tileCount = relevantItemElement.count ? relevantItemElement.count : 1;
      }

      let relevantHeldElement = personElem.heldElements.filter(e => e.subType == resourceRequired.subType)[0];

      if (!relevantHeldElement) {
        playerCount = 0;
      } else {
        playerCount = relevantHeldElement.count ? relevantHeldElement.count : 1;
      }

      if (tileCount + playerCount < resourceRequired.count) {
        return false
      }
    }

    return true
  }

  static elementsToBuildExistOnTile(elementSubType: ElementSubType, personElem: Element, cells: Cell[]): boolean { 
    let requiredElements = getBuildingCost(elementSubType);
    return BoardUtils.resourcesExistForPerson(requiredElements, personElem, cells)
  }

  static buildingTypeForCellType(cellType: CellType): ElementSubType|null {
    if (cellType == CellType.Field) {
      return ElementSubType.Farm
    }
    if (cellType == CellType.Forest) {
      return ElementSubType.SawMill
    }
    if (cellType == CellType.Mountain) {
      return ElementSubType.Quarry
    }
    if (cellType == CellType.ClayField) {
      return ElementSubType.BrickFactory
    }

    return null
  }

  static getAvailableThingsToBuild(cell: Cell): any[] {
    let result = [];

    let buildingExists = cell.elements.filter(el => el.type == ElementType.Building).length != 0;
    let forgeExists = cell.elements.filter(el => el.subType == ElementSubType.Forge).length != 0;

    if (!buildingExists) {
      if (cell.type != CellType.Desert) {
        result.push([ElementType.Building, BoardUtils.buildingTypeForCellType(cell.type)]);
      }
      result.push([ElementType.Building, ElementSubType.Village]);
      result.push([ElementType.Building, ElementSubType.Forge]);
    }

    result.push([ElementType.Item, ElementSubType.Bow]);

    result.push([ElementType.Item, ElementSubType.Cart]);
    result.push([ElementType.Item, ElementSubType.LeatherArmor]);
    result.push([ElementType.Item, ElementSubType.Spear]);

    if (forgeExists) {
      result.push([ElementType.Item, ElementSubType.Sword]);
      result.push([ElementType.Item, ElementSubType.Shield]);
      result.push([ElementType.Item, ElementSubType.Mace]);
      result.push([ElementType.Item, ElementSubType.IronArmor]);
    }

    return result
  }

  static buildingCostToString(buildingCost: any[]): string {
    let result = "(";

    for (var ingredient of buildingCost) {
      let ingredientCount = ingredient.count ? ingredient.count : 1;
      result += `${nameForElementSubType(ingredient.subType)}: ${ingredientCount}, `;
    }

    return result.slice(0, -2) + ")"; // remove last two chars: ', '
  }

  static depleteResources(resources: any[], _personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let parentCell = BoardUtils.getElementParentCell(_personElem, newCells);
    let newCell;

    for (var c of newCells) {
      if (c.x == parentCell.x && c.y == parentCell.y) {
        newCell = c;
      }
    };

    if (!newCell) {
      throw new Error(`Unable to find cell in clone`)
    }

    let personElem = newCell.elements.filter(el => el.id == _personElem.id)[0];
 
    // Deplete from tile
    let oldNonItemElements = newCell.elements.filter(el => el.type != ElementType.Item);

    let mergedItemElements = BoardUtils.mergeItemElements(newCell.elements.filter(e => e.type == ElementType.Item));

    let requirementsAfterTile = [];

    for (var resourceRequired of resources) {

      let relevantItemElement = mergedItemElements.filter(e => e.subType == resourceRequired.subType)[0];

      if (!relevantItemElement) {
        requirementsAfterTile.push({...resourceRequired});
        continue
      }

      let rrc: number = resourceRequired.count ? resourceRequired.count : 1; 
      let ric: number = relevantItemElement.count ? relevantItemElement.count : 1;

      if (ric > rrc) {
        relevantItemElement.count = ric - rrc;
      }
      else if (ric == rrc) {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
      }
      else {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
        let copiedRequirement = {...resourceRequired};

        copiedRequirement.count = rrc - ric;
        requirementsAfterTile.push(copiedRequirement);
      }
    };

    newCell.elements = [...oldNonItemElements, ...mergedItemElements];

    // Adjust personElem held elements
    for (var requiredElement of requirementsAfterTile) {
      let relevantItemElement = personElem.heldElements.filter(e => e.subType == requiredElement.subType)[0];


      if (!relevantItemElement) {
        throw new Error(`Expected an item on the person element for building that wasn't there.`);
      }

      let rec = requiredElement.count ? requiredElement.count : 1;
      let ric = relevantItemElement.count ? relevantItemElement.count : 1;

      if (rec > ric) {
        throw new Error(`Expected an item with higher count on the person element for building that wasn't there.`);
      }
      else if (rec == ric) {
        personElem.heldElements = personElem.heldElements.filter(el => el.id != relevantItemElement.id);
      }
      else {
        relevantItemElement.count = ric - rec;
      }
    }

    return newCells;
  }

  static mergeItemElements(itemElements: Element[]): Element[] {
    let result = [];

    let previousSubTypes: ElementSubType[] = [];
    let cloned = [...itemElements];

    for (var ie of cloned) {
      if (previousSubTypes.includes(ie.subType)) { continue }
      if (ie.subType == ElementSubType.Horse) {
        let copied = {...ie};
        result.push(copied);
        continue
      }
      previousSubTypes.push(ie.subType);

      let matchingElems = cloned.filter(re => re.subType == ie.subType);
      let copied = {...ie};

      for (var me of matchingElems) {
        if (me.id != ie.id) {
          let cc: number = copied.count ? copied.count : 1; 
          let mc: number = me.count ? me.count : 1;

          copied.count = cc + mc;
        }
      }
      result.push(copied);
    }

    return result
  }

  static getTeamPersonCapacity(teamColor: TeamColor, cells: Cell[]): number {
    let capacity = 0;

    for (var cell of cells) {
      let capitalExists = cell.elements.filter(e => e.subType == ElementSubType.Capital && e.team == teamColor).length > 0;
      let villageExists = cell.elements.filter(e => e.subType == ElementSubType.Village && e.team == teamColor).length > 0;

      if (capitalExists) {
        capacity += 3;
      } else if (villageExists) {
        capacity += 2;
      }
    }

    return capacity
  }

  static getCurrentTeamPersons(teamColor: TeamColor, cells: Cell[]): number {
    let persons = 0;

    for (var cell of cells) {
      persons += cell.elements.filter(el => el.type == ElementType.Person && el.team == teamColor).length;
    }

    return persons
  }

  static personCanReproduce(personElem: Element, cells: Cell[]): boolean {

    if (!personElem.team) {
      throw new Error(`person has no team.`)
    }

    const elementParent = BoardUtils.getElementParentCell(personElem, cells);
    let capitalExists = elementParent.elements.filter(e => e.subType == ElementSubType.Capital).length > 0;
    let villageExists = elementParent.elements.filter(e => e.subType == ElementSubType.Village).length > 0;

    if (!capitalExists && !villageExists) {
      return false
    }

    let ownTeamPersonsOnTile = elementParent.elements.filter(el => el.type == ElementType.Person && el.team == personElem.team);
    if (ownTeamPersonsOnTile.length > 2) {
      return false
    }

    let villagerCost = getBuildingCost(ElementSubType.Villager);
    if (!BoardUtils.resourcesExistForPerson(villagerCost, personElem, cells)) {
      return false
    }

    let villagerCapacity = BoardUtils.getTeamPersonCapacity(personElem.team, cells);
    let currentTeamPersons = BoardUtils.getCurrentTeamPersons(personElem.team, cells);

    return villagerCapacity > currentTeamPersons;
  }

  static personCanHeal(personElem: Element, cells: Cell[]): boolean {
    if (personElem.health >= PERSON_BASE_HEALTH) return false;

    let resourcesForHealing = [{subType: ElementSubType.Food, count: 1}];
    let resourcesExist = BoardUtils.resourcesExistForPerson(resourcesForHealing, personElem, cells);
    if (!resourcesExist) return false;

    const elementParent = BoardUtils.getElementParentCell(personElem, cells);
    if (BoardUtils.enemyExistsOnCell(personElem, elementParent)) return false;
    return true
  }

  static personCanHoldItem(personElem: Element, elementSubType: ElementSubType): boolean {

    if (ITEMS_YOU_CAN_HOLD_ONE_OF.includes(elementSubType)) {
      if (personElem.heldElements.filter((el: Element) => el.subType == elementSubType).length > 0) {
        return false
      }
    }

    let armors = [ElementSubType.IronArmor, ElementSubType.LeatherArmor];
    let currentArmors = personElem.heldElements.filter((el: Element) => armors.includes(el.subType));
    if (currentArmors.length > 0 && armors.includes(elementSubType)) {
      return false
    }

    // can't hold 2 weapons
    if (WEAPON_SUBTYPES.includes(elementSubType)) {
      for (var item of personElem.heldElements) {
        if (WEAPON_SUBTYPES.includes(item.subType)) {
          return false
        }
      }
    }

    if (BoardUtils.getPersonRemainingCarryWeight(personElem) < 1) {
      return false
    };

    let subTypesToCheck: ElementSubType[] = [
      ElementSubType.Cart,
      ElementSubType.Sword,
      ElementSubType.Bow,
      ElementSubType.Shield,
      ElementSubType.Cow,
      ElementSubType.Horse,
      ElementSubType.Mace,
      ElementSubType.Spear,
    ]

    let currentCapacity = 0;

    for (var subType of subTypesToCheck) {
      let holdingItemCount = personElem.heldElements.filter((el: Element) => el.subType == subType).length;

      if (holdingItemCount > 0) {
        currentCapacity += getHandsRequiredToHold(subType) * holdingItemCount;
      }
    };

    let handsRequired = getHandsRequiredToHold(elementSubType);

    return currentCapacity + handsRequired <= 2
  }

  static personCanTakeAnyItem(personElem: Element, cells: Cell[]): boolean {
    return BoardUtils.getItemsPersonCanTake(personElem, cells).length > 0;
  }

  static getItemsPersonCanTake(personElem: Element, cells: Cell[]): Element[] {
    const parentElem = BoardUtils.getElementParentCell(personElem, cells);
    let items = parentElem.elements.filter(el => el.type == ElementType.Item);

    let result = [];

    for (var item of items) {
      if (BoardUtils.personCanHoldItem(personElem, item.subType)) {
        result.push(item);
      }
    }

    return result
  }

  static personCanTrade(personElem: Element, cells: Cell[]): boolean {
    const parentElem = BoardUtils.getElementParentCell(personElem, cells);
    let traderExists = parentElem.elements.filter(el => el.subType == ElementSubType.Trader).length > 0;

    if (!traderExists) {
      return false
    }

    if (parentElem.elements.filter(el => el.type == ElementType.Item).length > 0) {
      return true
    }
    if (personElem.heldElements.filter(el => el.type == ElementType.Item).length > 0) {
      return true
    }
    return false
  }

  static itemsForTradeExistOnTile(elem: Element, requiredCount: number, cells: Cell[]): boolean {
    for (var ces of MATERIAL_ELEMENT_SUBTYPES) {
      let resource = {subType: ces, count: requiredCount};
      if (BoardUtils.resourcesExistForPerson([resource], elem, cells)) {
        return true
      }
    }
    return false
  }

  static getTradeOfferings(elem: Element, cells: Cell[]): object[] {

    let itemsToTradeExistForMaterial = BoardUtils.itemsForTradeExistOnTile(elem, 2, cells);

    let offerings: object[] = [];

    for (var ces of MATERIAL_ELEMENT_SUBTYPES) {
      offerings.push({type: ElementType.Item, subType: ces, count: 1, disabled: !itemsToTradeExistForMaterial})
    }

    let itemsToTradeExistForHorse = BoardUtils.itemsForTradeExistOnTile(elem, getTradeCostForSubType(ElementSubType.Horse), cells);
    offerings.push({ type: ElementType.Item, subType: ElementSubType.Horse, count: 1, disabled: !itemsToTradeExistForHorse });

    let itemsToTradeExistForCow = BoardUtils.itemsForTradeExistOnTile(elem, getTradeCostForSubType(ElementSubType.Cow), cells);
    offerings.push({ type: ElementType.Item, subType: ElementSubType.Cow, count: 1, disabled: !itemsToTradeExistForCow });

    return offerings
  }

  static getItemTypesPersonCanGive(personElem: Element|null, cells: Cell[], requiredCount: number): ElementSubType[] {
    if (!personElem) {
      throw new Error("No personElem supplied to 'getItemsPersonCanGive'");
    }

    let result = [];

    for (var ces of MATERIAL_ELEMENT_SUBTYPES) {
      let resource = {subType: ces, count: requiredCount};
      if (BoardUtils.resourcesExistForPerson([resource], personElem, cells)) {
        result.push(ces);
      }
    };

    return result
  }

  static elWithHighestCount(personElem: Element|null): Element {
    if (personElem == null) {
      throw new Error("Can't get count without person")
    }
    let highest: Element|null = null;
    
    for (var el of personElem.heldElements) {
      if (highest === null) {
        highest = el;
        continue
      }
      if (highest.count < el.count) {
        highest = el;
      }
    }

    if (!highest) {
      throw new Error(`couldnt find element`)
    }

    return highest
  }

  static personCanShoot(personElem: Element, cells: Cell[]): boolean {
    let hasBow = personElem.heldElements.filter(el => el.subType == ElementSubType.Bow).length > 0;
    if (!hasBow) {
      return false
    }

    return BoardUtils.getPersonsThatCanBeShot(personElem, cells).length > 0
  }

  static getPersonsThatCanBeShot(personElem: Element, cells: Cell[]): Element[] {
    let parentElem = BoardUtils.getElementParentCell(personElem, cells);
    let adjacentCells = BoardUtils.getAdjacentCells(cells, parentElem);

    let result: Element[] = [];

    for (var cell of adjacentCells) {
      if (BoardUtils.enemyExistsOnCell(personElem, cell)) {
        result = [...result, ...BoardUtils.getEnemyPersons(personElem, cell)];
      }
    }
    return result
  }

  static personCanDestroy(personElem: Element, cells: Cell[]): boolean {
    let parentElem = BoardUtils.getElementParentCell(personElem, cells);
    let buildingElements = parentElem.elements.filter(el => el.type == ElementType.Building);
    if (buildingElements.length < 1) { return false };
    let building = buildingElements[0];
    if (building.subType == ElementSubType.Capital && building.team == personElem.team) { return false };
    return true
  }
}
