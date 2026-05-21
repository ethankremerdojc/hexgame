import {
  ElementSubTypes, CellTypes,
} from "@/features/game/gameTypes"

export const MATERIAL_ELEMENT_SUBTYPES: number[] = [
    ElementSubTypes.Wood,
    ElementSubTypes.Food,
    ElementSubTypes.Ore,
    ElementSubTypes.Clay,
    ElementSubTypes.Leather
];

export const ELEMENTS_YOU_SEE_IN_PERSON_UI: number[] = [
  ...MATERIAL_ELEMENT_SUBTYPES, ElementSubTypes.Cow
]

export const USABLE_ITEMS: number[] = [
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

export const ITEMS_YOU_CAN_HOLD_ONE_OF: number[] = [...USABLE_ITEMS, ElementSubTypes.Cow]

export const WEAPON_SUBTYPES: number[] = [
  ElementSubTypes.Sword,
  ElementSubTypes.Spear,
  ElementSubTypes.Mace,
  ElementSubTypes.Bow,
]

export const THIN_RENDERED_ELEMENTS: number[] = [
  ...WEAPON_SUBTYPES, ElementSubTypes.Shield
]

export const SHORT_RENDERED_ELEMENTS: number[] = [
  ElementSubTypes.LeatherArmor,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Food,
  ElementSubTypes.Clay,
]

export const ARMOR_SUBTYPES: number[] = [
  ElementSubTypes.Shield,
  ElementSubTypes.LeatherArmor,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Spear,
]

export const FORGE_REQUIRED_ITEMS: number[] = [
  ElementSubTypes.Mace,
  ElementSubTypes.Sword,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Shield,
]

export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 4;

export const PERSON_MAX_CARRY_WEIGHT = 6;
export const CART_CARRY_WEIGHT_INCREASE = 9;

export const PERSON_BASE_DAMAGE = 2;
export const PERSON_BASE_HEALTH = 7;

export const CAPITAL_DEFENCE_BUFF = 1;
export const MACE_ARMOR_DEPLETION_AMOUNT = 2;

export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

export const NO_FOOD_PENALTY = 2;

export const SCAVENGE_CHANCES = {
  MATERIAL: 0.8,
  COMMON: 0.15,
  RARE: 0.05
}

export const COW_PRODUCING_TILES: number[] = [
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

export const COMMON_SCAVENGABLE_ITEMS: number[] = [
  ElementSubTypes.Spear,
  ElementSubTypes.Bow,
  ElementSubTypes.LeatherArmor
];

export const RARE_SCAVENGABLE_ITEMS: number[] = [
  ElementSubTypes.Mace,
  ElementSubTypes.Sword,
  ElementSubTypes.IronArmor,
  ElementSubTypes.Cart
];


