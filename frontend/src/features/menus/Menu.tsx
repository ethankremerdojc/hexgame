import { useState } from "react";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import type { Element, Cell } from "../board/boardTypes"

import {
  ElementType,
  ElementSubType,
  ElementAction,
  objectToElement,
  ITEMS_YOU_CAN_HOLD_ONE_OF
} from "../board/boardTypes"

import {
  getCells, setCells,
  setSelectedCell,
  getSelectedElement, setSelectedElement,
  getTurnNumber,
  getUsernames,
  setShowMoveInfo,
  getPlayerTurn,
  setActionHandling, getActionHandling,
  setActionItemsToSelectFrom, getActionItemsToSelectFrom,
  getCurrentPlayerName,
  getLoggedInUsername,
  endTurn, revertToBeginningOfTurn,
  prepareCellsForStateSave,

  setUserSubscribed, getUserSubscribed,
} from "../board/boardSlice.ts";

import { 
  getBuildingCost,
  nameForElementSubType,
  colorForTeam,
  getSpecificItemBuildingCost,
  getTradeCostForSubType
} from "../board/vars"

import BoardUtils from "../board/boardUtils"
import BoardActions from "../board/boardActions"

// import { TESTING } from "@/App.tsx"
import { notificationSubscribe } from "@/app/api"
import { getSvgForSubType } from "../board/boardRenderer"

import './Menu.css'

import HelpMenu from "./HelpMenu"
import EditorMenu from "./EditorMenu"

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
import noSvg from "../board/svg/actions/noIcon.svg";
import healSvg from "../board/svg/actions/healIcon.svg";

import { signupForNotifications } from "@/app/notifications";

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
  },
  { // shoot
    title: "rename",
    helpText: "Rename Villager"
  },
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
    case "heal":
      return healSvg
      break;
    case "destroy":
      return noSvg
      break;
    case "rename":
      return healSvg
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

    newCells = prepareCellsForStateSave(newCells);

    let newParent = newCells.filter((c: Cell) => c.x == parentCell.x && c.y == parentCell.y)[0];
    let newSelEl = newParent.elements.filter((el: Element) => el.id == selectedElement.id)[0];

    if (newSelEl && newSelEl.hasActionAvailable) {
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
    let building = parentCell.elements.filter((el: Element) => el.type == ElementType.Building)[0];
    dispatch(setActionItemsToSelectFrom(["Destroy " + nameForElementSubType(building.subType)]));
  }

  const destroy = () => {
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
    dispatch(setActionItemsToSelectFrom(BoardUtils.getTradeOfferings(selectedElement, cells)));
  }

  const backHandler = () => {
    dispatch(setActionItemsToSelectFrom([]));
    dispatch(setActionHandling(""));
    setTradeOfferingChosen(null);
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

  const renameHandler = () => {
    dispatch(setActionHandling("rename"));
  }

  const rename = (newName: string) => {
    let newCells = BoardActions.renamePerson(selectedElement, newName, cells);
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
    else if (title == "rename") {
      actionFunc = renameHandler
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

    let justOne = item.count == 1 || ITEMS_YOU_CAN_HOLD_ONE_OF.includes(item.subType);

    if (justOne) {
      return (
        <div id={item.id} key={item.id} style={{
          display: "flex",
          flexDirection: "column",
        }}>
          <label htmlFor={`${item.id}-rangeinput`} className="droptake-label">
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
        <div className="element-action-options">
          <p className="action-handling-text">{getActionVerb(actionHandling)}</p>
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

                        <div>
                          <p>{nameForElementSubType(item[1])}</p>
                          <img src={getSvgForSubType(item[1], false)} />
                        </div>
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
                  {person.name}
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
            actionHandling == "destroy" &&
            <button className="fullwidth-option" key={"destroybutton"} onClick={() => { destroy() }}>
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
                      {person.name}
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
                  <button 
                    key={getOffering.subType}
                    onClick={() => { setTradeOfferingChosen(getOffering.subType) }} 
                    className="trade-button"
                    disabled={getOffering['disabled']}
                  >
                    <span>
                      <p>Trade For</p>
                      <img src={getSvgForSubType(getOffering.subType, false)} />
                      <p>{nameForElementSubType(getOffering.subType)}</p>
                    </span>
                  </button>
                )
              })
            :
              BoardUtils.getItemTypesPersonCanGive(selectedElement, cells, getTradeCostForSubType(tradeOfferingChosen)).map(giveOffering => {
                return (
                  <button 
                    className="fullwidth-option" 
                    key={giveOffering} 
                    onClick={
                      () => { handleTrade(giveOffering, tradeOfferingChosen, getTradeCostForSubType(tradeOfferingChosen)) }
                    }
                  >
                    <span>
                      <p>Give {getTradeCostForSubType(tradeOfferingChosen)}</p>
                      <img src={getSvgForSubType(giveOffering, false)} />
                      <p>{nameForElementSubType(giveOffering)}</p>
                    </span>
                  </button>
                )
              })
            }
            </>
          }

          {
            actionHandling == "rename" &&
            <div className="rename-block">
              <input id="renameInput" />
              <button onClick={() => {
                let renameInput = document.getElementById("renameInput") as HTMLInputElement | null;
                if (!renameInput) {
                  throw new Error("Unable to find rename input.")
                  return;
                }
                let newName = renameInput.value;
                if (!newName) {
                  alert("You must provide a name with at least one character.");
                }
                rename(newName);
              }}>Rename</button>
            </div>
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

function SignupButton({dispatch, userSubscribed, loggedInUsername}: any) {
  return (<button
    className="subscribe-button"
    disabled={userSubscribed}
    onClick={
    async () => {
      let subscription = await signupForNotifications({
        vapidPublicKey: "BL33qr07Zgt-RZIj0YK346IrtEzqL9osLQvPLDcVijxsGudk9xIPBASP9Nm1GNUYbFo86fBoZlZhhr6F-AX9gJ4"
      });

      if (!subscription) {
        alert("there was a problem signing up for notifications.");
      }

      notificationSubscribe(subscription, loggedInUsername).then((result) => {
        if (result.ok) {
          alert("Successfully signed up for notifications.");
          dispatch(setUserSubscribed(true));
        } else {
          alert("There was a problem signing up for notifications.");
        }
      })
    }
  }>
    {userSubscribed ? "Subbed!" : "Notifis"}
  </button>)
}

export function ElementActionsMenu() {
  const dispatch = useAppDispatch();
  const playerTurn =        useAppSelector(getPlayerTurn);
  const selectedElement =        useAppSelector(getSelectedElement);

  // ==========================================

  const [confirmingEndTurn, setConfirmingEndTurn] = useState(false);
  const [confirmingResetTurn, setConfirmingResetTurn] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

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
  const usernames = useAppSelector(getUsernames);
  const userSubscribed = useAppSelector(getUserSubscribed);
  const turnNumber = useAppSelector(getTurnNumber);

  if (window.__editor_mode__) {
    return (
      <div className="element-actions-menu"><div className="element-actions-menu-inner">
        <EditorMenu />
      </div></div>
    )
  }

  return (
    <div className="element-actions-menu"><div className="element-actions-menu-inner">
      <div className="element-actions-top">
        {
          !helpMenuOpen &&
          <div className="turninfo">
            <p className="round-number-text">Round {turnNumber}</p>
            <p className="player-turn-text">
                <span style={{color: colorForTeam(playerTurn)}}>
                  {currentPlayerName == loggedInUsername ? "Your turn" : currentPlayerName + "'s turn"}
                </span>
            </p>
            <p className="players">Players:<br />{ usernames.map((username: string, index: number) => 
                <span key={username} style={{color: colorForTeam(index)}}>{username}</span>)}
            </p>
          </div>
        }

        <div className="element-actions-top-buttons">
          {helpMenuOpen ?
            <button className="help-toggle" onClick={() => setHelpMenuOpen(false)}>
              Close Help
            </button>
            :
            <button className="help-toggle" onClick={() => {setHelpMenuOpen(true)}}>
              Help
            </button>
          }

          { !userSubscribed ?
            <SignupButton
              dispatch={dispatch}
              userSubscribed={userSubscribed}
              loggedInUsername={loggedInUsername}
            />
            : <div></div>
          }



          { currentPlayerName == loggedInUsername && <>
            {
              !confirmingResetTurn && 
              <> 
              { confirmingEndTurn ? <>
                <button onClick={() => setConfirmingEndTurn(false)} className="inverted">Cancel</button>
                <button onClick={endTurnHandler} className="inverted warning-text">Are You Sure?</button>
              </>
              :
              <><button onClick={() => setConfirmingEndTurn(true)}>End Turn</button></>
              } </>
            }
            {
              !confirmingEndTurn &&
              <> { confirmingResetTurn ? <>
                  <button onClick={() => setConfirmingResetTurn(false)} className="inverted">Cancel</button>
                  <button onClick={resetTurnHandler} className="inverted warning-text">Really Reset Turn?</button>
                </>
                :
                <button onClick={() => setConfirmingResetTurn(true)}>Undo ALL</button>
              } </>
            } 
            </>
          }
        </div>
      </div>
      
      {
        helpMenuOpen ?
          <div className="element-actions-bottom"><HelpMenu /></div>
        :
          <>{ currentPlayerName == loggedInUsername && selectedElement &&
            <div className="element-actions-bottom"><ElementActionOptions /></div>
          }</>
      }

    </div></div>
  )
};
