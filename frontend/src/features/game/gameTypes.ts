export const TeamColors: object = {
  "White": 0,
  "Purple": 1,
  "Red": 2,
  "Yellow": 3,
  "Blue": 4,
  "Green": 5,
  "Black": 6,
  "Brown": 7
}

export const CellTypes: object = {
  "Field": 0,
  "Desert": 1,
  "Forest": 2,
  "Mountain": 3,
  "ClayField": 4
}

export type Cell = {
  x: number,
  y: number,
  type: number,
  elements: Element[]
}

// Elements

export const ElementTypes = {
  "Building": 0,
  "Person": 1,
  "Item": 2
}

export const ElementSubTypes = {
  // buildings 
  "Capital": 0,
  "Village": 1,

  "Farm": 2,
  "SawMill": 3,
  "Quarry": 4,
  "BrickFactory": 5,

  // persons
  "Villager": 6,
  "Trader": 7,

  // items
  "Food": 8,
  "Wood": 9,
  "Ore": 10,
  "Clay": 11,
  "Gold": 12,

  "Sword": 13,
  "Bow": 14,
  "Shield": 15,
  "Cart": 16,
  "Horse": 17,

  "Cow": 18,
  "Leather": 19,
  "LeatherArmor": 20,

  "Spear": 21,
  "Mace": 22,
  "IronArmor": 23,

  "Forge": 24
}

export type Element = {
  type: number,
  subType: number,

  team: number|null,
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

export const ElementActions = {
  "Move": 0,
  "Take": 1,
  "Drop": 2,
  "Fight": 3,
  "Build": 4,
  "Destroy": 5,
  "Work": 6,
  "Heal": 7,
  "Reproduce": 8,
  "Trade": 9,
  "Shoot": 10,
  "Rename": 11,
  "Scavenge": 12
}
