import React, { useEffect, useRef, useState  } from "react";

import type {
  Coordinate, Cell, Element
} from "./boardSlice.ts";

import {
  ElementType,
  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getSelectedElement, setSelectedElement,
  getBoardZoom, setBoardZoom,
  getBoardOffset, setBoardOffset,
} from "./boardSlice.ts";

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import {
  BoardRenderer
} from "./boardRenderer.ts";

import {
  BoardGenerator
} from "./boardGenerator.ts";

import {
  BoardUtils, pointInRectangle
} from "./boardUtils.ts";

import { randomItem } from "./utils.js";

function getSelectedCellFromMousePos(mx, my, radius, offsetX, offsetY, cells) {
  let {x, y} = BoardUtils.pixelToGrid(mx, my, radius, offsetX, offsetY);

  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
      return cell
    }
  }
}

function getSelectedElementFromMousePos(mx, my, radius, offsetX, offsetY, cells) {
  let selectedCell = getSelectedCellFromMousePos(mx, my, radius, offsetX, offsetY, cells);
  let { halfRadius, buildingSize, objectSize, toolSize } = BoardUtils.getElemSizes(radius);

  if (selectedCell) {

    let cellOrigin = BoardUtils.gridToPixelOrigin(selectedCell.x, selectedCell.y, radius, offsetX, offsetY);

    for (var elem of selectedCell.contents) {
      let elemPos = BoardUtils.getElementPosition(elem, cellOrigin, radius);
      let elemSize = BoardUtils.getSizeForElement(elem, radius);

      let topLeft = {x: elemPos.x, y: elemPos.y};
      let bottomRight = {x: elemPos.x + elemSize, y: elemPos.y + elemSize};

      let intersects = pointInRectangle({x: mx, y: my}, topLeft, bottomRight);
      if (intersects) {
        console.log("Selected", elem);
        return elem;
      }
    }
  }
}

export function Board() {
  const dispatch = useAppDispatch();

  // ===========================
  // State Handling
  // ===========================

  const cells = useAppSelector(getCells);
  const selectedCell = useAppSelector(getSelectedCell);
  const selectedElement = useAppSelector(getSelectedElement);
  const zoom = useAppSelector(getBoardZoom);
  const offset = useAppSelector(getBoardOffset);

  useEffect(() => {
    if (cells.length === 0) {
      const BG = new BoardGenerator();
      const newBoard = BG.generateBoard(
        hexRadius, canvasWidth, canvasHeight, 4
      );
      dispatch(setCells(newBoard));
    }
  }, [cells, dispatch]);

  // ===========================
  // Mouse things
  // ===========================

  const mouseIsDown: boolean = useRef(false);
  const isDraggingRef: boolean = useRef(false);
  const firstMouseRef: Coordinate = useRef({ x: 0, y: 0 });
  const lastMouseRef: Coordinate = useRef({ x: 0, y: 0 });

  let initialRadius = 70;
  let hexRadius = initialRadius*zoom;
  let canvasWidth = 800;
  let canvasHeight = 800;

  let qcw = canvasWidth / 4;
  let qch = canvasHeight / 4;

  let minOffsetX = (-0.5*hexRadius)+(canvasWidth - canvasWidth*zoom)-qcw;
  let maxOffsetX = 0.5*hexRadius + qcw;

  let minOffsetY = (-0.5*hexRadius)+(canvasHeight - canvasHeight*zoom)-qcw;
  let maxOffsetY = 0.5*hexRadius+qcw;

  const handleWheel = (e) => {
    const canvas = canvasRef.current; if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    let zoomingOut = scaleFactor === 0.9;

    let newZoom = Math.min(Math.max(zoom * scaleFactor, 0.8), 3);
    newZoom = Math.round(newZoom * 10) / 10;

    let zoomDif = Math.round((newZoom - zoom) * 10) / 10;
    let newX = Math.round((offset.x - (mx*zoomDif)) * 10) / 10;
    let newY = Math.round((offset.y - (my*zoomDif)) * 10) / 10;

    let newOffsetX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
    let newOffsetY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));

    dispatch(setBoardOffset({x: newOffsetX, y: newOffsetY}));
    dispatch(setBoardZoom(newZoom))
  }
  
  const handleMouseMove = (e) => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!mouseIsDown.current) {
      return
    }

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

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
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    mouseIsDown.current = true;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    lastMouseRef.current = { x: mx, y: my };
    firstMouseRef.current = { x: mx, y: my };
  };

  const handleMouseUp = (e) => {
    mouseIsDown.current = false;

    let wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    if (wasDragging) { return };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let potentialSelectedCell = getSelectedCellFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

    if (potentialSelectedCell) {
      let potentialElement = getSelectedElementFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

      if (potentialElement) {
        dispatch(setSelectedElement(potentialElement));
        dispatch(setSelectedCell(null));
        return
      } else {

        if (selectedElement && selectedElement.type == ElementType.Person) {
          // check if one of the adjacent tiles has been selected

          let elemParentCell = BoardUtils.getElementParentCell(selectedElement, cells);
          let adjacentCells = BoardUtils.getAdjacentCells(cells, elemParentCell);

          let newCells = null;
          for (var ac of adjacentCells) {
            if (ac.x == potentialSelectedCell.x && ac.y == potentialSelectedCell.y) {
              newCells = BoardUtils.moveElement(cells, selectedElement, ac);
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

  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseIsDown.current = false;
    firstMouseRef.current = { x: 0, y: 0 };
  };

  // ===========================
  // Canvas / hex size
  // ===========================

  const canvasRef = useRef(null);

  useEffect(() => {
    if (cells.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    BoardRenderer.render(ctx, cells, selectedCell, selectedElement, hexRadius, offset.x, offset.y);
  }, [cells, zoom, offset, selectedCell, selectedElement]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ border: "1px solid #ccc" }}
    />
  );
}
