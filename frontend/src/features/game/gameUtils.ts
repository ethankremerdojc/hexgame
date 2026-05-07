import {
  TeamColors,
  ElementTypes,
  ElementSubTypes,
  CellTypes,
}  from "@/features/game/gameTypes"

import {
  THINGS_THAT_CAN_BE_BUILT,
  COW_PRODUCING_TILES,
  WORKER_ITEM_GENERATION_AMOUNT,
  BUILDING_ITEM_GENERATION_AMOUNT
}  from "@/features/game/gameVars"

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

export function itemTypeForCellType(cellType: CellTypes): ElementSubTypes {
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

export function getHandsRequiredToHold(elementSubType: ElementSubTypes) {
  switch (elementSubType) {
    case ElementSubTypes.Cart:
      return 2
      break;
    case ElementSubTypes.Horse:
    case ElementSubTypes.Cow:
    case ElementSubTypes.Bow:
    case ElementSubTypes.Shield:
    case ElementSubTypes.Sword:
    case ElementSubTypes.Mace:
    case ElementSubTypes.Spear:
      return 1
      break;
    default:
      return 0
      break;
  }
}

export function checkForWinner(cells: Cell[], playerTurn: TeamColor): boolean {
  // verify that there is only 1 capital and it is the one of the current team
  let capitals = [];

  for (var cell of cells) {
    let cellCapitals: Element[] = cell.elements.filter((el: Element) => el.subType == ElementSubTypes.Capital);
    if (cellCapitals.length < 1) { continue }
    capitals.push(cellCapitals[0]);
  }

  console.log("num capitals: ", capitals.length);

  if (capitals.length > 1) { return false };

  if (capitals[0].team == playerTurn) { return true };

  throw new Error("Somehow the only capital is one of a different player.");
}

export function depleteFoodForPersonsOnTeam(playerTeam: number, newCells: Cell[]): Cell[] {
  let cellsWithPlayersOnTeam = newCells.filter(
    cell => cell.elements.filter(
      elem => elem.type == ElementTypes.Person && elem.team == playerTeam
    ).length > 0);

  for (var cell of cellsWithPlayersOnTeam) {
    let persons = cell.elements.filter(elem => elem.type == ElementTypes.Person && elem.team == playerTeam);

    for (var person of persons) {
      if (person.health === null) {
        throw new Error(`Person had no health attribute.`)
      }

      let foodElementsOnTile = cell.elements.filter(el => el.subType == ElementSubTypes.Food);

      if (foodElementsOnTile.length > 0) {
        let foodElem = foodElementsOnTile[0];
        if (foodElem.count == 1) {
          cell.elements = cell.elements.filter(el => el.id != foodElem.id);
        } else {
          foodElem.count -= 1;
        }

        continue
      }

      let foodElementsHeld = person.heldElements.filter(el => el.subType == ElementSubTypes.Food);

      if (foodElementsHeld.length > 0) {
        let foodElem = foodElementsHeld[0];
        if (foodElem.count == 1) {
          person.heldElements = person.heldElements.filter(el => el.id != foodElem.id);
        } else {
          foodElem.count -= 1;
        }
      } else {
        person.health -= NO_FOOD_PENALTY;
        if (person.health < 1) {
          cell.elements = [...cell.elements, ...person.heldElements];
          cell.elements = cell.elements.filter(el => el.id != person.id);
        }
      }
    }
  }

  return newCells;
}

export function makePersonsWithActionOnTeamWork(playerTeam: number, cells: Cell[]): Cell[] {
  let cellsWithPlayersOnTeam = cells.filter(
    cell => cell.elements.filter(
      elem => elem.type == ElementTypes.Person && elem.team == playerTeam
    ).length > 0);

  for (var cell of cellsWithPlayersOnTeam) {
    let persons = cell.elements.filter(elem => elem.type == ElementTypes.Person && elem.team == playerTeam);
    for (var person of persons) {
      if (person.hasActionAvailable) {
        if (cell.type == CellTypes.Desert) {
          person.isScavenging = true;
        } else {
          person.isWorking = true;
        }
      }
    }
  }

  return cells
}

export function setupNewTurn(newCells: Cell[], playerTurn: number, roundNumber: number): Cell[] {
  let cellsWithOwnPersons = newCells.filter(
    cell => cell.elements.filter(el => el.type == ElementTypes.Person && el.team == playerTurn).length > 0);

  for (var cell of cellsWithOwnPersons) {

    let ownPersons = cell.elements.filter(el => el.type == ElementTypes.Person && el.team == playerTurn);
    let workers = ownPersons.filter(el => el.isWorking);
    let scavengers = ownPersons.filter(el => el.isScavenging);

    for (var p of ownPersons) {
      p.hasActionAvailable = true;
      p.isWorking = false;
      p.isScavenging = false;

      let horses = p.heldElements.filter((el: Element) => el.subType == ElementSubTypes.Horse);
      for (var horse of horses) {
        horse.hasActionAvailable = true;
      }
    }

    let horses = cell.elements.filter(el => el.subType == ElementSubTypes.Horse);
    for (var horse of horses) {
      horse.hasActionAvailable = true;
    };

    let cows = cell.elements.filter(el => el.subType == ElementSubTypes.Cow);
    if (cows.length > 0) {
      if (workers.length > 0 && COW_PRODUCING_TILES.includes(Number(cell.type))) {
        let leatherCount = Math.min(cows[0].count, 3);
        let leatherEl = {type: ElementTypes.Item, subType: ElementSubTypes.Leather, count: leatherCount};
        cell.elements.push(objectToElement(leatherEl));
      }
    }

    for (var scavenger of scavengers) {
      let scavengedItem = BoardUtils.getScavengedItem(scavenger, roundNumber);
      cell.elements.push(scavengedItem);
    }

    if (workers.length < 1) { continue }

    let buildingExists = cell.elements.filter(el => el.type == ElementTypes.Building && el.subType != ElementSubTypes.Capital && el.subType != ElementSubTypes.Village).length > 0;

    let itemCreationCount;
    if (buildingExists) {
      itemCreationCount = BUILDING_ITEM_GENERATION_AMOUNT * workers.length;
    } else {
      itemCreationCount = WORKER_ITEM_GENERATION_AMOUNT * workers.length;
    };

    cell.elements.push(objectToElement({type: ElementTypes.Item, subType: itemTypeForCellType(cell.type), count: itemCreationCount}));
  }

  newCells = prepareCellsForStateSave(newCells);
  return newCells
}
