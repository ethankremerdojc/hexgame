import type { TeamColor } from "./boardTypes"

import {
  ElementSubType, CellType
} from "./boardTypes"

export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 4;
export const PERSON_MAX_CARRY_WEIGHT = 5;
export const CART_CARRY_WEIGHT_INCREASE = 6; // because cart still weighs 1
export const PERSON_BASE_DAMAGE = 4;
export const PERSON_BASE_HEALTH = 10;
export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

export const SHIELD_ARMOR_INCREASE_AMOUNT = 2;
export const SWORD_DAMAGE_INCREASE_AMOUNT = 3;
export const NO_FOOD_PENALTY = 3;

export const CELL_INFO_BY_TYPE = {
  0: { // Field
    color: "rgb(16 108 14)",
    weight: 0.5
  },
  1: { // Desert
    color: "rgb(32 35 196)",
    weight: 0.15
  },
  2: { // Forest
    color: "rgb(91 41 10)",
    weight: 0.4
  },
  3: { // Mountain
    color: "rgb(75 69 66)",
    weight: 0.3
  },
  4: { // Mountain
    color: "rgb(75 69 66)",
    weight: 0.3
  }
}

export const THINGS_THAT_CAN_BE_BUILT = [
  ElementSubType.Farm,
  ElementSubType.Quarry,
  ElementSubType.BrickFactory,
  ElementSubType.SawMill,
  ElementSubType.Village,
  ElementSubType.Sword,
  ElementSubType.Bow,
  ElementSubType.Shield,
  ElementSubType.Cart,
  ElementSubType.Villager
]

export function getBuildingCost(elementToBuildType: ElementSubType) {
  if (!THINGS_THAT_CAN_BE_BUILT.includes(elementToBuildType)) {
    throw new Error(`Unhandled subtype: ${elementToBuildType}`)
  }

  let ingredients = [];
  switch (elementToBuildType) {

    // Buildings
    case ElementSubType.Farm:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubType.Clay,
        count: 2
      })
      break;
    case ElementSubType.Quarry:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 1
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Clay,
        count: 2
      })
      break;
    case ElementSubType.BrickFactory:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubType.Clay,
        count: 2
      })
      break;
    case ElementSubType.SawMill:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 2
      })
      break;
    case ElementSubType.Village:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Clay,
        count: 2
      })
      break;

    // Items
    case ElementSubType.Sword:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 1
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 3
      })
      break;
    case ElementSubType.Bow:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 3
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 1
      })
      break;
    case ElementSubType.Shield:
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 5
      })
      break;
    case ElementSubType.Cart:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 4
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 2
      })
      break;

    case ElementSubType.Villager:
      ingredients.push({
        subType: ElementSubType.Food,
        count: 10
      })
      break;

    default:
      break;
  }

  return ingredients
}

export function getSpecificItemBuildingCost(elementToBuildType: ElementSubType, ingredient: ElementSubType) {
  let buildingCost = getBuildingCost(elementToBuildType);

  for (var item of buildingCost) {
    if (item.subType == ingredient) {
      return item.count;
    }
  }

  throw new Error("Ingredient requested not part of building cost.");
}

export function nameForElementSubType(elemSubType: ElementSubType): string {
  return [
    "Capital",
    "Village",
    "Farm",
    "SawMill",
    "Quarry",
    "BrickFactory",

    "Villager",
    "Trader",

    "Food",
    "Wood",
    "Ore",
    "Clay",
    "Gold",
    "Sword",
    "Bow",
    "Shield",
    "Cart",
    "Horse"
  ][elemSubType]
}

// export function getActionDetails(actionType: number): any {
//   return ELEMENT_ACTION_DETAILS[actionType]
// }

export function colorForTeam(teamVal: TeamColor|null): string {

  if (teamVal === null) {
    return ""
  }

  return [
    "white",
    "purple",
    "red",
    "yellow",
    "blue",
    "green"
  ][teamVal]
}

export function nameForTeamColor(color: TeamColor): string {
  return [
    "White",
    "Purple",
    "Red",
    "Yellow",
    "Blue",
    "Green"
  ][color]
}

export function itemTypeForCellType(cellType: CellType): ElementSubType {
  if (cellType == CellType.Field) {
    return ElementSubType.Food
  }
  if (cellType == CellType.Forest) {
    return ElementSubType.Wood
  }
  if (cellType == CellType.Mountain) {
    return ElementSubType.Ore
  }
  if (cellType == CellType.ClayField) {
    return ElementSubType.Clay
  }
  throw new Error(`unhandled cell type`)
}
