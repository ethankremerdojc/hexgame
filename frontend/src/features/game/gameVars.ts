import type {
  Cell, Element
} from "@/features/game/gameTypes"

import {
  ElementTypes, ElementSubTypes, ElementActions, CellTypes,
} from "@/features/game/gameTypes"

export const MATERIAL_ELEMENT_SUBTYPES: ElementSubTypes[] = [
    ElementSubTypes.Wood,
    ElementSubTypes.Food,
    ElementSubTypes.Ore,
    ElementSubTypes.Clay,
    ElementSubTypes.Leather
];

export const USABLE_ITEMS: ElementSubTypes[] = [
  ElementSubTypes.Sword,
  ElementSubTypes.Bow,
  ElementSubTypes.Shield,
  ElementSubTypes.Spear,
  ElementSubTypes.Mace,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Cart,
  ElementSubTypes.Horse,
  ElementSubTypes.LeatherArmor
]

export const ITEMS_YOU_CAN_HOLD_ONE_OF: ElementSubTypes[] = [...USABLE_ITEMS, ElementSubTypes.Cow]

export const WEAPON_SUBTYPES: ElementSubTypes[] = [
  ElementSubTypes.Sword,
  ElementSubTypes.Spear,
  ElementSubTypes.Mace,
  ElementSubTypes.Bow,
]

export const ARMOR_SUBTYPES: ElementSubTypes[] = [
  ElementSubTypes.Shield,
  ElementSubTypes.LeatherArmor,
  ElementSubTypes.IronArmor
]

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


