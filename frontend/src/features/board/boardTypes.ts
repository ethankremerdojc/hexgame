export enum TeamColor {
  White,
  Purple,
  Red,
  Yellow,
  Blue,
  Green
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
  Cart
}

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

  // Person only
  heldElements: Element[],
  health: number,
  armor: number|null,
  weight: number|null,
  hasActionAvailable: boolean|null,
  isWorking: boolean|null,
}

export function objectToElement(obj: any): Element {
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
  if (obj.hasActionAvailable === undefined) {
    obj.hasActionAvailable = null;
  } if (obj.health === undefined) {
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
