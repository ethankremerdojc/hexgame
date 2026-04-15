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

  // persons
  Worker,

  // items
  Food,
  Wood,
  Ore,
  Gold,

  Sword,
  Bow,
  Shield
}

export enum CellType {
  Field,
  Desert,
  Forest,
  Mountain
}

export type Element = {
  type: ElementType,
  subType: ElementSubType,

  team: TeamColor|null,
  position: HexPosition|null,
  id: string,
  count: number|null,

  // Person only
  heldElements: Element[],
  health: number|null,
  armor: number|null,
  weight: number|null,
  hasActionAvailable: boolean|null,
  isWorking: boolean|null,
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
  Work
}
