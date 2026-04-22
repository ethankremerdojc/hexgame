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
  endTurn, revertToBeginningOfTurn,
  updateElemAttributes
} from "../board/boardSlice.ts";

import { 
  getBuildingCost,
  nameForElementSubType,
  nameForTeamColor,
  colorForTeam,
  getSpecificItemBuildingCost
} from "../board/vars"

import { BoardUtils } from "../board/boardUtils"
import BoardActions from "../board/boardActions"

import { TESTING } from "@/App.tsx"

import { getSvgForSubType } from "../board/boardRenderer"

import './Menu.css'

import buildSvg from "../board/svg/actions/buildIcon.svg";
import dropSvg from "../board/svg/actions/dropIcon.svg";
import fightSvg from "../board/svg/actions/fightIcon.svg";
import moveSvg from "../board/svg/actions/moveIcon.svg";
import reproduceSvg from "../board/svg/actions/reproduceIcon.svg";
import shootSvg from "../board/svg/actions/shootIcon.svg";
import takeSvg from "../board/svg/actions/takeIcon.svg";
import tradeSvg from "../board/svg/actions/tradeIcon.svg";
import workSvg from "../board/svg/actions/workIcon.svg";
import backSvg from "../board/svg/actions/backIcon.svg";

export const ELEMENT_ACTION_DETAILS: object[] = [
  { // Move
    title: "move",
    helpText: "Move to an adjacent tile.",
  },
  { // Take
    title: "take",
    helpText: "Pickup an item at the current cell position.",
  },
  { // Drop
    title: "drop",
    helpText: "Drop an item at the current cell position.",
  },
  { // Fight
    title: "fight",
    helpText: "Do damage to another team's person."
  },
  { // Build
    title: "build",
    helpText: "Build a structure with the resources at the current tile."
  },
  { // Destroy
    title: "destroy",
    helpText: "Destroy a structure at the current tile."
  },
  { // Work
    title: "work",
    helpText: "Work on the current tile for more resources."
  },
  { // Heal
    title: "heal",
    helpText: "Use 1 food to heal person by 1 health."
  },
  { // Reproduce
    title: "clone",
    helpText: "Create another person with two persons."
  },
  { // trade
    title: "trade",
    helpText: "Trade with the desert trader"
  },
  { // shoot
    title: "shoot",
    helpText: "Shoot someone in adjacent tile"
  }
]

export function getActionDetails(actionType: number): any {
  return ELEMENT_ACTION_DETAILS[actionType]
}

function iconForActionType(actionType: string) {
  switch (actionType) {
    case "build":
      return buildSvg
      break;
    case "drop":
      return dropSvg
      break;
    case "fight":
      return fightSvg
      break;
    case "move":
      return moveSvg
      break;
    case "clone":
      return reproduceSvg
      break;
    case "shoot":
      return shootSvg
      break;
    case "take":
      return takeSvg
      break;
    case "trade":
      return tradeSvg
      break;
    case "work":
      return workSvg
      break;
    default:
      break;
  }
}

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
    details.icon = iconForActionType(details.title);
    availableActionsInfo.push(details);
  };

  const clearActionData = (newCells: Cell[]) => {
    dispatch(setShowMoveInfo(false));
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setSelectedCell(null));
    dispatch(setActionHandling(""));


    // need to re-get selected element since it has new info
    let newParent = newCells.filter((c: Cell) => c.x == parentCell.x && c.y == parentCell.y)[0];

    let newSelEl = newParent.elements.filter((el: Element) => el.id == selectedElement.id)[0];

    newSelEl = updateElemAttributes(newSelEl, newParent);

    if (newSelEl.hasActionAvailable) {
      dispatch(setSelectedElement(newSelEl));
    } else {
      dispatch(setSelectedElement(null));
    }
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
    clearActionData(newCells);
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
    dispatch(setActionItemsToSelectFrom(["Make Villager work?"]));
  }

  const work = () => {
    let newCells = BoardActions.makePersonWork(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const buildHandler = () => {
    let thingsToBuild = BoardUtils.getAvailableThingsToBuild(parentCell);

    dispatch(setActionItemsToSelectFrom(thingsToBuild));
  }

  const destroyHandler = () => {
    let newCells = BoardActions.destroyBuilding(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const buildElem = (type: ElementType, subType: ElementSubType) => {
    dispatch(setShowMoveInfo(false));
    const newCells = BoardActions.build(selectedElement, type, subType, cells);
    dispatch(setCells(newCells));

    clearActionData(newCells);
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

  const backHandler = () => {
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setActionHandling(""));
  }

  const handleTrade = (giveType: ElementSubType, receiveType: ElementSubType, giveAmount: number) => {
    let depletingResource: Element = objectToElement({type: ElementType.Item, subType: giveType, count: giveAmount});
    let receivingResource: Element = objectToElement({type: ElementType.Item, subType: receiveType, count: 1});
    let newCells = BoardActions.trade(selectedElement, depletingResource, receivingResource, cells);

    setTradeOfferingChosen(null);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const fight = (enemyId: string) => {
    dispatch(setShowMoveInfo(false));
    let enemyElem: Element = parentCell.elements.filter(e => e.id == enemyId)[0];
    const newCells = BoardActions.makePersonsFight(selectedElement, enemyElem, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const healHandler = () => {
    const newCells = BoardActions.healPerson(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const cloneHandler = () => {
    dispatch(setActionItemsToSelectFrom(["Clone Villager?"]));
  }

  const clone = () => {
    const newCells = BoardActions.reproducePerson(selectedElement, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
  }

  const shootHandler = () => {
    dispatch(setActionItemsToSelectFrom(
      BoardUtils.getPersonsThatCanBeShot(selectedElement, cells))
    );
  }

  const shoot = (enemyElem: Element) => {
    let newCells = BoardActions.shoot(selectedElement, enemyElem, cells);
    dispatch(setCells(newCells));
    clearActionData(newCells);
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
    else if (title == "clone") {
      actionFunc = cloneHandler
    }
    else if (title == "trade") {
      actionFunc = tradeHandler
    }
    else if (title == "shoot") {
      actionFunc = shootHandler
    }

    else if (title == "back") {
      actionFunc = backHandler
    }
    else {
      throw new Error(`Non handled action: ${title}`)
    }

    return () => {
      dispatch(setActionHandling(title));
      actionFunc();
    }
  }

  const getActionVerb = (actionHandling: string) => {
    let verb = actionHandling;
    if (verb.endsWith("e")) {
      verb = verb.slice(0, -1);
    }
    if (verb == "drop") {
      return "dropping"
    }
    return verb + "ing"
  }

  function DropTakeInput({actionHandling, item}: {actionHandling: string, item: any}) {

    if (!selectedElement) {
      throw new Error("Can't render droptake without selectedElement");
    }

    let maxItems;

    if (actionHandling == "drop") {
      maxItems = item.count
    } else {
      maxItems = Math.min(
        BoardUtils.getPersonRemainingCarryWeight(selectedElement),
        item.count
      )
    }

    let [labelCount, setLabelCount] = useState(0);

    let inputOnchange = (e: any) => {
      setLabelCount(e.target.value);
    }

    let justOne = item.count == 1;

    if (justOne) {
      return (
        <div id={item.id} key={item.id} style={{
          display: "flex",
          flexDirection: "column",
        }}>
          <label>
            <span className="droptake-label-image-span"><img src={getSvgForSubType(item.subType, false)} /></span>
            <span className="droptake-label-text-span">{nameForElementSubType(item.subType)}</span>
          </label>

          <input hidden={true} id={`${item.id}-rangeinput`} value={1} readOnly={true} />
          <button onClick={() => itemTransferHandler(actionHandling, item.id, `${item.id}-rangeinput`)}>
            {actionHandling}
          </button>
        </div>
      )
    }

    return (
      <div id={item.id} key={item.id} style={{
        display: "flex",
        flexDirection: "column",
      }}>
        <label htmlFor={`${item.id}-rangeinput`} className="droptake-label">
          <span className="droptake-label-image-span"><img src={getSvgForSubType(item.subType, false)} /></span>
          <span className="droptake-label-text-span">{nameForElementSubType(item.subType)} (0 - {maxItems})</span>
        </label>
        <input onChange={inputOnchange} type="range" defaultValue={0} min={0} max={maxItems} id={`${item.id}-rangeinput`} name={`${item.id}-rangeinput`} />

        <button onClick={() => itemTransferHandler(actionHandling, item.id, `${item.id}-rangeinput`)} disabled={labelCount == 0}>
          {actionHandling} {labelCount}
        </button>
      </div>
    )
  }

  return (
    <div className="element-actions">

      {
        actionHandling ? <>
        <p className="action-handling-text">{getActionVerb(actionHandling)}</p>
        <div className="element-action-options">
          <div key={"back-button"} id="backButton">
            <button onClick={getActionHandler("back")}>
              <span key="span1"><img src={backSvg} /></span><span key="span2">Back</span>
            </button>
          </div>
        </div>


        <div className="element-action-items">
          { ["drop", "take"].includes(actionHandling) && itemsToSelectFrom &&
            <>{itemsToSelectFrom.map(item => <DropTakeInput key={item.id} actionHandling={actionHandling} item={item} />)}</>
          }

          {
            actionHandling == "build" &&
            <>
              {itemsToSelectFrom.map(item => {
                return (
                  <button key={item[1]+item[0]} onClick={() => { buildElem(item[0], item[1]) }} disabled={getBuildingDisabled(item[1])}>
                      <span>
                        {
                          getBuildingCost(item[1]).map(ing => {
                            return (
                                <div>
                                  <p>{nameForElementSubType(ing.subType)}</p>
                                  <img src={getSvgForSubType(ing.subType, false)} />
                                  <p>{getSpecificItemBuildingCost(item[1], ing.subType)}</p>
                                </div>
                              )
                          })
                        }
                        <p>►</p>
                        <img src={getSvgForSubType(item[1], false)} />
                      </span>
                  </button>
                )
              })}
            </>
          }
          {
            actionHandling == "fight" &&
            <>
              {itemsToSelectFrom.map(person => {
                return (
                  <button key={person.id} onClick={() => { fight(person.id) }}>
                    Fight: {nameForTeamColor(person.team)} {nameForElementSubType(person.subType)} ({person.health}H)
                  </button>
                )
              })}
            </>
          }
          {
            actionHandling == "work" &&
            <button className="fullwidth-option" key={"workbutton"} onClick={() => { work() }}>
              {/* First item is just a message based on current villager */}
              {itemsToSelectFrom[0]} 
            </button>
          }
          {
            actionHandling == "clone" &&
            <button className="fullwidth-option" key={"clonebutton"} onClick={() => { clone() }}>
              {/* First item is just a message based on current villager */}
              {itemsToSelectFrom[0]} 
            </button>
          }
          {
            actionHandling == "shoot" &&
            <>
              {itemsToSelectFrom.map(person => {
                return (
                  <button key={person.id} onClick={() => { shoot(person) }}>
                    Shoot: {nameForTeamColor(person.team)} {nameForElementSubType(person.subType)} ({person.health}H)
                  </button>
                )
              })}
            </>
          }

          {
            actionHandling == "trade" && 
            <>
            {
            !tradeOfferingChosen ?
              itemsToSelectFrom.map((getOffering: any) => {
                return (
                  <button key={getOffering.subType} onClick={() => { setTradeOfferingChosen(getOffering.subType) }} className="trade-button">
                    <span>
                      Trade for {nameForElementSubType(getOffering.subType)}
                    </span>
                    <img src={getSvgForSubType(getOffering.subType, false)} />
                  </button>
                )
              })
            :
              BoardUtils.getItemsPersonCanGive(selectedElement, cells).map(giveOffering => {
                return (<button className="fullwidth-option" key={giveOffering} onClick={() => { handleTrade(giveOffering, tradeOfferingChosen, tradeOfferingChosen == ElementSubType.Horse ? 7 : 2) }} 
                          disabled={
                            giveOffering == ElementSubType.Horse && 
                              BoardUtils.elWithHighestCount(selectedElement) &&
                              BoardUtils.elWithHighestCount(selectedElement).count < 7 }>
                  Give {tradeOfferingChosen == ElementSubType.Horse ? 7 : 2} {nameForElementSubType(giveOffering)}
                </button>)
              })
              
            }
            </>
          }
        </div>
      </>
      :
        <div className="element-action-options">
          { availableActionsInfo.map(aai => {
            return (<div key={aai.title}>
              <button onClick={getActionHandler(aai.title)}>
                <span><img src={aai.icon} /></span><span>{aai.title}</span>
              </button>
              {/* <span>{aai.helpText}</span> */}
            </div>)
          }) }
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
      <p className="player-turn-text">Current Player's Turn: <span style={{color: colorForTeam(playerTurn)}}>{currentPlayerName}</span></p>
    </div>)
  }

  return (
    <div className="element-actions-menu"><div className="element-actions-menu-inner">
      <div className="nav">
        <a href="/">Home</a>
      </div>
      <p className="player-turn-text">Current Player's Turn: <span style={{color: colorForTeam(playerTurn)}}>You</span></p>

      <ElementActionOptions />

      <div className="element-turn-actions">
        {
          !confirmingResetTurn && 
          <> 
          { confirmingEndTurn ? <>
            <button onClick={endTurnHandler} className="warning-text">Really End Turn?</button>
            <button onClick={() => setConfirmingEndTurn(false)}>Cancel</button>
          </>
          :
          <><button onClick={() => setConfirmingEndTurn(true)}>End Turn</button></>
          } </>
        }

        {
          !confirmingEndTurn &&
          <> { confirmingResetTurn ? <>
              <button onClick={resetTurnHandler} className="warning-text">Really Reset Turn?</button>
              <button onClick={() => setConfirmingResetTurn(false)}>Cancel</button>
            </>
            :
            <button onClick={() => setConfirmingResetTurn(true)}>Undo ALL</button>
          } </>
        }
      </div>

    </div></div>
  )
};
