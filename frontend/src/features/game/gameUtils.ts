import {
  TeamColors,
  ElementTypes,
  ElementSubTypes,
  CellTypes,
}  from "@/features/game/gameTypes"

import BoardUtils from "@/features/board/boardUtils"

export function getRandomName(): string {
  return randomItem(NAMES_LIST)
}

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
export function getElementId(): string {
  return genRanHex(10);
}

export function updateElemAttributes(elem: Element): Element {
  let newElem = {...elem};

  // items need new ids each type we update, buildings and persons dont
  if (elem.type == ElementTypes.Item || !elem.id) {
    newElem.id = getElementId();
  }

  if (newElem.type == ElementTypes.Person) {
    if (!newElem.name) {
      newElem.name = getRandomName();
    }

    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {

      let newHeldElements = [];

      for (let h = 0; h < newElem.heldElements.length; h++) {
        let he = {...newElem.heldElements[h]};
        if (!he.count) {
          he.count = 1;
        }

        if (!elem.id) {
          he.id = getElementId();
        }
        newHeldElements.push(he);
      }

      newElem.heldElements = BoardUtils.mergeItemElements(newHeldElements);
    }

    if (newElem.hasActionAvailable === null || newElem.hasActionAvailable === undefined) {
      newElem.hasActionAvailable = true;
    }
  }

  return newElem;
}

function updateCellElementPositions(elements: Element[]): Element[] {

  let personElements = [], buildingElements = [], itemElements = [];

  for (var elem of elements) {
    if (elem.type == ElementTypes.Person) {
      personElements.push(elem);
    }
    if (elem.type == ElementTypes.Building) {
      buildingElements.push(elem);
    }
    if (elem.type == ElementTypes.Item) {
      itemElements.push(elem);
    }
  }

  let newElements = [];

  if (buildingElements.length > 0) {
    let building = {...buildingElements[0]};
    building.position = 0;
    newElements.push(building);
  }

  for (let i=0; i < personElements.length; i++) {
    let newElem = {...personElements[i]};
    if (buildingElements.length == 0) {
      newElem.position = i;
    } else {
      newElem.position = i + 1;
    }
    newElements.push(newElem);
  }

  return [...newElements, ...BoardUtils.mergeItemElements(itemElements)];
}

function updateCellElements(cell: Cell): Element[] {
  let newElements = [...cell.elements];
  newElements = newElements.map(el => objectToElement(el));
  newElements = updateCellElementPositions(newElements);

  let result = [];

  for (var elem of newElements) {
    result.push(updateElemAttributes(elem));
  }

  return result;
}

export function prepareCellsForStateSave(cells: Cell[]): Cell[] {
  let newCells = [];

  for (var cell of cells) {
    let newCell = {...cell};
    let newElements = updateCellElements(newCell);
    newCell.elements = newElements;
    newCells.push(newCell);
  }

  return newCells
}

export function objectToElement(_obj: any): Element {

  let obj = {..._obj};

  if (obj.type == undefined || obj.subType == undefined) {
    throw new Error("objectToElement requires obj to have at least type and subtype.");
  }
  if (obj.team === undefined) {
    obj.team = null;
  }
  if (obj.position === undefined) {
    obj.position = null;
  }
  if (obj.id === undefined) {
    obj.id = "";
  }
  if (obj.count === undefined) {
    obj.count = 1;
  }
  if (obj.heldElements === undefined) {
    obj.heldElements = [];
  }

  if (obj.subType == 17) { // horse
    if (obj.hasActionAvailable === undefined || obj.hasActionAvailable === null) {
      obj.hasActionAvailable = true;
    }
  }

  if (obj.isWorking === undefined) {
    obj.isWorking = null;
  }

  if (obj.isScavenging === undefined) {
    obj.isScavenging = null;
  }

  if (obj.hasActionAvailable === undefined) {
    obj.hasActionAvailable = null;
  }

  if (obj.health === undefined) {
    obj.health = 0;
  }

  return obj
}

export function nameForElementSubType(subType: number) {
  return Object.keys(ElementSubTypes)[subType]
}

export function nameForTeamColor(teamColor: number) {
  return Object.keys(TeamColors)[teamColor]
}

export function itemTypeForCellTypes(cellType: CellTypes): ElementSubTypes {
  if (cellType == CellTypes.Field) {
    return ElementSubTypes.Food
  }
  if (cellType == CellTypes.Forest) {
    return ElementSubTypes.Wood
  }
  if (cellType == CellTypes.Mountain) {
    return ElementSubTypes.Ore
  }
  if (cellType == CellTypes.ClayField) {
    return ElementSubTypes.Clay
  }
  throw new Error(`unhandled cell type`)
}

export function getBuildingCost(elementToBuildType: ElementSubTypes) {
  if (!THINGS_THAT_CAN_BE_BUILT.includes(elementToBuildType)) {
    throw new Error(`Unhandled subtype: ${elementToBuildType}`)
  }

  let ingredients = [];
  switch (elementToBuildType) {

    // Buildings
    case ElementSubTypes.Farm:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      break;
    case ElementSubTypes.Quarry:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 1
      })
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      break;
    case ElementSubTypes.BrickFactory:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      break;
    case ElementSubTypes.SawMill:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 1
      })
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      break;
    case ElementSubTypes.Village:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      break;
    case ElementSubTypes.Forge:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Clay,
        count: 2
      })
      ingredients.push({
        subType: ElementSubTypes.Leather,
        count: 2
      })
      break;


    // Items
    case ElementSubTypes.Sword:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 1
      })
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 3
      })
      break;
    case ElementSubTypes.Bow:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubTypes.Leather,
        count: 1
      })
      break;
    case ElementSubTypes.Shield:
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubTypes.Leather,
        count: 1
      })
      break;
    case ElementSubTypes.LeatherArmor:
      ingredients.push({
        subType: ElementSubTypes.Leather,
        count: 3
      })
      break;

    case ElementSubTypes.Mace:
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 2
      })
      break;

    case ElementSubTypes.Spear:
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 1
      })
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 2
      })
      break;

    case ElementSubTypes.IronArmor:
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubTypes.Leather,
        count: 2
      })
      break;
    case ElementSubTypes.Cart:
      ingredients.push({
        subType: ElementSubTypes.Wood,
        count: 4
      })
      ingredients.push({
        subType: ElementSubTypes.Ore,
        count: 2
      })
      break;

    case ElementSubTypes.Villager:
      ingredients.push({
        subType: ElementSubTypes.Food,
        count: 10
      })
      break;

    default:
      break;
  }

  return ingredients
}

export function getSpecificItemBuildingCost(elementToBuildType: ElementSubTypes, ingredient: ElementSubTypes) {
  let buildingCost = getBuildingCost(elementToBuildType);

  for (var item of buildingCost) {
    if (item.subType == ingredient) {
      return item.count;
    }
  }

  throw new Error("Ingredient requested not part of building cost.");
}

export const getDamageAmount = (weapon:ElementSubTypes|null) => {
  if (weapon === null) return 3;
  if (weapon === ElementSubTypes.Sword) return 7;
  if (weapon === ElementSubTypes.Spear) return 5;
  if (weapon === ElementSubTypes.Mace) return 8;
  if (weapon === ElementSubTypes.Bow) return 5;

  throw new Error("Unhandled weapon type");
}

export const getArmorAmount = (item:ElementSubTypes) => {
  if (item==ElementSubTypes.Shield) return 3;
  if (item==ElementSubTypes.LeatherArmor) return 2;
  if (item==ElementSubTypes.IronArmor) return 3;
  return 0
}

export function getTradeCostForSubType(subType: ElementSubTypes) {
  if (subType == ElementSubTypes.Horse) { return 7 };
  if (subType == ElementSubTypes.Cow) { return 6 };
  return 2
}
