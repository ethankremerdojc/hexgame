export enum TeamColors {
  White,
  Purple,
  Red,
  Yellow,
  Blue,
  Green,
  Black,
  Brown
}

export enum HexPosition {
  Center,
  Top,
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

export enum ElementTypes {
  Building,
  Person,
  Item
}

export enum ElementSubTypes {
  // buildings 
  Capital,
  Village,

  Farm,
  SawMill,
  Quarry,
  BrickFactory,

  // persons
  Villager,
  Trader,

  // items
  Food,
  Wood,
  Ore,
  Clay,
  Gold,

  Sword,
  Bow,
  Shield,
  Cart,
  Horse,

  Cow,
  Leather,
  LeatherArmor,

  Spear,
  Mace,
  IronArmor,

  Forge
}
//
// function getElementTypesForElementSubTypes(subType: ElementSubTypes) {
//   switch (subType) {
//   case ElementSubTypes.Capital:
//   case ElementSubTypes.Village:
//   case ElementSubTypes.Farm:
//   case ElementSubTypes.SawMill:
//   case ElementSubTypes.Quarry:
//   case ElementSubTypes.BrickFactory:
//       return ElementTypes.Building;
//
//   case ElementSubTypes.Villager:
//   case ElementSubTypes.Trader:
//       return ElementTypes.Person;
//
//   case ElementSubTypes.Food:
//   case ElementSubTypes.Wood:
//   case ElementSubTypes.Ore:
//   case ElementSubTypes.Clay:
//   case ElementSubTypes.Gold:
//   case ElementSubTypes.Sword:
//   case ElementSubTypes.Bow:
//   case ElementSubTypes.Shield:
//   case ElementSubTypes.Cart:
//   case ElementSubTypes.Horse:
//   case ElementSubTypes.Cow:
//   case ElementSubTypes.Leather:
//   case ElementSubTypes.LeatherArmor:
//     return ElementTypes.Item;
//
//   default:
//      throw new Error("Unknown element sub type.");
//   }
// }

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

export enum CellTypes {
  Field,
  Desert,
  Forest,
  Mountain,
  ClayField
}

export type Element = {
  type: ElementTypes,
  subType: ElementSubTypes,

  team: TeamColors|null,
  position: HexPosition|null,
  id: string,
  count: number,
  name: string|null,

  // Person only
  heldElements: Element[],
  health: number,
  weight: number|null,
  hasActionAvailable: boolean|null,
  isWorking: boolean|null,
  isScavenging: boolean|null,
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

// maybe make this hve a coordinate inside? 
export type Cell = {
  x: number,
  y: number,
  type: CellTypes,
  elements: Element[]
}

export type Coordinate = {
  x: number,
  y: number
}


export enum ElementActions {
  Move,
  Take,
  Drop,
  Fight,
  Build,
  Destroy,
  Work,
  Heal,
  Reproduce,
  Trade,
  Shoot,
  Rename,
  Scavenge
}
