import React, { useEffect, useRef, useState  } from "react";

import type {
  Coordinate, Cell, Element
} from "./boardSlice.ts";

import {

  getSizeForElement,

  getCells, setCells,
  getSelectedCell, setSelectedCell,
  getBoardZoom, setBoardZoom,
  getBoardOffset, setBoardOffset,
} from "./boardSlice.ts";

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { BoardGenerator, pointInRectangle } from "./boardGen.ts";
import { randomItem } from "./utils.js";

function drawBoard(boardGen, canvas, cells) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  boardGen.drawHexes(ctx, cells);
}


// below two should really be a part of board gen?

function getSelectedCellFromMousePos(mx, my, boardGen, cells) {
  let {x, y} = boardGen.pixelToGrid(mx, my);

  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
      return cell
    }
  }
}

function getSelectedElementFromMousePos(mx, my, boardGen, cells) {
  let selectedCell = getSelectedCellFromMousePos(mx, my, boardGen, cells);
  let { halfRadius, buildingSize, objectSize, toolSize } = BoardGenerator.getElemSizes(boardGen.options);

  if (selectedCell) {
    let cellOrigin = boardGen.gridToPixelOrigin(selectedCell.x, selectedCell.y, boardGen.options);

    for (var elem of selectedCell.contents) {
      let elemPos = BoardGenerator.getElementPosition(elem, cellOrigin, boardGen.options);
      let elemSize = getSizeForElement(elem, boardGen.options.radius)

      let topLeft = {x: elemPos.x, y: elemPos.y};
      let bottomRight = {x: elemPos.x + elemSize, y: elemPos.y + elemSize};

      let intersects = pointInRectangle({x: mx, y: my}, topLeft, bottomRight);
      if (intersects) {
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
  const zoom = useAppSelector(getBoardZoom);
  const offset = useAppSelector(getBoardOffset);

  useEffect(() => {
    if (cells.length === 0) {
      const newCells = BoardGenerator.getRandomBoard(
        hexRadius, canvasWidth, canvasHeight
      );
      dispatch(setCells(newCells));
    }
  }, [cells, dispatch]);

  // ===========================
  // Mouse things
  // ===========================

  const mouseIsDown: boolean = useRef(false);
  const isDraggingRef: boolean = useRef(false);
  const firstMouseRef: Coordinate = useRef({ x: 0, y: 0 });
  const lastMouseRef: Coordinate = useRef({ x: 0, y: 0 });

  let hexRadius = 50;
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

    let potentialSelectedCell = getSelectedCellFromMousePos(mx, my, boardGen, cells);

    if (potentialSelectedCell) {
      let potentialElement = getSelectedElementFromMousePos(mx, my, boardGen, cells);

      if (potentialElement) {
        console.log(potentialElement, "SELECTED");
        return
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

  const boardGen = new BoardGenerator({
    radius: hexRadius*zoom,
    offsetX: offset.x,
    offsetY: offset.y,
    selectedCell: selectedCell
  }, canvasWidth, canvasHeight);

  // draw to canvas
  useEffect(() => {
    if (cells.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBoard(boardGen, canvas, cells);
  }, [cells, zoom, offset, selectedCell]);

  // ===========================
  // Render
  // ===========================

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
