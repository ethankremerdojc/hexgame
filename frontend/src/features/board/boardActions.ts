// import {
//   getElementId
// } from "./boardSlice"

import type {
  Cell, Element
} from "@/features/game/gameTypes"

import {
  ElementTypes, ElementSubTypes, ElementActions, CellTypes,
} from "@/features/game/gameTypes"

import {
  PERSON_BASE_HEALTH,
  WEAPON_SUBTYPES, 
  ARMOR_SUBTYPES,
} from "@/features/game/gameVars"

import { 
  getDamageAmount,
  getArmorAmount,
  getBuildingCost,
  objectToElement,
  getElementId
} from "@/features/game/gameUtils"

import BoardUtils from "./boardUtils"

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

        let horseElems = elem.heldElements.filter(el => el.subType == ElementSubTypes.Horse);
        let ridingHorse = horseElems.length > 0;

        let horseUsedAction = false;

        if (ridingHorse) {
          let horse = horseElems[0];

          if (horse.hasActionAvailable) {
            let newHorseElem = structuredClone(horse);
            newHorseElem.hasActionAvailable = false;

            newElem.heldElements = newElem.heldElements.filter((el: Element) => el.id != newHorseElem.id);
            newElem.heldElements.push(newHorseElem);

            horseUsedAction = true;
          }
        }

        if (!horseUsedAction) {
          newElem.hasActionAvailable = false;
        }

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

    if (!elemParentCell) {
      throw new Error("Could not find parent in clone")
    }

    for (var elem of elemParentCell.elements) {
      if (elem.id == personElem.id) {
        newPersonElem = elem;
      }
    }
    if (!newPersonElem) {
      throw new Error("Could not find person in clone")
    }

    // if count is max

    let elementToDrop = newPersonElem.heldElements.filter((e: Element) => e.id == droppedItemId)[0];
    console.log("elem to drop", structuredClone(elementToDrop));

    // create new element on the tile, will be combined automatically in the slice
    let copiedDroppedElement = structuredClone(elementToDrop);
    copiedDroppedElement.id = getElementId(); // Give the copied elem a new id
    copiedDroppedElement.count = count;
    elemParentCell.elements.push(copiedDroppedElement);
    elementToDrop.count -= count;

    if (elementToDrop.count < 1) {
      newPersonElem.heldElements = newPersonElem.heldElements.filter((e: Element) => e.id != elementToDrop.id);
    }

    if (copiedDroppedElement.subType == ElementSubTypes.Cart) {
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
    if (!elemParentCell) {
      throw new Error("Could not find parent in clone")
    }

    for (var elem of elemParentCell.elements) {
      if (elem.id == personElem.id) {
        newPersonElem = elem;
      }
    }
    if (!newPersonElem) {
      throw new Error("Could not find person in clone")
    }

    let elementToTake = elemParentCell.elements.filter((e: Element) => e.id == takenItemId)[0];
    let copiedElem = structuredClone(elementToTake);
    copiedElem.id = getElementId(); // Give the copied elem a new id

    if (count == elementToTake.count) {
      // just take actual item and move it
      newPersonElem.heldElements.push(copiedElem);
      elemParentCell.elements = elemParentCell.elements.filter((e: Element) => e.id != takenItemId);
    } else {
      copiedElem.count = count;
      newPersonElem.heldElements.push(copiedElem);

      let newParentChild = structuredClone(elementToTake);
      elemParentCell.elements = elemParentCell.elements.filter((e: Element) => e.id != takenItemId);
      newParentChild.count -= count;
      elemParentCell.elements.push(newParentChild);
    }

    return newCells
  }

  static build(personElem: Element, elementType: ElementTypes, elementSubType: ElementSubTypes, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);

    let newEl: any = {type: elementType, subType: elementSubType};

    if (elementType == ElementTypes.Person || elementSubType == ElementSubTypes.Village) {
      newEl.team = personElem.team;
    }

    if (elementType == ElementTypes.Person) {
      newEl.health = PERSON_BASE_HEALTH;
      newEl.heldElements = [];
      newEl.hasActionAvailable = false;
    }

    elemParentCell.elements.push(objectToElement(newEl));

    let newPerson = elemParentCell.elements.filter((e: Element) => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;

    let resourcesRequired = getBuildingCost(elementSubType);
    return BoardUtils.depleteResources(resourcesRequired, personElem, newCells);
  }

  static destroyBuilding(personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    elemParentCell.elements = elemParentCell.elements.filter(e => e.type != ElementTypes.Building);
    let newPerson = elemParentCell.elements.filter((e: Element) => e.id == personElem.id)[0];
    newPerson.hasActionAvailable = false;
    return newCells
  }

  static doDamage(agressor: Element, defender: Element): Element|null { // returns the state of the defender
    let weaponEls = agressor.heldElements.filter((el: Element) => WEAPON_SUBTYPES.includes(el.subType));

    let ignoreShield = false;
    let ignoreLeatherArmor = false;

    let damageAmount = 0;

    if (weaponEls.length == 0) {
      damageAmount = getDamageAmount(null);
    } else {
      let weaponType = weaponEls[0].subType;
      damageAmount = getDamageAmount(weaponType);

      if (weaponType == ElementSubTypes.Bow) {
        ignoreShield = true;
      }
      if (weaponType == ElementSubTypes.Mace) {
        ignoreLeatherArmor = true;
      }
    }

    let armorAmount = 0;
    let armorEls;

    if (ignoreShield) {
      let nonShieldArmors: any = ARMOR_SUBTYPES.filter((s: ElementSubTypes) => s != ElementSubTypes.Shield);
      armorEls = defender.heldElements.filter((el: Element) => nonShieldArmors.includes(el.subType));
    } else if (ignoreLeatherArmor) {
      let nonLeatherArmors: any = ARMOR_SUBTYPES.filter((s: ElementSubTypes) => s != ElementSubTypes.LeatherArmor);
      armorEls = defender.heldElements.filter((el: Element) => nonLeatherArmors.includes(el.subType));     
    } else {
      armorEls = defender.heldElements.filter((el: Element) => ARMOR_SUBTYPES.includes(el.subType));
    }

    for (var armorEl of armorEls) {
      armorAmount += getArmorAmount(armorEl.subType);
    }

    if (armorAmount >= damageAmount) return defender;

    defender.health = defender.health - (damageAmount - armorAmount);

    if (defender.health < 1) { return null }
    return defender

  }

  static makePersonsFight(_personElem: Element, _targetElem: Element, cells: Cell[]): Cell[] {

    if (_personElem.type != ElementTypes.Person || _targetElem.type != ElementTypes.Person) {
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

  static renamePerson(personElem: Element, newName: string, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.name = newName;
    return newCells;
  }

  static healPerson(personElem: Element, cells: Cell[]): Cell[] {
    let resources = [{subType: ElementSubTypes.Food, count: 1}];
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
    return BoardActions.build(personElem, ElementTypes.Person, ElementSubTypes.Villager, cells);
  }

  static trade(personElem: Element, givenItem: Element, receivedItem: Element, cells: Cell[]): Cell[] {
    let newCells = BoardUtils.depleteResources([givenItem], personElem, cells);
    let parentCell = BoardUtils.getElementParentCell(personElem, newCells);
    parentCell.elements.push(receivedItem);
    return newCells
  };

  static scavenge(personElem: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let elemParentCell = BoardUtils.getElementParentCell(personElem, newCells);
    let newPerson = elemParentCell.elements.filter(e => e.id == personElem.id)[0];
    newPerson.isScavenging = true;
    newPerson.hasActionAvailable = false;
    return newCells;
  }

  static shoot(personShooting: Element, personToShoot: Element, cells: Cell[]): Cell[] {
    let newCells = structuredClone(cells);
    let parentCell = BoardUtils.getElementParentCell(personToShoot, newCells);

    let shooterParentCell = BoardUtils.getElementParentCell(personShooting, newCells);
    let newPersonShooting = shooterParentCell.elements.filter((el: Element) => el.id == personShooting.id)[0];
    newPersonShooting.hasActionAvailable = false;

    let newPersonToShoot = parentCell.elements.filter((el: Element) => el.id == personToShoot.id)[0];
    let hurtPerson = BoardActions.doDamage(newPersonShooting, newPersonToShoot);

    if (!hurtPerson) {
      parentCell.elements = [...parentCell.elements, ...newPersonToShoot.heldElements];
      parentCell.elements = parentCell.elements.filter((e: Element) => e.id != newPersonToShoot.id);
    }
    return newCells
  }

  static getAvailableActions(personElem: Element, cells: Cell[]): ElementActions[] {

    if (personElem.type !== ElementTypes.Person) {
      throw new Error("Non-person elements do not have actions.")
    }

    if (!personElem.hasActionAvailable) {
      return []
    }

    const elementParent = BoardUtils.getElementParentCell(personElem, cells);

    let result = [ElementActions.Move];

    result.push(ElementActions.Build);

    if (BoardUtils.personCanDestroy(personElem, cells)) {
      result.push(ElementActions.Destroy);
    }
    
    if (elementParent.type != CellTypes.Desert) {
      result.push(ElementActions.Work);
    }

    let currentCarryWeight = BoardUtils.getPersonCarryingWeight(personElem);
    if (currentCarryWeight > 0) {
      result.push(ElementActions.Drop)
    };

    if (BoardUtils.personCanTakeAnyItem(personElem, cells)) {
      result.push(ElementActions.Take)
    }

    if (BoardUtils.enemyExistsOnCell(personElem, elementParent)) {
      result.push(ElementActions.Fight)
    }

    if (BoardUtils.personCanHeal(personElem, cells)) {
      result.push(ElementActions.Heal)
    }

    if (BoardUtils.personCanReproduce(personElem, cells)) {
      result.push(ElementActions.Reproduce)
    }
    
    // do not deplete actions, but cannot drop or pickup anymore after an action that does
    if (BoardUtils.personCanTrade(personElem, cells)) {
      result.push(ElementActions.Trade)
    }

    if (BoardUtils.personCanShoot(personElem, cells)) {
      result.push(ElementActions.Shoot)
    }

    if (elementParent.type == CellTypes.Desert) {
      console.log("adding scavenge")
      result.push(ElementActions.Scavenge)
    }

    result.push(ElementActions.Rename)

    return result
  }
}
