import React, {useState } from "react";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import {

  ElementType,
  nameForElementSubType,
  getActionDetails,

  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getSelectedElement, setSelectedElement,

  getShowMoveInfo, setShowMoveInfo,
  getPlayerTurn, nameForTeamColor,

  ElementAction
} from "../board/boardSlice.ts";

import { BoardUtils } from "../board/boardUtils.ts"

export function ElementActionsMenu() {
  const dispatch = useAppDispatch();
  const cells =             useAppSelector(getCells);
  const selectedCell =      useAppSelector(getSelectedCell);
  const selectedElement =   useAppSelector(getSelectedElement);
  const showMoveInfo =      useAppSelector(getShowMoveInfo);
  const playerTurn =        useAppSelector(getPlayerTurn);

  const [actionHandling, setActionHandling] = useState(null);
  const [itemsToSelectFrom, setItemsToSelectFrom] = useState([]);

  // ==========================================
  let remainingCarryWeight = 0;
  let availableActions: ElementType[] = [];
  if (selectedElement && selectedElement.type == ElementType.Person) {
    availableActions = BoardUtils.getAvailableActions(selectedElement, cells);
    remainingCarryWeight = BoardUtils.getPersonRemainingCarryWeight(selectedElement);
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

  // ==========================================
  



  const itemTransferHandler = (transferType, itemId, itemCount) => {
    let newCells;

    if (transferType == "drop") {

      let dropAmount;

      if (itemCount == "one") {
        dropAmount = 1;
      } else if (itemCount == "max") {
        dropAmount = -1;
      }

      newCells = BoardUtils.dropItem(selectedElement, itemId, cells, dropAmount);

    } else if (transferType == "take") {

      let takeAmount;

      if (itemCount == "one") {
        takeAmount = 1;
      } else if (itemCount == "max") {
        takeAmount = remainingCarryWeight;
      }

      newCells = BoardUtils.takeItem(selectedElement, itemId, cells, takeAmount);
    }

    dispatch(setCells(newCells));

    // Reset everything
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
    dispatch(setShowMoveInfo(true));
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
      <h1>Color: {nameForTeamColor(playerTurn)}</h1>
      { availableActionsInfo.map(aai => {
        return (<div key={aai.title}>
          <button onClick={getActionHandler(aai.title)}>{aai.title}</button>
          <span>{aai.helpText}</span>
        </div>)
      }) }
      {
        itemsToSelectFrom &&
        <ul>{itemsToSelectFrom.map(item => {
            return (<div>
              <button key={item.id+"one"} onClick={() => itemTransferHandler(actionHandling, item.id, "one")}>
                {actionHandling} {nameForElementSubType(item.subType)} (1)
              </button>

              <button key={item.id+"max"} onClick={() => itemTransferHandler(actionHandling, item.id, "max")}>
                {actionHandling} {nameForElementSubType(item.subType)} ({remainingCarryWeight} MAX)
              </button>
            </div>
            )
          })
        }
        </ul>
      }
    </div>
  )
};
