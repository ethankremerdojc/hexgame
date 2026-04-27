import { useAppDispatch, useAppSelector } from '@/app/hooks'

import type { Element, Cell } from "../board/boardTypes"

import {
  CellType,
  ElementType,
  ElementSubType,
  TeamColor,
  objectToElement
} from "../board/boardTypes"

import {
  getSelectedCell,
  getCells, setCells,
} from "../board/boardSlice.ts";

import {
  nameForTeamColor
} from "../board/vars"

import './EditorMenu.css'

export default function EditorMenu() {
  const dispatch = useAppDispatch();
  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);

  function setCellType(x: number, y: number, type: CellType, oldCells: Cell[]): Cell[] {
    let newCells = structuredClone(oldCells);
    for (var cell of newCells) {
      if (cell.x == x && cell.y == y) {
        cell.type = type;
      }
    }
    return newCells;
  }

  function addElement(x: number, y: number, elem: Element, oldCells: Cell[]): Cell[] {
    let newCells = structuredClone(oldCells);
    for (var cell of newCells) {
      if (cell.x == x && cell.y == y) {
        cell.elements.push(elem);
      }
    }
    return newCells;
  }

  function addTraderTile() {
    if (selectedCell === null) {
      throw new Error("selected cell is null")
    }
    let newCells = setCellType(selectedCell.x, selectedCell.y, CellType.Desert, cells);
    let trader = objectToElement({type: ElementType.Person, subType: ElementSubType.Trader});
    newCells = addElement(selectedCell.x, selectedCell.y, trader, newCells);
    dispatch(setCells(newCells));
  };

  function moveCapital(playerTeam: TeamColor) {
    // swap contents of whatever selected cell and current player team capital is
    // unless the selected cell already has stuff on it
    
    if (selectedCell === null) {
      throw new Error("selected cell is null")
    }

    if (selectedCell.elements.length > 0) {
      alert("Can not move capital to somewhere that already has elements.");
      return
    }

    let oldCapitalCell = null;

    for (var cell of cells) {
      let relevantCapitalExists = cell.elements.filter(
        (el: Element) => el.subType == ElementSubType.Capital && el.team == playerTeam).length > 0;

      if (relevantCapitalExists) {
        oldCapitalCell = structuredClone(cell);
      };
    }

    if (!oldCapitalCell) {
      throw new Error("Unable to find old capital cell.");
    }

    let newCells = structuredClone(cells);

    for (var cell of newCells) {
      if (cell.x == selectedCell.x && cell.y == selectedCell.y) {
        console.log("setting sel cell els")
        cell.elements = oldCapitalCell.elements;
      }
      if (cell.x == oldCapitalCell.x && cell.y == oldCapitalCell.y) {
        console.log("setting old cell els")
        cell.elements = [];
      }
    }
    dispatch(setCells(newCells));
  }

  if (window.__IFRAME_CONTEXT__ === undefined) {
    throw new Error("Missing iframe context.")
  }

  const playerCount = window.__IFRAME_CONTEXT__.playerCount;

  if (playerCount === null) {
    throw new Error("Missing player count")
  }

  function getMoveCapitalButtons() {
    if (playerCount === null) {
      throw new Error("Missing player count")
    }

    let result = [];
    for (let i=0; i < playerCount; i++) {
      result.push(
      <button key={`capital-button-${i}`} onClick={() => {
        moveCapital(i)
      }}>
          Move {nameForTeamColor(i)}
      </button>
      )
    }
    return result
  }

  return (
      <div className="editor-menu">
      {
        selectedCell ?
        <div className="editor-options">
          <button onClick={() => addTraderTile()}>
            <span>Add Trader</span>
          </button>
          <div>
            {getMoveCapitalButtons()}
          </div>
        </div>
        :
        <p>Select a cell.</p>
      }
    </div>
  )
};
