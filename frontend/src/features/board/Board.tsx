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
  getShowMoveInfo, setShowMoveInfo
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

function getSelectedCellFromMousePos(
  mx: number, my: number, 
  radius: number, offsetX: number, offsetY: number, 
  cells: Cell[]
): Cell|null {
  let {x, y} = BoardUtils.pixelToGrid(mx, my, radius, offsetX, offsetY);

  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
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

      let intersects = pointInRectangle({x: mx, y: my}, topLeft, bottomRight);
      if (intersects) {
        return elem;
      }
    }
  }

  return null
}

export function Board() {

  const dispatch = useAppDispatch();

  const [renderCount, setRenderCount] = useState(1);
  const incrementRenderCount = () => { setRenderCount(renderCount + 1) };

  const cells =             useAppSelector(getCells);
  const selectedCell =      useAppSelector(getSelectedCell);
  const selectedElement =   useAppSelector(getSelectedElement);
  const zoom =              useAppSelector(getBoardZoom);
  const offset =            useAppSelector(getBoardOffset);
  const showMoveInfo =      useAppSelector(getShowMoveInfo);

  let initialRadius =   40;
  let canvasWidth =     600;
  let canvasHeight =    600;

  let hexRadius = initialRadius*zoom;
  let qcw = canvasWidth / 4;
  let qch = canvasHeight / 4;

  let minOffsetX = (-0.5*hexRadius)+(canvasWidth - canvasWidth*zoom)-qcw;
  let maxOffsetX = 0.5*hexRadius + qcw;

  let minOffsetY = (-0.5*hexRadius)+(canvasHeight - canvasHeight*zoom)-qch;
  let maxOffsetY = 0.5*hexRadius+qch;

  useEffect(() => {
    if (cells.length === 0) {
      const BG = new BoardGenerator();
      const newBoard = BG.generateBoard(
        hexRadius, canvasWidth, canvasHeight, 4
      );
      dispatch(setCells(newBoard));
    }
  }, [cells, dispatch]);


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
  const firstMouseRef = useRef<Coordinate>({ x: 0, y: 0 });
  const lastMouseRef = useRef<Coordinate>({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;

    let newZoom = Math.min(Math.max(zoom * scaleFactor, 0.8), 5);
    newZoom = Math.round(newZoom * 10) / 10;

    let zoomDif = Math.round((newZoom - zoom) * 10) / 10;
    let newX = Math.round((offset.x - (mx*zoomDif)) * 10) / 10;
    let newY = Math.round((offset.y - (my*zoomDif)) * 10) / 10;

    let newOffsetX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
    let newOffsetY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));

    dispatch(setBoardOffset({x: newOffsetX, y: newOffsetY}));
    dispatch(setBoardZoom(newZoom))
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {

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

    let potentialSelectedCell: Cell|null = getSelectedCellFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

    if (potentialSelectedCell) {
      let potentialElement: Element|null = getSelectedElementFromMousePos(mx, my, hexRadius, offset.x, offset.y, cells);

      if (potentialElement) {
        dispatch(setSelectedElement(potentialElement));
        dispatch(setSelectedCell(null));
        return
      } else {

        if (selectedElement && selectedElement.type == ElementType.Person && showMoveInfo) {
          // check if one of the adjacent tiles has been selected

          let elemParentCell = BoardUtils.getElementParentCell(selectedElement, cells);
          let adjacentCells = BoardUtils.getAdjacentCells(cells, elemParentCell);

          let newCells = null;
          for (var ac of adjacentCells) {
            if (ac.x == potentialSelectedCell.x && ac.y == potentialSelectedCell.y) {
              newCells = BoardUtils.moveElement(cells, selectedElement, ac);
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

  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseIsDown.current = false;
    firstMouseRef.current = { x: 0, y: 0 };
  };

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
      style={{ border: "1px solid #ccc", background: "#898989" }}
    />
  );
}
