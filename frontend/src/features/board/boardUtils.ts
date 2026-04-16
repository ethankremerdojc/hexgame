import type {
  Cell, Element, Coordinate
} from "./boardTypes"

import {
  HexPosition, ElementType, ElementSubType, ElementAction, CellType,
} from "./boardTypes"

import {
  PERSON_MAX_CARRY_WEIGHT,
  CART_CARRY_WEIGHT_INCREASE,
  PERSON_BASE_DAMAGE,
  SHIELD_ARMOR_INCREASE_AMOUNT,
  SWORD_DAMAGE_INCREASE_AMOUNT,
  PERSON_BASE_HEALTH,
  getBuildingCost,
  nameForElementSubType
} from "./vars"

export class BoardUtils {
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
          throw new Error(`No element.position found for element`);
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

  static parseElementId(id: string): any {
    const [coords, heldElementIndex, position, type, subType, count] = id.split('|');
    const [x, y] = coords.split(',').map(Number);

    return { x, y, heldElementIndex, position, type, subType, count };
  }

  static getElementParentCell(elem: Element, cells: Cell[]): Cell {
    let { x, y } = BoardUtils.parseElementId(elem.id);
    for (var cell of cells) {
      if (cell.x == x && cell.y == y) {
        return cell
      }
    }
    throw new Error("unable to find element parent.")
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
      result += itemWeight * he.count;
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
    let result = [];
    parentCell.elements.forEach(elem => {
      if (elem.type == ElementType.Person && elem.team != personElem.team) {
        result.push(elem);
      }
    })
    return result;
  }

  static enemyExistsOnCell(personElem: Element, parentCell: Cell): boolean {
    return BoardUtils.getEnemyPersons(personElem, parentCell).length > 0
  }

  static resourcesExistForPerson(resourcesRequired: object[], personElem: Element, cells: Cell[]): boolean {
    let parentCell = BoardUtils.getElementParentCell(personElem, cells);
    let mergedItemElements = BoardUtils.mergeItemElements(parentCell.elements.filter(e => e.type == ElementType.Item));

    let counts = {};
    for (var resourceRequired of resourcesRequired) {
      let relevantItemElement = mergedItemElements.filter(e => e.subType == resourceRequired.subType)[0];

      let tileCount; 
      let playerCount;

      if (!relevantItemElement) {
        tileCount = 0;
      } else {
        tileCount = relevantItemElement.count;
      }

      let relevantHeldElement = personElem.heldElements.filter(e => e.subType == resourceRequired.subType)[0];

      if (!relevantHeldElement) {
        playerCount = 0;
      } else {
        playerCount = relevantHeldElement.count;
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

    return null
  }

  static getAvailableThingsToBuild(cell: Cell): ElementSubType[] {
    let result = [];

    if (cell.elements.filter(el => el.type == ElementType.Building) == 0) {
      result.push([ElementType.Building, BoardUtils.buildingTypeForCellType(cell.type)]);
      result.push([ElementType.Building, ElementSubType.Village]);
    }
    result.push([ElementType.Item, ElementSubType.Sword]);
    result.push([ElementType.Item, ElementSubType.Shield]);
    result.push([ElementType.Item, ElementSubType.Cart]);

    return result
  }

  static buildingCostToString(buildingCost: object[]): string {
    let result = "(";

    for (var ingredient of buildingCost) {
      result += `${nameForElementSubType(ingredient.subType)}: ${ingredient.count}, `;
    }

    return result.slice(0, -2) + ")"; // remove last two chars: ', '
  }

  static depleteResources(resources: object[], _personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let parentCell = BoardUtils.getElementParentCell(_personElem, newCells);
    let newCell;

    for (var c of newCells) {
      if (c.x == parentCell.x && c.y == parentCell.y) {
        newCell = c;
      }
    };

    let personElem = newCell.elements.filter(el => el.id == _personElem.id)[0];
 
    // Deplete from tile
    let oldNonItemElements = newCell.elements.filter(el => el.type != ElementType.Item);

    let mergedItemElements = BoardUtils.mergeItemElements(newCell.elements.filter(e => e.type == ElementType.Item));

    let requirementsAfterTile = [];

    for (var resourceRequired of resources) {

      let relevantItemElement = mergedItemElements.filter(e => e.subType == resourceRequired.subType)[0];

      if (!relevantItemElement) {
        requirementsAfterTile.push({...resourceRequired});
      }
      else if (relevantItemElement.count > resourceRequired.count) {
        relevantItemElement.count -= resourceRequired.count;
      }
      else if (relevantItemElement.count == resourceRequired.count) {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
      }
      else {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
        let copiedRequirement = {...resourceRequired};
        copiedRequirement.count -= relevantItemElement.count;
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
      else if (requiredElement.count > relevantItemElement.count) {
        throw new Error(`Expected an item with higher count on the person element for building that wasn't there.`);
      }
      else if (requiredElement.count == relevantItemElement.count) {
        personElem.heldElements = personElem.heldElements.filter(el => el.id != relevantItemElement.id);
      }
      else {
        relevantItemElement.count -= requiredElement.count;
      }
    }

    return newCells;
  }

  static mergeItemElements(itemElements: Element[]): Element[] {
    let result = [];

    let previousSubTypes = [];
    let cloned = [...itemElements];

    for (var ie of cloned) {
      if (previousSubTypes.includes(ie.subType)) { continue }

      previousSubTypes.push(ie.subType);

      let matchingElems = cloned.filter(re => re.subType == ie.subType);
      let copied = {...ie};

      for (var me of matchingElems) {
        if (me.id != ie.id) {
          copied.count += me.count;
        }
      }
      result.push(copied);
    }
    
    return result
  }

  static getTeamPersonCapacity(teamColor: TeamColor, cells: Cell[]): boolean {
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

    let villagerCost = getBuildingCost(ElementSubType.Worker);
    if (!BoardUtils.resourcesExistForPerson(villagerCost, personElem, cells)) {
      return false
    }

    let villagerCapacity = BoardUtils.getTeamPersonCapacity(personElem.team, cells);
    let currentTeamPersons = BoardUtils.getCurrentTeamPersons(personElem.team, cells);

    return villagerCapacity > currentTeamPersons;
  }

  static personCanHoldItem(personElem: Element, elementSubType: ElementSubType): boolean {

    if (BoardUtils.getPersonRemainingCarryWeight(personElem) < 1) {
      return false
    }

    let holdingCart = personElem.heldElements.filter(el => el.subType == ElementSubType.Cart).length > 0;

    let holdingSword = personElem.heldElements.filter(el => el.subType == ElementSubType.Sword).length > 0;
    let holdingBow = personElem.heldElements.filter(el => el.subType == ElementSubType.Bow).length > 0;
    let holdingShield = personElem.heldElements.filter(el => el.subType == ElementSubType.Shield).length > 0;

    if (elementSubType == ElementSubType.Cart) {
      if (holdingSword || holdingBow || holdingShield || holdingCart) {
        return false
      }
    } else if (elementSubType == ElementSubType.Bow) {
      if (holdingSword || holdingShield || holdingCart || holdingBow) {
        return false
      }
    } else if (elementSubType == ElementSubType.Sword) {
      if (holdingCart || holdingBow || holdingSword) {
        return false
      }
    } else if (elementSubType == ElementSubType.Shield) {
      if (holdingCart || holdingBow || holdingShield) {
        return false
      }
    }

    return true
  }

  static personCanTakeAnyItem(personElem, cells: Cell[]): boolean {
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
}
