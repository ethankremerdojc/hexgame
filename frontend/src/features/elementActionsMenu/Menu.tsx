import { useState } from "react";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import type { Element, Cell } from "../board/boardTypes"

import {
  ElementType,
  ElementSubType,
  ElementAction,
  objectToElement
} from "../board/boardTypes"

import {
  getCells, setCells,
  setSelectedCell,
  getSelectedElement, setSelectedElement,

  setShowMoveInfo,
  getPlayerTurn,
  setActionHandling, getActionHandling,
  setActionItemsToSelectFrom, getActionItemsToSelectFrom,
  getCurrentPlayerName,
  getLoggedInUsername,
  endTurn, revertToBeginningOfTurn
} from "../board/boardSlice.ts";

import { 
  getBuildingCost,
  nameForElementSubType,
  getActionDetails,
  nameForTeamColor,
  colorForTeam
} from "../board/vars"

import { BoardUtils } from "../board/boardUtils"
import BoardActions from "../board/boardActions"

import { TESTING } from "@/App.tsx"

import './Menu.css'

function ElementActionOptions() {
  const dispatch =          useAppDispatch();
  const cells =             useAppSelector(getCells);
  const selectedElement =   useAppSelector(getSelectedElement);

  const actionHandling =    useAppSelector(getActionHandling);
  const itemsToSelectFrom = useAppSelector(getActionItemsToSelectFrom);

  const [tradeOfferingChosen, setTradeOfferingChosen] = useState(null);

  if (!selectedElement) { return <></> }

  let parentCell: Cell = BoardUtils.getElementParentCell(selectedElement, cells);

  // ==========================================

  let availableActions: ElementAction[] = [];
  if (selectedElement && selectedElement.type == ElementType.Person) {
    availableActions = BoardActions.getAvailableActions(selectedElement, cells);
  };

  let availableActionsInfo = [];
  for (var aa of availableActions) {
    let details = getActionDetails(aa);
    availableActionsInfo.push(details);
  };

  const clearActionData = () => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setSelectedElement(null));
    dispatch(setSelectedCell(null));
    dispatch(setActionHandling(""));
  }

  const itemTransferHandler = (transferType: string, itemId: string, inputId: string) => {
    let newCells;

    let input: any = document.getElementById(inputId);
    if (!input) {
      throw new Error(`Missing input`)
    }
    let val = Number(input.value);

    if (transferType == "drop") {
      newCells = BoardActions.dropItem(selectedElement, itemId, cells, val);
    } else {
      newCells = BoardActions.takeItem(selectedElement, itemId, cells, val);
    }

    dispatch(setCells(newCells));
    clearActionData();
  }

  const dropHandler = () => {
    dispatch(setActionItemsToSelectFrom(selectedElement.heldElements));
  }

  const takeHandler = () => {
    dispatch(setActionItemsToSelectFrom(BoardUtils.getItemsPersonCanTake(selectedElement, cells)));
  }

  const moveHandler = () => {
    dispatch(setShowMoveInfo(true));
  }

  const workHandler = () => {
    let newCells = BoardActions.makePersonWork(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const buildHandler = () => {
    let thingsToBuild = BoardUtils.getAvailableThingsToBuild(parentCell);

    dispatch(setActionItemsToSelectFrom(thingsToBuild));
  }

  const destroyHandler = () => {
    let newCells = BoardActions.destroyBuilding(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const buildElem = (type: ElementType, subType: ElementSubType) => {
    dispatch(setShowMoveInfo(false));
    const newCells = BoardActions.build(selectedElement, type, subType, cells);
    dispatch(setCells(newCells));

    clearActionData();
  }

  const getBuildingDisabled = (buildingType: ElementSubType) => {
    return !BoardUtils.elementsToBuildExistOnTile(buildingType, selectedElement, cells);
  }

  const fightHandler = () => {
    let enemyPersons = BoardUtils.getEnemyPersons(selectedElement, parentCell);
    dispatch(setActionItemsToSelectFrom(enemyPersons));
  }

  const tradeHandler = () => {
    dispatch(setActionItemsToSelectFrom(BoardUtils.getTradeOfferings()));
  }

  const handleTrade = (giveType: ElementSubType, receiveType: ElementSubType) => {
    let depletingResource: Element = objectToElement({type: ElementType.Item, subType: giveType, count: 2});
    let receivingResource: Element = objectToElement({type: ElementType.Item, subType: receiveType, count: 1});
    let newCells = BoardActions.trade(selectedElement, depletingResource, receivingResource, cells);

    setTradeOfferingChosen(null);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const fight = (enemyId: string) => {
    dispatch(setShowMoveInfo(false));
    let enemyElem: Element = parentCell.elements.filter(e => e.id == enemyId)[0];
    const newCells = BoardActions.makePersonsFight(selectedElement, enemyElem, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const healHandler = () => {
    const newCells = BoardActions.healPerson(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const reproduceHandler = () => {
    const newCells = BoardActions.reproducePerson(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const shootHandler = () => {
    dispatch(setActionItemsToSelectFrom(
      BoardUtils.getPersonsThatCanBeShot(selectedElement, cells))
    );
  }

  const shoot = (enemyElem: Element) => {
    let newCells = BoardActions.shoot(selectedElement, enemyElem, cells);
    dispatch(setCells(newCells));
    clearActionData();
  }

  const getActionHandler = (title: string) => {

    let actionFunc;

    if (title == "move") {
      actionFunc = moveHandler
    }
    else if (title == "drop") {
      actionFunc = dropHandler
    }
    else if (title == "take") {
      actionFunc = takeHandler
    }
    else if (title == "build") {
      actionFunc = buildHandler
    }
    else if (title == "destroy") {
      actionFunc = destroyHandler
    }
    else if (title == "fight") {
      actionFunc = fightHandler
    }
    else if (title == "work") {
      actionFunc = workHandler
    }
    else if (title == "heal") {
      actionFunc = healHandler
    }
    else if (title == "reproduce") {
      actionFunc = reproduceHandler
    }
    else if (title == "trade") {
      actionFunc = tradeHandler
    }
    else if (title == "shoot") {
      actionFunc = shootHandler
    } else {
      throw new Error(`Non handled action: ${title}`)
    }

    return () => {
      dispatch(setActionHandling(title));
      actionFunc();
    }
  }

  return (
    <div className="element-action-options">
      { availableActionsInfo.map(aai => {
        return (<div key={aai.title}>
          <button onClick={getActionHandler(aai.title)}>{aai.title}</button>
          <span>{aai.helpText}</span>
        </div>)
      }) }

      { ["drop", "take"].includes(actionHandling) &&
        itemsToSelectFrom &&
        <div>{itemsToSelectFrom.map(item => {
            
            let maxItems;
            if (actionHandling == "drop") {
              maxItems = item.count
            } else {
              maxItems = Math.min(
                BoardUtils.getPersonRemainingCarryWeight(selectedElement),
                item.count
              )
            }

            return (<div id={item.id} key={item.id} style={{
              display: "flex",
              flexDirection: "column",
            }}>
              <p>
                {actionHandling} {nameForElementSubType(item.subType)}
                (1 - {maxItems})
              </p>
              <input type="range" defaultValue={1} min={1} max={maxItems} id={`${item.id}-rangeinput`} />
              <button
                onClick={() => itemTransferHandler(actionHandling, item.id, `${item.id}-rangeinput`)}
              >
                Submit
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
                {nameForElementSubType(item[1])} | COST: {BoardUtils.buildingCostToString(getBuildingCost(item[1]))}
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
                Fight: {nameForTeamColor(person.team)} {nameForElementSubType(person.subType)} ({person.health}H)
              </button>
            )
          })}
        </div>
      }
      {
        actionHandling == "shoot" &&
        <div>
          {itemsToSelectFrom.map(person => {
            return (
              <button key={person.id} onClick={() => { shoot(person) }}>
                Shoot: {nameForTeamColor(person.team)} {nameForElementSubType(person.subType)} ({person.health}H)
              </button>
            )
          })}
        </div>
      }

      {
        actionHandling == "trade" && 

        <div>
        {
        !tradeOfferingChosen ?
          itemsToSelectFrom.map((getOffering: any) => {
            return (
              <button key={getOffering.subType} onClick={() => { setTradeOfferingChosen(getOffering.subType) }}>
                Trade for {nameForElementSubType(getOffering.subType)}
              </button>
            )
          })
        :
          BoardUtils.getItemsPersonCanGive(selectedElement, cells).map(giveOffering => {
            return (<button key={giveOffering} onClick={() => { handleTrade(giveOffering, tradeOfferingChosen) }}>
              Give 2 {nameForElementSubType(giveOffering)}
            </button>)
          })
          
        }
        </div>
      }
    </div>
  )
}

export function ElementActionsMenu() {
  const dispatch = useAppDispatch();
  const playerTurn =        useAppSelector(getPlayerTurn);


  // ==========================================

  const [confirmingEndTurn, setConfirmingEndTurn] = useState(false);
  const [confirmingResetTurn, setConfirmingResetTurn] = useState(false);

  const endTurnHandler = () => {
    dispatch(endTurn());
    setConfirmingEndTurn(false);
  }

  const resetTurnHandler = () => {
    dispatch(revertToBeginningOfTurn());
    setConfirmingResetTurn(false);
  }

  const currentPlayerName = useAppSelector(getCurrentPlayerName);
  const loggedInUsername = useAppSelector(getLoggedInUsername);


  if (currentPlayerName !== loggedInUsername && !TESTING) {
    return (<div className="element-actions-menu">
      <p style={{color: colorForTeam(playerTurn)}}>Current Player's Turn: {currentPlayerName}</p> 
    </div>)
  }

  return (
    <div className="element-actions-menu">
      <p style={{color: colorForTeam(playerTurn)}}>Current Player's Turn: You</p>

      <ElementActionOptions />

      {
        confirmingEndTurn ? <div>
          <button onClick={endTurnHandler}>Really End Turn?</button>
          <button onClick={() => setConfirmingEndTurn(false)}>Cancel</button>
        </div>
        :
        <div><button onClick={() => setConfirmingEndTurn(true)}>End Turn</button></div>
      }

      {
        confirmingResetTurn ? <div>
          <button onClick={resetTurnHandler}>Really Reset Turn?</button>
          <button onClick={() => setConfirmingResetTurn(false)}>Cancel</button>
        </div>
        :
        <div><button onClick={() => setConfirmingResetTurn(true)}>Undo to beginning of turn</button></div>
      }
    </div>
  )
};
