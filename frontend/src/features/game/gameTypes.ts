export const TeamColor: object = {
  White: "White",
  Purple: "Purple",
  Red: "Red",
  Yellow: "Yellow",
  Blue: "Blue",
  Green: "Green",
  Black: "Black",
  Brown: "Brown"
}

// Cells

export const CellType: object = {
  Field: "Field",
  Desert: "Desert",
  Forest: "Forest",
  Mountain: "Mountain",
  ClayField: "ClayField"
}

export type Cell = {
  x: number,
  y: number,
  type: CellType,
  elements: Element[]
}

// Elements

export const ElementType = {
  Building: "Building",
  Person: "Person",
  Item: "Item"
}

export const ElementSubType = {
  // buildings 
  Capital: "Capital",
  Village: "Village",

  Farm: "Farm",
  SawMill: "SawMill",
  Quarry: "Quarry",
  BrickFactory: "BrickFactory",

  // persons
  Villager: "Villager",
  Trader: "Trader",

  // items
  Food: "Food",
  Wood: "Wood",
  Ore: "Ore",
  Clay: "Clay",
  Gold: "Gold",

  Sword: "Sword",
  Bow: "Bow",
  Shield: "Shield",
  Cart: "Cart",
  Horse: "Horse",

  Cow: "Cow",
  Leather: "Leather",
  LeatherArmor: "LeatherArmor",

  Spear: "Spear",
  Mace: "Mace",
  IronArmor: "IronArmor",

  Forge: "Forge"
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
  isScavenging: boolean|null,
}

export const ElementAction = {
  Move: "Move",
  Take: "Take",
  Drop: "Drop",
  Fight: "Fight",
  Build: "Build",
  Destroy: "Destroy",
  Work: "Work",
  Heal: "Heal",
  Reproduce: "Reproduce",
  Trade: "Trade",
  Shoot: "Shoot",
  Rename: "Rename",
  Scavenge: "Scavenge"
}
