import type {
  Cell, Element, Coordinate
} from "./boardTypes"

import {
  HexPosition, ElementType, ElementSubType, ElementAction, CellType,
} from "./boardTypes"

import {
  PERSON_MAX_CARRY_WEIGHT,
  PERSON_BASE_DAMAGE,
  SHIELD_ARMOR_INCREASE_AMOUNT,
  SWORD_DAMAGE_INCREASE_AMOUNT,
  PERSON_BASE_HEALTH,
  getBuildingCost,
  nameForElementSubType
} from "./vars"

import { BoardUtils } from "./boardUtils"

export default class BoardActions {
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

  static build(personElem: Element, elementType: ElementType, elementSubType: ElementSubType, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);

    let newEl = {type: elementType, subType: elementSubType};

    if (elementType == ElementType.Person) {
      newEl.health = PERSON_BASE_HEALTH;
      newEl.team = personElem.team;
      newEl.heldElements = [];
      newEl.hasActionAvailable = false;
    }

    elemParentCell.elements.push(newEl);

    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;
    newCells = BoardUtils.depleteResourcesFromBuild(elementSubType, newPerson, elemParentCell, newCells);
    return newCells;
  }

  static depleteResourcesFromBuild(buildingType: ElementSubType, _personElem: Element, cell: Cell, cells: Cell[]) {
    let requiredElements = getBuildingCost(buildingType);
    let newCells = structuredClone(cells);
    let newCell;
    for (var c of newCells) {
      if (c.x == cell.x && c.y == cell.y) {
        newCell = c;
      }
    };

    let personElem = newCell.elements.filter(el => el.id == _personElem.id)[0];
 
    // Deplete from tile
    let mergedItemElements = BoardUtils.mergeItemElements(newCell.elements.filter(e => e.type == ElementType.Item));
    let oldNonItemElements = newCell.elements.filter(el => el.type != ElementType.Item);

    let requirementsAfterTile = [];

    for (var requiredElement of requiredElements) {

      let relevantItemElement = mergedItemElements.filter(e => e.subType == requiredElement.subType)[0];

      if (!relevantItemElement) {
        requirementsAfterTile.push({...requiredElement});
      }
      else if (relevantItemElement.count > requiredElement.count) {
        relevantItemElement.count -= relevantItemElement.count;
      }
      else if (relevantItemElement.count == requiredElement.count) {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
      }
      else {
        mergedItemElements = mergedItemElements.filter(el => el.id != relevantItemElement.id);
        let copiedRequirement = {...requiredElement};
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
        relevantItemElement.count -= relevantItemElement.count;
      }
    }

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

    function getShieldFactor(person) {
      let isHoldingShield = person.heldElements.filter(el => el.subType == ElementSubType.Shield).length > 0;
      return isHoldingShield ? SHIELD_ARMOR_INCREASE_AMOUNT : 0
    }

    function getSwordFactor(person) {
      let isHoldingShield = person.heldElements.filter(el => el.subType == ElementSubType.Sword).length > 0;
      return isHoldingShield ? SWORD_DAMAGE_INCREASE_AMOUNT : 0
    }

    let newPersonOne = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPersonOne.hasActionAvailable = false;

    let newPersonTwo = elemParentCell.elements.filter(e => e.id == targetElem.id)[0];

    let p1armor = newPersonOne.armor ? newPersonOne.armor : 0;
    let p2armor = newPersonTwo.armor ? newPersonTwo.armor : 0;
    p1armor += getShieldFactor(newPersonOne);
    p2armor += getShieldFactor(newPersonTwo);

    let p1damage = PERSON_BASE_DAMAGE + getSwordFactor(newPersonOne);
    let p2damage = PERSON_BASE_DAMAGE + getSwordFactor(newPersonTwo);

    if (p2damage > p1armor) {
      newPersonOne.health = newPersonOne.health - (p2damage - p1armor);
    }
    if (p1damage > p2armor) {
      newPersonTwo.health = newPersonTwo.health - (p1damage - p2armor);
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

    result.push(ElementAction.Build);
    if (!capitalExists) {
      result.push(ElementAction.Destroy);
    }

    result.push(ElementAction.Work);

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
