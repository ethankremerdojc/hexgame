import React, {useState } from "react";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import {

  ElementType,
  nameForElementSubType,
  getActionDetails,

  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getSelectedElement, setSelectedElement,

  ElementAction
} from "../board/boardSlice.ts";

import { BoardUtils } from "../board/boardUtils.ts"

export function ElementActionsMenu() {

  const dispatch = useAppDispatch();

  const cells =             useAppSelector(getCells);
  const selectedCell =      useAppSelector(getSelectedCell);
  const selectedElement =   useAppSelector(getSelectedElement);

  let availableActions: ElementType[] = [];
  if (selectedElement && selectedElement.type == ElementType.Person) {
    availableActions = BoardUtils.getAvailableActions(selectedElement, cells);
  }

  let availableActionsInfo = [];
  for (var aa of availableActions) {
    let details = getActionDetails(aa);

    if (!details.depletesAction) {
      availableActionsInfo.push(details);
    } else {
      if (selectedElement.type == ElementType.Person && selectedElement.hasActionAvailable) {
        availableActionsInfo.push(details);
      }
    }
  };

  const [actionHandling, setActionHandling] = useState(null);
  const [itemsToSelectFrom, setItemsToSelectFrom] = useState([]);

  const itemTransferHandler = (transferType, itemId) => {
    let newCells;
    if (transferType == "drop") {
      newCells = BoardUtils.dropItem(selectedElement, itemId, cells);
    }
    if (transferType == "take") {
      newCells = BoardUtils.takeItem(selectedElement, itemId, cells);
    }
    dispatch(setCells(newCells));
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
    setActionHandling(null);
    setItemsToSelectFrom([]);
  }

  const dropHandler = () => {
    setActionHandling("drop");
    setItemsToSelectFrom(selectedElement.heldElements);
  }

  const takeHandler = () => {
    setActionHandling("take");
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    setItemsToSelectFrom(parentCell.elements.filter(e => e.type == ElementType.Item));
  }

  const moveHandler = () => {
    console.log("moving to cell");
  }

  const getActionHandler = (title) => {
    if (title == "move") {
      return moveHandler
    }
    if (title == "drop") {
      return dropHandler
    }
    if (title == "take") {
      return takeHandler
    }
    return () => { console.log("non handled action", title) }
  }

  return (
    <div className="element-actions-menu">
      { availableActionsInfo.map(aai => {
        return (<div key={aai.title}>
          <button onClick={getActionHandler(aai.title)}>{aai.title}</button>
          <span>{aai.helpText}</span>
        </div>)
      }) }
      {
        itemsToSelectFrom &&
        <ul>{itemsToSelectFrom.map(item => {
            return (<button key={item.id} onClick={() => itemTransferHandler(actionHandling, item.id)}>
              {nameForElementSubType(item.subType)} : {item.count}
            </button>)})
        }
        </ul>
      }
    </div>
  )
};
