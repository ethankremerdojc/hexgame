import type {
  Cell, Element, Coordinate
} from "./boardSlice"

import {
  HexPosition, ElementType, ElementSubType, ElementAction, parseElementId,
  mergeItemElements,
  buildingTypeForCellType, getBuildingCost,
  PERSON_MAX_CARRY_WEIGHT,
  PERSON_BASE_DAMAGE
} from "./boardSlice"

export function pointInTriangle(P: Coordinate, A: Coordinate, B: Coordinate, C: Coordinate): boolean {
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

export function pointInRectangle(point: Coordinate, topLeft: Coordinate, bottomRight: Coordinate): boolean {
  let top = topLeft.y;
  let bottom = bottomRight.y;
  let left = topLeft.x;
  let right = bottomRight.x;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
}

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

  static toPoint(x: number, y: number): any { return ({ x, y }) }

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

  static gridToPixelOrigin(gridX: number, gridY: number, radius: number, offsetX: number, offsetY: number) {
    const m = BoardUtils.gridMeasurements(radius);

    return BoardUtils.toPoint(
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

  static moveElement(cells: Cell[], elem: Element, cellToMoveTo: Cell): Cell[] {
    let newCells = [];

    let elemParentCell = BoardUtils.getElementParentCell(elem, cells);

    for (var cell of cells) {
      let newCell = {...cell};

      if (cell.x == elemParentCell.x && cell.y == elemParentCell.y) {
        let newElements = [];

        for (var oldElem of cell.elements) {
          if (oldElem.id == elem.id) {
            continue
          }
          newElements.push(oldElem);
        }

        newCell.elements = newElements;
      }
      else if (cell.x == cellToMoveTo.x && cell.y == cellToMoveTo.y) {
        let newElements = [...cell.elements];
        let newElem = structuredClone(elem);

        //TODO Add this back

        newElem.hasActionAvailable = false;
        newElements.push(newElem);
        newCell.elements = newElements;
      }
      newCells.push(newCell);
    }

    return newCells
  }

  static dropItem(personElem: Element, droppedItemId: string, cells: Cell[], count: number): Cell[] {
    let _elemParentCell = BoardUtils.getElementParentCell(personElem, cells);

    let newCells = structuredClone(cells);
    let elemParentCell = null;
    let newPersonElem = null;

    for (var cell of newCells) {
      if (_elemParentCell.x == cell.x && _elemParentCell.y == cell.y) {
        elemParentCell = cell; 
      }
    }

    for (var elem of elemParentCell.elements) {
      if (elem.id == personElem.id) {
        newPersonElem = elem;
      }
    }

    // if count is max

    let elementToDrop = newPersonElem.heldElements.filter(e => e.id == droppedItemId)[0];

    // create new element on the tile, will be combined automatically in the slice
    let copiedDroppedElement = structuredClone(elementToDrop);
    copiedDroppedElement.count = count;
    elemParentCell.elements.push(copiedDroppedElement);
    elementToDrop.count -= count;

    if (elementToDrop.count < 1) {
      newPersonElem.heldElements = newPersonElem.heldElements.filter(e => e.id != elementToDrop.id);
    }
    return newCells
  }

  static takeItem(personElem: Element, takenItemId: string, cells: Cell[], count: number): Cell[] {
    let _elemParentCell = BoardUtils.getElementParentCell(personElem, cells);

    let newCells = structuredClone(cells);
    let elemParentCell = null;
    let newPersonElem = null;

    for (var cell of newCells) {
      if (_elemParentCell.x == cell.x && _elemParentCell.y == cell.y) {
        elemParentCell = cell; 
      }
    }

    for (var elem of elemParentCell.elements) {
      if (elem.id == personElem.id) {
        newPersonElem = elem;
      }
    }

    let elementToTake = elemParentCell.elements.filter(e => e.id == takenItemId)[0];

    if (count == elementToTake.count) {
      // just take actual item and move it
      newPersonElem.heldElements.push(elementToTake);
      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != takenItemId);
    } else {
      let copiedTakenElement = structuredClone(elementToTake);
      copiedTakenElement.count = count;
      newPersonElem.heldElements.push(copiedTakenElement);

      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != takenItemId);
      let newParentChild = structuredClone(elementToTake);
      newParentChild.count -= count;
      elemParentCell.elements.push(newParentChild);
    }

    return newCells
  }

  static getElementParentCell(elem: Element, cells: Cell[]): Cell {
    let { x, y } = parseElementId(elem.id);
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

  static getPersonRemainingCarryWeight(elem: Element): number {
    let result = PERSON_MAX_CARRY_WEIGHT - BoardUtils.getPersonCarryingWeight(elem);

    //TODO
    //Will want to remove below, but right now we can keep
    if (result < 0) {
      return 0
    }
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

  static build(personElem: Element, buildingType: ElementSubType, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);

    let existingBuildingElements = elemParentCell.elements.filter(elem => elem.type == ElementType.Building);

    if (buildingType != buildingTypeForCellType(elemParentCell.type)) {
      throw new Error("Wrong building type for cell.")
    }

    if (existingBuildingElements.length > 0) {
      throw new Error("Can't build where there is already a building.");
    }
    //personElem.hasActionAvailable = false;
    elemParentCell.elements.push({type: ElementType.Building, subType: buildingType});

    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;

    newCells = BoardUtils.depleteResourcesFromBuild(buildingType, elemParentCell, newCells);
    return newCells;
  }

  static elementsToBuildExistOnTile(elementSubType: ElementSubType, cell: Cell): boolean {
    let counts = {};

    let requiredElements = getBuildingCost(elementSubType);
    let mergedItemElements = mergeItemElements(cell.elements.filter(e => e.type == ElementType.Item));

    for (var requiredElement of requiredElements) {
      let relevantItemElement = mergedItemElements.filter(e => e.subType == requiredElement.subType)[0];

      if (!relevantItemElement) {
        return false
      }

      if (relevantItemElement.count < requiredElement.count) {
        return false;
      }
    }

    return true
  }

  static depleteResourcesFromBuild(buildingType: ElementSubType, cell: Cell, cells: Cell[]) {
    let requiredResources = getBuildingCost(buildingType);
    let newCells = structuredClone(cells);
    let newCell;
    for (var c of newCells) {
      if (c.x == cell.x && c.y == cell.y) {
        newCell = c;
      }
    }
    
    let mergedItemElements = mergeItemElements(newCell.elements.filter(e => e.type == ElementType.Item));

    let newElements = [...newCell.elements.filter(e => e.type != ElementType.Item)]; // remove all current items to add again later

    for (var requiredResource of requiredResources) {

      let relevantItemElement = mergedItemElements.filter(e => e.subType == requiredResource.subType)[0];

      if (requiredResource.count > relevantItemElement.count) {
        throw new Error(`Required resources exceeded resources on tile.`);
      }

      if (requiredResource.count < relevantItemElement.count) {
        relevantItemElement.count -= relevantItemElement.count;
        newElements.push(relevantItemElement);
      }
    }

    newCell.elements = newElements;
    return newCells;
  }

  static makePersonsFight(personElem: Element, targetElem: Element, cells: Cell[]): Cell[] {

    if (personElem.type != ElementType.Person || targetElem.type != ElementType.Person) {
      throw new Error("Can only fight between two persons.");
    }

    let newCells = structuredClone(cells);

    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let targetParentCell = BoardUtils.getElementParentCell(personElem, newCells);

    if (elemParentCell.x != targetParentCell.x || elemParentCell.y != targetParentCell.y) {
      throw new Error("Can't fight a person in a different cell!");
    };

    let newPersonOne = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPersonOne.hasActionAvailable = false;

    let newPersonTwo = elemParentCell.elements.filter(e => e.id == targetElem.id)[0];

    let p1armor = newPersonOne.armor ? newPersonOne.armor : 0;
    let p2armor = newPersonTwo.armor ? newPersonTwo.armor : 0;

    if (PERSON_BASE_DAMAGE > p1armor) {
      newPersonOne.health = newPersonOne.health - (PERSON_BASE_DAMAGE - p1armor);
    }
    if (PERSON_BASE_DAMAGE > p2armor) {
      newPersonTwo.health = newPersonTwo.health - (PERSON_BASE_DAMAGE - p2armor);
    }

    if (newPersonOne.health < 1) {
      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != newPersonOne.id);
    }

    if (newPersonTwo.health < 1) {
      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != newPersonTwo.id);
    }

    return newCells;
  }

  static makePersonWork(personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.isWorking = true;
    newPerson.hasActionAvailable = false;
    return newCells;
  }

  static getAvailableActions(personElem: Element, cells: Cell[]): ElementAction[] {

    if (personElem.type !== ElementType.Person) {
      throw new Error("Non-person elements do not have actions.")
    }

    const elementParent = BoardUtils.getElementParentCell(personElem, cells);
    let personElements = [], buildingElements = [], itemElements = [];

    for (var elem of elementParent.elements) {
      if (elem.type == ElementType.Person) {
        personElements.push(elem);
      }
      if (elem.type == ElementType.Building) {
        buildingElements.push(elem);
      }
      if (elem.type == ElementType.Item) {
        itemElements.push(elem);
      }
    }

    let result = [ElementAction.Move];

    let capitalExists = buildingElements[0] && buildingElements[0].subType == ElementSubType.Capital;

    if (buildingElements.length === 0) {
      result.push(ElementAction.Build);
    } else {
      // Can't destroy the capital
      if (!capitalExists) {
        result.push(ElementAction.Destroy);
      }
    }

    if (!capitalExists) {
      result.push(ElementAction.Work);
    }

    let currentCarryWeight = BoardUtils.getPersonCarryingWeight(personElem);
    if (currentCarryWeight > 0) {
      result.push(ElementAction.Drop)
    };

    // also if itemElements are not too much weight
    if (currentCarryWeight < PERSON_MAX_CARRY_WEIGHT && itemElements.length > 0) {
      result.push(ElementAction.Take)
    }

    if (BoardUtils.enemyExistsOnCell(personElem, elementParent)) {
      result.push(ElementAction.Fight)
    }

    return result
  }
}
