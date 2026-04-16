import {
  ElementType, ElementSubType, CellType
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

export const CELL_INFO_BY_TYPE = {
  0: { // Field
    color: "rgb(16 108 14)",
    weight: 1
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
    weight: 0.25
  }
}

export const ELEMENT_ACTION_DETAILS: object[] = [
  { // Move
    title: "move",
    depletesAction: true,
    helpText: "Move to an adjacent tile.",
  },
  { // Take
    title: "take",
    depletesAction: false,
    helpText: "Pickup an item at the current cell position.",
  },
  { // Drop
    title: "drop",
    depletesAction: false,
    helpText: "Drop an item at the current cell position.",
  },
  { // Fight
    title: "fight",
    depletesAction: true,
    helpText: "Do damage to another team's person."
  },
  { // Build
    title: "build",
    depletesAction: true,
    helpText: "Build a structure with the resources at the current tile."
  },
  { // Destroy
    title: "destroy",
    depletesAction: true,
    helpText: "Destroy a structure at the current tile."
  },
  { // Work
    title: "work",
    depletesAction: true,
    helpText: "Work on the current tile for more resources."
  },
  { // Heal
    title: "heal",
    depletesAction: false,
    helpText: "Use 1 food to heal person by 1 health."
  },
  { // Reproduce
    title: "reproduce",
    depletesAction: true,
    helpText: "Create another person with two persons."
  }
]

export function getBuildingCost(elemSubType: ElementType) {
  let ingredients = [];

  switch (elemSubType) {

    // Buildings
    case ElementSubType.Farm:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 5
      })
      break;
    case ElementSubType.Quarry:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 3
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
        count: 4
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
    case ElementSubType.Cart:
      ingredients.push({
        subType: ElementSubType.Wood,
        count: 2
      })
      ingredients.push({
        subType: ElementSubType.Ore,
        count: 1
      })





    case ElementSubType.Worker:
      ingredients.push({
        subType: ElementSubType.Food,
        count: 10
      })
    default:
      break;
  }

  return ingredients
}

export function nameForElementSubType(elemSubType: ElementType): string {
  return [
    "Capital",
    "Village",
    "Farm",
    "SawMill",
    "Quarry",
    "Villager",
    "Food",
    "Wood",
    "Ore",
    "Gold",
    "Sword",
    "Bow",
    "Shield",
    "Cart"
  ][elemSubType]
}

export function getActionDetails(actionType: number): ActionDetails {
  return ELEMENT_ACTION_DETAILS[actionType]
}

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

export function itemTypeForCellType(cellType: CellType): ElementSubType|null {
  if (cellType == CellType.Field) {
    return ElementSubType.Food
  }
  if (cellType == CellType.Forest) {
    return ElementSubType.Wood
  }
  if (cellType == CellType.Mountain) {
    return ElementSubType.Ore
  }

  return null
}
