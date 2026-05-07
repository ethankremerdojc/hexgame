import {
  TeamColor,
  ElementType,
  ElementSubType,
  CellType,
}  from "@/features/game/gameTypes"

import BoardUtils from "@/features/board/boardUtils"

export function getRandomName(): string {
  return randomItem(NAMES_LIST)
}

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
export function getElementId(): string {
  return genRanHex(10);
}

export function updateElemAttributes(elem: Element): Element {
  let newElem = {...elem};

  // items need new ids each type we update, buildings and persons dont
  if (elem.type == ElementType.Item || !elem.id) {
    newElem.id = getElementId();
  }

  if (newElem.type == ElementType.Person) {
    if (!newElem.name) {
      newElem.name = getRandomName();
    }

    if (!newElem.heldElements) {
      newElem.heldElements = [];
    } else {

      let newHeldElements = [];

      for (let h = 0; h < newElem.heldElements.length; h++) {
        let he = {...newElem.heldElements[h]};
        if (!he.count) {
          he.count = 1;
        }

        if (!elem.id) {
          he.id = getElementId();
        }
        newHeldElements.push(he);
      }

      newElem.heldElements = BoardUtils.mergeItemElements(newHeldElements);
    }

    if (newElem.hasActionAvailable === null || newElem.hasActionAvailable === undefined) {
      newElem.hasActionAvailable = true;
    }
  }

  return newElem;
}

function updateCellElementPositions(elements: Element[]): Element[] {

  let personElements = [], buildingElements = [], itemElements = [];

  for (var elem of elements) {
    if (elem.type == ElementType.Person) {
      personElements.push(elem);
    }
    if (elem.type == ElementType.Building) {
      buildingElements.push(elem);
    }
    if (elem.type == ElementType.Item) {
      itemElements.push(elem);
    }
  }

  let newElements = [];

  if (buildingElements.length > 0) {
    let building = {...buildingElements[0]};
    building.position = 0;
    newElements.push(building);
  }

  for (let i=0; i < personElements.length; i++) {
    let newElem = {...personElements[i]};
    if (buildingElements.length == 0) {
      newElem.position = i;
    } else {
      newElem.position = i + 1;
    }
    newElements.push(newElem);
  }

  return [...newElements, ...BoardUtils.mergeItemElements(itemElements)];
}

function updateCellElements(cell: Cell): Element[] {
  let newElements = [...cell.elements];
  newElements = newElements.map(el => objectToElement(el));
  newElements = updateCellElementPositions(newElements);

  let result = [];

  for (var elem of newElements) {
    result.push(updateElemAttributes(elem));
  }

  return result;
}

export function prepareCellsForStateSave(cells: Cell[]): Cell[] {
  let newCells = [];

  for (var cell of cells) {
    let newCell = {...cell};
    let newElements = updateCellElements(newCell);
    newCell.elements = newElements;
    newCells.push(newCell);
  }

  return newCells
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


