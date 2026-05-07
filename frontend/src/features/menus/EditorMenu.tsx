import { useState } from "react";
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
  setSelectedCell,
  getPlayerTurn,
  getCells, setCells,
} from "../board/boardSlice.ts";

import {
  postUpdateToBackend
} from "@/app/api.js"

import {
  getGameId
} from "../../App"

import {
  nameForTeamColor,
  nameForElementSubType
} from "../board/vars"

import './EditorMenu.css'

import { ButtonSelect }  from "@/components/ButtonSelect/ButtonSelect"
import type { ButtonSelectOption }  from "@/components/ButtonSelect/ButtonSelect"

export default function EditorMenu() {
  const dispatch = useAppDispatch();
  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);
  const playerTurn = useAppSelector(getPlayerTurn);
  
  const [copiedCellContents, setCopiedCellContents]: [any, any] = useState([]);

  const [selectedCellType, setSelectedCellType] = useState("");
  const [selectedElementType, setSelectedElementType] = useState("");
  const [selectedTeamColor, setSelectedTeamColor] = useState("");

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

  function setElements(x: number, y: number, elements: Element[], oldCells: Cell[]): Cell[] {
    let newCells = structuredClone(oldCells);
    for (var cell of newCells) {
      if (cell.x == x && cell.y == y) {
        cell.elements = elements;
      }
    }
    return newCells;
  }

  function setCellTypeAndSave() {
    if (selectedCell === null) {
      return
    }
    let newCells = setCellType(selectedCell.x, selectedCell.y, Number(selectedCellType), cells);
    dispatch(setCells(newCells));
  }

  function addElementAndSave(subType: ElementSubType) {
    if (selectedCell === null) {
      return
    }
    let t = ElementType.Item;
    if (subType == ElementSubType.Trader) {
      t = ElementType.Person;
    }
    let element = objectToElement({type: t, subType: subType});
    let newCells = addElement(selectedCell.x, selectedCell.y, element, cells);
    dispatch(setCells(newCells));
  }

  function copyCellContents() {
    if (selectedCell === null) { return };
    setCopiedCellContents(structuredClone(selectedCell.elements));
  }

  function pasteCellContents() {
    if (selectedCell === null) {
      return
    }
    let newCells = setElements(selectedCell.x, selectedCell.y, copiedCellContents, cells);
    setCopiedCellContents([]);
    dispatch(setCells(newCells));
  }

  function clearSelectedCell() {
    if (!selectedCell) { return };
    let newCells = structuredClone(cells);
    for (var cell of newCells) {
      if (cell.x == selectedCell.x && cell.y == selectedCell.y) {
        cell.elements = cell.elements.filter((el: Element) => [ElementSubType.Capital, ElementSubType.Villager].includes(el.subType));
      }
    }
    dispatch(setCells(newCells));
  }

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
        cell.elements = oldCapitalCell.elements;
      }
      if (cell.x == oldCapitalCell.x && cell.y == oldCapitalCell.y) {
        cell.elements = [];
      }
    }
    dispatch(setCells(newCells));
  }

  function getPlayerCount() {
    let count = 0;
    for (var cell of cells) {
      for (var el of cell.elements) {
        if (el.subType == ElementSubType.Capital) {
          count ++;
        }
      }
    }
    return count;
  }

  const playerCount = getPlayerCount();

  function getMoveCapitalOptions(): ButtonSelectOption[] {
    if (playerCount === null) {
      throw new Error("Missing player count")
    }

    let result = [];

    for (let i=0; i < playerCount; i++) {
      result.push({label: nameForTeamColor(i), value: i})
    }
    return result
  }

  function getCellTypeSelectorOptions(): ButtonSelectOption[] {
    let result = [];
    for (var cellType of Object.entries(CellType)) {
      if (typeof(cellType[1]) == "string") {
        continue
      }
      result.push({label: cellType[0], value: cellType[1]});
    }
    return result
  }

  function getElementSubTypeSelectorOptions(): ButtonSelectOption[] {

    let allowedSubTypes = [
      ElementSubType.Trader,

      ElementSubType.Food,
      ElementSubType.Wood,
      ElementSubType.Ore,
      ElementSubType.Clay,
      ElementSubType.Gold,
      ElementSubType.Sword,
      ElementSubType.Mace,
      ElementSubType.Spear,
      ElementSubType.IronArmor,
      ElementSubType.Bow,
      ElementSubType.Shield,
      ElementSubType.Cart,
      ElementSubType.Horse,
      ElementSubType.Cow,
      ElementSubType.Leather,
      ElementSubType.LeatherArmor
    ];

    let result = [];
    for (var subType of allowedSubTypes) {
      result.push({label: nameForElementSubType(subType), value: Number(subType)});
    }
    return result
  }

  getCellTypeSelectorOptions();

  return (
      <div className="editor-menu">
      {
        selectedCell ?
        <div className="editor-options">
          <ButtonSelect 
            nullVal={{label: "- Cell Type -", value: ""}}
            options={getCellTypeSelectorOptions()}
            value={selectedCellType}
            onChange={setSelectedCellType}
            onButtonClick={() => {
              setCellTypeAndSave();
            }}
          />

          <ButtonSelect
            buttonText={"Add"}
            nullVal={{label: "- Element Type -", value: ""}}
            options={getElementSubTypeSelectorOptions()}
            value={selectedElementType}
            onChange={setSelectedElementType}
            onButtonClick={() => {
              addElementAndSave(Number(selectedElementType));
            }}
          />

          <ButtonSelect
            buttonText={"Move Capital"}
            nullVal={{label: "- Color -", value: ""}}
            options={getMoveCapitalOptions()}
            value={selectedTeamColor}
            onChange={setSelectedTeamColor}
            onButtonClick={() => {
              moveCapital(Number(selectedTeamColor));
            }}
          />

          <div style={{display: "flex", justifyContent: "space-between", gap: "var(--font-size-xxsmall)"}}>
            <button onClick={() => copyCellContents()}>Copy</button>
            <button onClick={() => pasteCellContents()} disabled={copiedCellContents.length == 0}>Paste</button>
            <button onClick={() => {clearSelectedCell()}} className="inverted" style={{color: "red"}}>Clear</button>
          </div>

          <button onClick={() => {dispatch(setSelectedCell(null))}} className="inverted" style={{color: "red"}}>Close</button>
          {
            window.__editing_live_game &&
            <button className="inverted" style={{color: "red"}} onClick={() => {
              postUpdateToBackend(cells, playerTurn, getGameId(), true).then(r => {
                console.log(r);
                alert("succesffuly updated game")
              })
            }}>
              Update Real Game
            </button>
          }
        </div>
        :
        <p>Select a cell.</p>
      }
    </div>
  )
};
