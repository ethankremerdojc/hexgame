import React, { useEffect, useRef, useState  } from "react";


import type {
  Coordinate, Cell, Element
} from "./boardTypes"

import {
  ElementType
} from "./boardTypes"

import {
  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getSelectedElement, setSelectedElement,
  getBoardZoom, setBoardZoom,
  getBoardOffset, setBoardOffset,
  getShowMoveInfo, setShowMoveInfo,
  getPlayerTurn, getPlayerCount,
  setActionHandling,
  setActionItemsToSelectFrom,
  getCurrentPlayerName, getLoggedInUsername
} from "./boardSlice.ts";

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import {
  BoardRenderer
} from "./boardRenderer.ts";

import {
  BoardUtils
} from "./boardUtils.ts";

import { TESTING } from "@/App.tsx"

import BoardActions from "./boardActions";

function getSelectedCellFromMousePos(
  mx: number, my: number, 
  radius: number, offsetX: number, offsetY: number, 
  cells: Cell[]
): Cell|null {
  let {x, y} = BoardUtils.pixelToGrid(mx, my, radius, offsetX, offsetY);

  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
      // console.log("selected cell: ", cell)
      return cell
    }
  }

  return null
}

function getSelectedElementFromMousePos(
  mx: number, my: number, 
  radius: number, offsetX: number, offsetY: number, 
  cells: Cell[]
): Element|null {
  let selectedCell: Cell|null = getSelectedCellFromMousePos(mx, my, radius, offsetX, offsetY, cells);

  if (selectedCell) {

    let cellOrigin = BoardUtils.gridToPixelOrigin(selectedCell.x, selectedCell.y, radius, offsetX, offsetY);

    for (var elem of selectedCell.elements) {
      let elemPos = BoardUtils.getElementPosition(elem, cellOrigin, radius);
      let elemSize = BoardUtils.getSizeForElement(elem, radius);

      let topLeft = {x: elemPos.x, y: elemPos.y};
      let bottomRight = {x: elemPos.x + elemSize, y: elemPos.y + elemSize};

      let intersects = BoardUtils.pointInRectangle({x: mx, y: my}, topLeft, bottomRight);
      if (intersects) {
        // console.log("selected elem: ", elem)
        return elem;
      }
    }
  }

  return null
}

export function Board({canvasWidth, canvasHeight}: {canvasWidth: number, canvasHeight: number}) {

  const dispatch = useAppDispatch();

  const [renderCount, setRenderCount] = useState(1);
  const incrementRenderCount = () => { setRenderCount(renderCount + 1) };

  const cells =             useAppSelector(getCells);
  const selectedCell =      useAppSelector(getSelectedCell);
  const selectedElement =   useAppSelector(getSelectedElement);
  const zoom =              useAppSelector(getBoardZoom);
  const offset =            useAppSelector(getBoardOffset);
  const showMoveInfo =      useAppSelector(getShowMoveInfo);
  const playerTurn =        useAppSelector(getPlayerTurn);
  const playerCount =       useAppSelector(getPlayerCount);

  let initialRadius =   BoardUtils.getInitialRadius(canvasWidth, cells);

  let hexRadius = initialRadius*zoom;

  let minOffsetX = -0.8*canvasWidth*zoom*zoom;
  let maxOffsetX = canvasWidth*zoom*zoom;

  let minOffsetY = -0.8*canvasHeight*zoom*zoom;
  let maxOffsetY = canvasHeight*zoom*zoom;

  const currentPlayerName = useAppSelector(getCurrentPlayerName);
  const loggedInUsername = useAppSelector(getLoggedInUsername);

  const thisPlayersTurn = currentPlayerName == loggedInUsername;

  useEffect(() => {
    if (cells.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    BoardRenderer.render(
      ctx,
      cells,
      selectedCell,
      selectedElement,
      showMoveInfo,
      hexRadius,
      offset.x,
      offset.y
    );

    incrementRenderCount();

  }, [cells, zoom, offset, selectedCell, selectedElement, showMoveInfo]);

  // ===========================
  // Mouse things
  // ===========================

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseIsDown = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const isPinchingRef = useRef<boolean>(false);
  const firstMouseRef = useRef<Coordinate>({ x: 0, y: 0 });
  const lastMouseRef = useRef<Coordinate>({ x: 0, y: 0 });

  const lastPinchDistance = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const scaleFactor = e.deltaY < 0 ? 0.1 : -0.1;

    let newZoom = Math.min(Math.max(zoom + scaleFactor, 0.7), 5);
    newZoom = Math.round(newZoom * 10) / 10;

    if (zoom == newZoom) { return }

    let zoomDif = scaleFactor == 0.1 ? 1 : -1;

    let offsetDif = Math.round(zoomDif * initialRadius);

    let newX = Math.round(offset.x - offsetDif);
    let newY = Math.round(offset.y - offsetDif);

    let newOffsetX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
    let newOffsetY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));

    dispatch(setBoardOffset({x: newOffsetX, y: newOffsetY}));
    dispatch(setBoardZoom(newZoom))
  }

  const getCanvasPoint = (
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const getTouchDistance = (touches: React.TouchList) => {
    const [t1, t2] = [touches[0], touches[1]];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mouse Move / Touch Move

  const updateOffset = (mx: number, my: number) => {
    const dx = mx - lastMouseRef.current.x;
    const dy = my - lastMouseRef.current.y;

    const fdx = mx - firstMouseRef.current.x;
    const fdy = my - firstMouseRef.current.y;

    const minDragAmount = 10;

    if (fdx > minDragAmount || fdy > minDragAmount) {
      isDraggingRef.current = true;
    }

    let newOffsetX = Math.max(minOffsetX, Math.min(offset.x + dx, maxOffsetX));
    let newOffsetY = Math.max(minOffsetY, Math.min(offset.y + dy, maxOffsetY));

    dispatch(setBoardOffset({
      x: newOffsetX,
      y: newOffsetY,
    }));

    lastMouseRef.current = { x: mx, y: my };
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !mouseIsDown.current) return;

    const { x, y } = getCanvasPoint(e.clientX, e.clientY, canvas);
    updateOffset(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ----- PINCH ZOOM -----
    if (e.touches.length === 2) {

      e.preventDefault();
      isPinchingRef.current = true;

      const distance = getTouchDistance(e.touches);

      if (lastPinchDistance.current === null) {
        lastPinchDistance.current = distance;
        return;
      }

      if (Math.abs(distance - lastPinchDistance.current) < 8) {
        return;
      }

      const scaleFactor = distance > lastPinchDistance.current ? 0.1 : -0.1;

      let newZoom = Math.min(Math.max(zoom + scaleFactor, 0.7), 5);
      newZoom = Math.round(newZoom * 10) / 10;

      if (zoom === newZoom) {
        lastPinchDistance.current = distance;
        return;
      }

      const zoomDif = scaleFactor === 0.1 ? 1 : -1;
      const offsetDif = Math.round(zoomDif * initialRadius);

      const newX = Math.round(offset.x - offsetDif);
      const newY = Math.round(offset.y - offsetDif);

      const newOffsetX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
      const newOffsetY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));

      dispatch(setBoardOffset({ x: newOffsetX, y: newOffsetY }));
      dispatch(setBoardZoom(newZoom));

      lastPinchDistance.current = distance;
      return;
    }

    if (isPinchingRef.current) {
      // lifted one finger up
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    const { x, y } = getCanvasPoint(touch.clientX, touch.clientY, canvas);
    updateOffset(x, y);
  };


  // Mouse Down / Touch Start

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    mouseIsDown.current = true;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    lastMouseRef.current = { x: mx, y: my };
    firstMouseRef.current = { x: mx, y: my };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    if (!touch) return;

    mouseIsDown.current = true;

    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;

    lastMouseRef.current = { x: mx, y: my };
    firstMouseRef.current = { x: mx, y: my };
  };

  // Mouse up / touch end

  const doSelectionStuffs = (mx: number, my: number) => {
    let potentialSelectedCell: Cell|null = getSelectedCellFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

    if (potentialSelectedCell) {
      let potentialElement: Element|null = getSelectedElementFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

      if (potentialElement && potentialElement.team == playerTurn) {

        if (selectedElement) {
          // selected an element while there was already one selected, reset menu things.
          dispatch(setShowMoveInfo(false));
          dispatch(setActionHandling(""));
          dispatch(setActionItemsToSelectFrom([]));
        }

        dispatch(setSelectedElement(potentialElement));
        dispatch(setSelectedCell(null));
        return
      } else {
        // no selected element.
        //
        // below only make sense when person is selected
        dispatch(setShowMoveInfo(false));
        dispatch(setActionHandling(""));
        dispatch(setActionItemsToSelectFrom([]));

        if (selectedElement && selectedElement.type == ElementType.Person && showMoveInfo) {
          // check if one of the adjacent tiles has been selected

          // let elemParentCell = BoardUtils.getElementParentCell(selectedElement, cells);
          let adjacentCells = BoardUtils.getCellsPersonCanMoveTo(selectedElement, cells);

          let newCells = null;
          for (var ac of adjacentCells) {
            if (ac.x == potentialSelectedCell.x && ac.y == potentialSelectedCell.y) {
              newCells = BoardActions.moveElement(cells, selectedElement, ac);
              dispatch(setShowMoveInfo(false));
            }
          }

          if (newCells) {
            dispatch(setCells(newCells));
          }
        }


        dispatch(setSelectedElement(null));
      }

      let cellSetNull = false;

      if (selectedCell) {
        if (potentialSelectedCell.x == selectedCell.x && potentialSelectedCell.y == selectedCell.y) {
          dispatch(setSelectedCell(null));
          cellSetNull = true;
        }
      }

      if (!cellSetNull) {
        dispatch(setSelectedCell(potentialSelectedCell));
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseIsDown.current = false;

    let wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (wasDragging) { return };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (!thisPlayersTurn && !TESTING) { return }

    doSelectionStuffs(mx, my);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    lastPinchDistance.current = null;

    // if one finger is still down after a pinch, do nothing yet
    if (isPinchingRef.current) {
      if (e.touches.length === 0) {
        isPinchingRef.current = false;
        mouseIsDown.current = false;
        isDraggingRef.current = false;
      }
      return;
    }

    mouseIsDown.current = false;

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (wasDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!thisPlayersTurn && !TESTING) return;

    // touchend has no active touches left, so use changedTouches
    const touch = e.changedTouches[0];
    if (!touch) return;

    if (e.touches.length == 1) {
      const rect = canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;

      doSelectionStuffs(mx, my);
    }
  };

  // Mouse Leave

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseIsDown.current = false;
    firstMouseRef.current = { x: 0, y: 0 };
  };

  if (playerCount == 0) {
    return (<div>Set Player Count Before Rendering Board.</div>)
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}

      // DESKTOP
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}

      // MOBILE
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: "none" }}
    />
  );
}
