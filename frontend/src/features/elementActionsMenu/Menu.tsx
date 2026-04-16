import React, {useState } from "react";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import {
  ElementType,
  ElementSubType,
  ElementAction
} from "../board/boardTypes"

import {
  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getSelectedElement, setSelectedElement,

  getShowMoveInfo, setShowMoveInfo,
  getPlayerTurn,
  setActionHandling, getActionHandling,
  setActionItemsToSelectFrom, getActionItemsToSelectFrom,
  endTurn,
} from "../board/boardSlice.ts";

import { getBuildingCost } from "../board/vars"

import { BoardUtils } from "../board/boardUtils.ts"

export function ElementActionsMenu() {
  const dispatch = useAppDispatch();
  const cells =             useAppSelector(getCells);
  const selectedCell =      useAppSelector(getSelectedCell);
  const selectedElement =   useAppSelector(getSelectedElement);
  const showMoveInfo =      useAppSelector(getShowMoveInfo);
  const playerTurn =        useAppSelector(getPlayerTurn);

  const actionHandling =    useAppSelector(getActionHandling);
  const itemsToSelectFrom = useAppSelector(getActionItemsToSelectFrom);

  // TODOz
  //Move these two to redux state so that clicking off of them during action doesn't break things

  // ==========================================
  let remainingCarryWeight = 0;
  let maxTakeAmount = 0;

  let availableActions: ElementType[] = [];
  if (selectedElement && selectedElement.type == ElementType.Person) {
    availableActions = BoardUtils.getAvailableActions(selectedElement, cells);
    remainingCarryWeight = BoardUtils.getPersonRemainingCarryWeight(selectedElement);
  };

  let availableActionsInfo = [];
  for (var aa of availableActions) {
    let details = BoardUtils.getActionDetails(aa);

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

      let relevantItem = selectedElement.heldElements.filter(el => el.id == itemId)[0];

      if (itemCount == "one") {
        dropAmount = 1;
      } else if (itemCount == "max") {
        dropAmount = relevantItem.count;
      }

      newCells = BoardUtils.dropItem(selectedElement, itemId, cells, dropAmount);

    } else if (transferType == "take") {
      let takeAmount;

      let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
      let parentCellRelevantItem = parentCell.elements.filter(el => el.id == itemId)[0];

      if (itemCount == "one") {
        takeAmount = 1;
      } else if (itemCount == "max") {
        takeAmount = Math.min(remainingCarryWeight, parentCellRelevantItem.count);
      }

      newCells = BoardUtils.takeItem(selectedElement, itemId, cells, takeAmount);
    }

    dispatch(setCells(newCells));
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
    dispatch(setActionHandling(null));
    dispatch(setActionItemsToSelectFrom([]));
  }

  const dropHandler = () => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionHandling("drop"));
    dispatch(setActionItemsToSelectFrom(selectedElement.heldElements));
  }

  const takeHandler = () => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionHandling("take"));
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    dispatch(setActionItemsToSelectFrom(parentCell.elements.filter(e => e.type == ElementType.Item)));
  }

  const moveHandler = () => {
    dispatch(setShowMoveInfo(true));
  }

  const workHandler = () => {
    let newCells = BoardUtils.makePersonWork(selectedElement, cells);
    dispatch(setCells(newCells));
    dispatch(setActionHandling(null));
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
  }

  const buildHandler = () => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionHandling("build"));
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    let thingsToBuild = BoardUtils.getAvailableThingsToBuild(parentCell);

    dispatch(setActionItemsToSelectFrom(thingsToBuild));
  }

  const buildElem = (type, subType) => {
    dispatch(setShowMoveInfo(false));
    const newCells = BoardUtils.build(selectedElement, type, subType, cells);
    dispatch(setCells(newCells));

    dispatch(setActionHandling(null));
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
  }

  const getBuildingDisabled = (buildingType) => {
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    return !BoardUtils.elementsToBuildExistOnTile(buildingType, parentCell, selectedElement);
  }

  const fightHandler = () => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionHandling("fight"));
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    let enemyPersons = BoardUtils.getEnemyPersons(selectedElement, parentCell);
    dispatch(setActionItemsToSelectFrom(enemyPersons));
  }

  const fight = (enemyId) => {
    dispatch(setShowMoveInfo(false));
    let parentCell = BoardUtils.getElementParentCell(selectedElement, cells);
    let enemyElem = parentCell.elements.filter(e => e.id == enemyId)[0];
    const newCells = BoardUtils.makePersonsFight(selectedElement, enemyElem, cells);
    dispatch(setCells(newCells));

    dispatch(setActionHandling(null));
    dispatch(setActionItemsToSelectFrom([])); 
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
  }

  const endTurnHandler = () => {
    dispatch(endTurn());
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
    if (title == "build") {
      return buildHandler
    }
    if (title == "fight") {
      return fightHandler
    }
    if (title == "work") {
      return workHandler
    }
    return () => { console.log("non handled action", title) }
  }

  return (
    <div className="element-actions-menu">
      <p>Color: {BoardUtils.nameForTeamColor(playerTurn)}</p>

      { availableActionsInfo.map(aai => {
        return (<div key={aai.title}>
          <button onClick={getActionHandler(aai.title)}>{aai.title}</button>
          <span>{aai.helpText}</span>
        </div>)
      }) }

      { ["drop", "take"].includes(actionHandling) &&
        itemsToSelectFrom &&
        <div>{itemsToSelectFrom.map(item => {
            return (<div id={item.key}>
              <button onClick={() => itemTransferHandler(actionHandling, item.id, "one")}>
                {actionHandling} {BoardUtils.nameForElementSubType(item.subType)} (1)
              </button>

              <button onClick={() => itemTransferHandler(actionHandling, item.id, "max")}>
                {actionHandling} {BoardUtils.nameForElementSubType(item.subType)} (MAX:
                {
                  actionHandling == "take" ? <>
                  {Math.min(remainingCarryWeight, item.count)}
                  </>
                  :
                  <>{item.count}</>
                }
                )
              </button>
            </div>
            )
          })
        }
        </div>
      }
        
      {
        actionHandling == "build" &&
        <div>
          {itemsToSelectFrom.map(item => {
            return (
              <button key={item[1]+item[0]} onClick={() => { buildElem(item[0], item[1]) }} disabled={getBuildingDisabled(item[1])}>
                {BoardUtils.nameForElementSubType(item[1])} | COST: {BoardUtils.buildingCostToString(getBuildingCost(item[1]))}
              </button>
            )
          })}
        </div>
      }
      {
        actionHandling == "fight" &&
        <div>
          {itemsToSelectFrom.map(person => {
            return (
              <button key={person.id} onClick={() => { fight(person.id) }}>
                Fight: {BoardUtils.nameForTeamColor(person.team)} {BoardUtils.nameForElementSubType(person.subType)} ({person.health}H)
              </button>
            )
          })}
        </div>
      }

      <button onClick={endTurnHandler}>End Turn</button>
    </div>
  )
};
