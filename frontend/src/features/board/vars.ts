import type { TeamColor } from "./boardTypes"

import {
  ElementSubType, CellType
} from "./boardTypes"

export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 4;
export const PERSON_MAX_CARRY_WEIGHT = 6;
export const CART_CARRY_WEIGHT_INCREASE = 7; // because cart still weighs 1
export const PERSON_BASE_DAMAGE = 4;
export const PERSON_BASE_HEALTH = 10;
export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

export const NO_FOOD_PENALTY = 3;

export const getDamageAmount = (weapon:ElementSubType|null) => {
  if (weapon === null) return 3;
  if (weapon === ElementSubType.Sword) return 7;
  if (weapon === ElementSubType.Spear) return 5;
  if (weapon === ElementSubType.Mace) return 8;
  if (weapon === ElementSubType.Bow) return 5;

  throw new Error("Unhandled weapon type");
}

export const getArmorAmount = (item:ElementSubType) => {
  if (item==ElementSubType.Shield) return 3;
  if (item==ElementSubType.LeatherArmor) return 2;
  if (item==ElementSubType.IronArmor) return 3;
  return 0
}

export function getTradeCostForSubType(subType: ElementSubType) {
  if (subType == ElementSubType.Horse) { return 7 };
  if (subType == ElementSubType.Cow) { return 6 };
  return 2
}

export const COW_PRODUCING_TILES: CellType[] = [
  CellType.Field,
  CellType.Forest
]

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
  ElementSubType.Forge,
  ElementSubType.Village,
  ElementSubType.Sword,
  ElementSubType.Bow,
  ElementSubType.Shield,
  ElementSubType.Mace,
  ElementSubType.Spear,
  ElementSubType.IronArmor,
  ElementSubType.Cart,
  ElementSubType.Villager,
  ElementSubType.LeatherArmor
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
    case ElementSubType.Forge:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Clay,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Leather,
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
        subType: ElementSubType.Leather,
        count: 1
      })
      break;
    case ElementSubType.Shield:
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubType.Leather,
        count: 1
      })
      break;
    case ElementSubType.LeatherArmor:
      ingredients.push({
        subType: ElementSubType.Leather,
        count: 3
      })
      break;

    case ElementSubType.Mace:
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      break;

    case ElementSubType.Spear:
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 1
      })
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      break;

    case ElementSubType.IronArmor:
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 4
      })
      ingredients.push({
        subType: ElementSubType.Leather,
        count: 2
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
    "Horse",
    "Cow",
    "Leather",
    "Leather Armor",

    "Spear",
    "Mace",
    "Iron Armor",

    "Forge"
  ][elemSubType]
}

export function colorForTeam(teamVal: TeamColor|null): string {
  if (teamVal === null) { return "" }

  return [
    "white",
    "purple",
    "red",
    "yellow",
    "blue",
    "green",
    "black",
    "brown"
  ][teamVal]
}

export function nameForTeamColor(color: TeamColor): string {
  return [
    "White",
    "Purple",
    "Red",
    "Yellow",
    "Blue",
    "Green",
    "Black",
    "Brown"
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
