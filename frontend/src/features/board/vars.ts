export const WORKER_ITEM_GENERATION_AMOUNT = 2;
export const BUILDING_ITEM_GENERATION_AMOUNT = 5;
export const PERSON_MAX_CARRY_WEIGHT = 5;
export const PERSON_BASE_DAMAGE = 4;
export const PERSON_BASE_HEALTH = 9;
export const STARTING_FOOD = 15;
export const STARTING_GOLD = 10;

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

export const ELEMENT_ACTION_DETAILS: ActionDetails[] = [
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
  }
]
