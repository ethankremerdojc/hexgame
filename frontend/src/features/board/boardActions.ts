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

    if (copiedDroppedElement.subType == ElementSubType.Cart) {
      elemParentCell.elements = [...elemParentCell.elements, ...newPersonElem.heldElements];
      newPersonElem.heldElements = [];
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

    if (elementType == ElementType.Person || elementSubType == ElementSubType.Village) {
      newEl.team = personElem.team;
    }

    if (elementType == ElementType.Person) {
      newEl.health = PERSON_BASE_HEALTH;
      newEl.heldElements = [];
      newEl.hasActionAvailable = false;
    }

    elemParentCell.elements.push(newEl);

    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;

    let resourcesRequired = getBuildingCost(elementSubType);
    return BoardUtils.depleteResources(resourcesRequired, personElem, newCells);
  }

  static destroyBuilding(personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    elemParentCell.elements = elemParentCell.elements.filter(e => e.type != ElementType.Building);
    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;
    return newCells
  }

  static doDamage(agressor: Element, defender: Element) {

    function getShieldFactor(person) {
      let isHoldingShield = person.heldElements.filter(el => el.subType == ElementSubType.Shield).length > 0;
      return isHoldingShield ? SHIELD_ARMOR_INCREASE_AMOUNT : 0
    }

    function getSwordFactor(person) {
      let isHoldingShield = person.heldElements.filter(el => el.subType == ElementSubType.Sword).length > 0;
      return isHoldingShield ? SWORD_DAMAGE_INCREASE_AMOUNT : 0
    }

    let defenderArmor = defender.armor ? defender.armor : 0;
    defenderArmor += getShieldFactor(defender);

    let agressorDamage = PERSON_BASE_DAMAGE + getSwordFactor(agressor);

    if (agressorDamage > defenderArmor) {
      defender.health = defender.health - (agressorDamage - defenderArmor);
    }

    if (defender.health < 1) {
      return null
    }
    return defender
  }

  static makePersonsFight(_personElem: Element, _targetElem: Element, cells: Cell[]): Cell[] {

    if (_personElem.type != ElementType.Person || _targetElem.type != ElementType.Person) {
      throw new Error("Can only fight between two persons.");
    }

    let newCells = structuredClone(cells);

    let elemParentCell = BoardUtils.getElementParentCell(_personElem, newCells);
    let personElem = elemParentCell.elements.filter(el => el.id == _personElem.id)[0];
    personElem.hasActionAvailable = false;
    let targetElem = elemParentCell.elements.filter(el => el.id == _targetElem.id)[0];

    let hurtPersonElem = BoardActions.doDamage(targetElem, personElem);


    if (!hurtPersonElem) {
      elemParentCell.elements = [...elemParentCell.elements, ...personElem.heldElements];
      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != personElem.id);
    }

    let hurtTargetElem = BoardActions.doDamage(personElem, targetElem);

    if (!hurtTargetElem) {
      elemParentCell.elements = [...elemParentCell.elements, ...targetElem.heldElements];
      elemParentCell.elements = elemParentCell.elements.filter(e => e.id != targetElem.id);
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

  static healPerson(personElem: Element, cells: Cell[]): Cell[] {
    let resources = [{subType: ElementSubType.Food, count: 1}];
    if (!BoardUtils.resourcesExistForPerson(resources, personElem, cells)) {
      throw new Error(`Resources did not exist to heal player.`);
    }
    let newCells = structuredClone(cells);
    let parentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let newPerson = parentCell.elements.filter(el => el.id == personElem.id)[0];

    newPerson.health = Math.min(PERSON_BASE_HEALTH, personElem.health + 1);
    newCells = BoardUtils.depleteResources(resources, newPerson, newCells);

    return newCells;
  }

  static reproducePerson(personElem: Element, cells: Cell[]): Cell[] {
    return BoardActions.build(personElem, ElementType.Person, ElementSubType.Villager, cells);
  }

  static trade(personElem: Element, givenItem: Element, receivedItem: Element, cells: Cell[]): Cell[] {
    let newCells = BoardUtils.depleteResources([givenItem], personElem, cells);
    let parentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let newPerson = parentCell.elements.filter(el => el.id == personElem.id)[0];

    newPerson.heldElements.push(receivedItem);

    return newCells
  }

  static shoot(personShooting: Element, personToShoot: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let parentCell = BoardUtils.getElementParentCell(personToShoot, newCells);

    let shooterParentCell = BoardUtils.getElementParentCell(personShooting, newCells);
    let newPersonShooting = shooterParentCell.elements.filter(el => el.id == personShooting.id)[0];
    newPersonShooting.hasActionAvailable = false;

    let newPersonToShoot = parentCell.elements.filter(el => el.id == personToShoot.id)[0];
    let hurtTargetElem = BoardActions.doDamage(newPersonShooting, newPersonToShoot);

    if (!hurtTargetElem) {
      parentCell.elements = [...elemParentCell.elements, ...newPerson.heldElements];
      parentCell.elements = elemParentCell.elements.filter(e => e.id != newPerson.id);
    }
    return newCells
  }

  static getAvailableActions(personElem: Element, cells: Cell[]): ElementAction[] {

    if (personElem.type !== ElementType.Person) {
      throw new Error("Non-person elements do not have actions.")
    }

    if (!personElem.hasActionAvailable) {
      return []
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
    let villageExists = buildingElements[0] && buildingElements[0].subType == ElementSubType.Village;

    result.push(ElementAction.Build);

    if (!capitalExists && elementParent.elements.filter(el => el.type == ElementType.Building).length > 0) {
      result.push(ElementAction.Destroy);
    }
    
    if (elementParent.type != CellType.Desert) {
      result.push(ElementAction.Work);
    }

    let currentCarryWeight = BoardUtils.getPersonCarryingWeight(personElem);
    if (currentCarryWeight > 0) {
      result.push(ElementAction.Drop)
    };

    // also if itemElements are not too much weight
    if (BoardUtils.personCanTakeAnyItem(personElem, cells)) {
      result.push(ElementAction.Take)
    }

    if (BoardUtils.enemyExistsOnCell(personElem, elementParent)) {
      result.push(ElementAction.Fight)
    }

    let resourcesForHealing = [{subType: ElementSubType.Food, count: 1}];
    if (personElem.health < PERSON_BASE_HEALTH && BoardUtils.resourcesExistForPerson(resourcesForHealing, personElem, cells)) {
      result.push(ElementAction.Heal)
    }

    if (BoardUtils.personCanReproduce(personElem, cells)) {
      result.push(ElementAction.Reproduce)
    }
    
    // do not deplete actions, but cannot drop or pickup anymore after an action that does
    if (BoardUtils.personCanTrade(personElem, cells)) {
      result.push(ElementAction.Trade)
    }

    if (BoardUtils.personCanShoot(personElem, cells)) {
      result.push(ElementAction.Shoot)
    }

    return result
  }
}
