import type { TeamColors } from "@/features/game/gameTypes"

import {
  ElementSubTypes, CellTypes
} from "@/features/game/gameTypes"

export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 4;
export const PERSON_MAX_CARRY_WEIGHT = 6;
export const CART_CARRY_WEIGHT_INCREASE = 7; // because cart still weighs 1
export const PERSON_BASE_DAMAGE = 4;
export const PERSON_BASE_HEALTH = 10;
export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

export const NO_FOOD_PENALTY = 3;

export const SCAVENGE_CHANCES = {
  MATERIAL: 0.8,
  COMMON: 0.15,
  RARE: 0.05
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

export const COW_PRODUCING_TILES: CellTypes[] = [
  CellTypes.Field,
  CellTypes.Forest
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
  ElementSubTypes.Farm,
  ElementSubTypes.Quarry,
  ElementSubTypes.BrickFactory,
  ElementSubTypes.SawMill,
  ElementSubTypes.Forge,
  ElementSubTypes.Village,
  ElementSubTypes.Sword,
  ElementSubTypes.Bow,
  ElementSubTypes.Shield,
  ElementSubTypes.Mace,
  ElementSubTypes.Spear,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Cart,
  ElementSubTypes.Villager,
  ElementSubTypes.LeatherArmor
]

export const COMMON_SCAVENGABLE_ITEMS: ElementSubTypes[] = [
  ElementSubTypes.Spear,
  ElementSubTypes.Bow,
  ElementSubTypes.LeatherArmor
];

export const RARE_SCAVENGABLE_ITEMS: ElementSubTypes[] = [
  ElementSubTypes.Mace,
  ElementSubTypes.Sword,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Cart
];

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

export function nameForElementSubTypes(elemSubType: ElementSubTypes): string {
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

export function colorForTeam(teamVal: TeamColors|null): string {
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

export function nameForTeamColors(color: TeamColors): string {
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
