export enum TeamColor {
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

export enum ElementType {
  Building,
  Person,
  Item
}

export enum ElementSubType {
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
  LeatherArmor
}

export const MATERIAL_ELEMENT_SUBTYPES: ElementSubType[] = [
    ElementSubType.Wood,
    ElementSubType.Food,
    ElementSubType.Ore,
    ElementSubType.Clay,
    ElementSubType.Leather
];

export const ITEMS_YOU_CAN_HOLD_ONE_OF: ElementSubType[] = [
  ElementSubType.Sword,
  ElementSubType.Bow,
  ElementSubType.Shield,
  ElementSubType.Cart,
  ElementSubType.Horse,
  ElementSubType.Cow,
  ElementSubType.LeatherArmor
]

export enum CellType {
  Field,
  Desert,
  Forest,
  Mountain,
  ClayField
}

export type Element = {
  type: ElementType,
  subType: ElementSubType,

  team: TeamColor|null,
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

}

export function getHandsRequiredToHold(elementSubType: ElementSubType) {
  switch (elementSubType) {
    case ElementSubType.Cart:
      return 2
      break;
    case ElementSubType.Horse:
      return 1
      break;
    case ElementSubType.Cow:
      return 1
      break;
    case ElementSubType.Bow:
      return 1
      break;
    case ElementSubType.Shield:
      return 1
      break;
    case ElementSubType.Sword:
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
  type: CellType,
  elements: Element[]
}

export type Coordinate = {
  x: number,
  y: number
}


export enum ElementAction {
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
  Shoot
}
