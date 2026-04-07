import React, { useEffect, useRef, useState  } from "react";
import {
  selectCells, setCells,
  getSelectedCell, setSelectedCell 
} from "@/features/board/boardSlice";
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { BoardGenerator } from "./boardGen.ts";
import { randomItem } from "./utils.js";

function drawBoard(boardGen, canvas, cells) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  boardGen.drawHexes(ctx, cells);
}

function getSelectedCellFromMousePos(mx, my, boardGen, cells) {
  let {x, y} = boardGen.pixelToGrid(mx, my);

  for (var cell of cells) {
    if (cell.x == x && cell.y == y) {
      return cell
    }
  }
}

export function Board() {
  const dispatch = useAppDispatch();

  // ===========================
  // State Handling
  // ===========================

  const cells = useAppSelector(selectCells);
  const selectedCell = useAppSelector(getSelectedCell);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  const mouseIsDown = useRef(false);
  const isDraggingRef = useRef(false);
  const firstMouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    //TODO 
    //Needs a rework so that zooming and scrolling is more intuitive
    setZoom((prevZoom) => {
      const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
      let newZoom = Math.min(Math.max(prevZoom * scaleFactor, 0.3), 3);
      newZoom = Math.round(newZoom * 10) / 10;

      let zoomDif = Math.round((newZoom - prevZoom) * 10) / 10;

      // needs to change based on current offset 
      let subX = mx * zoomDif;
      let subY = my * zoomDif;

      let newX = Math.round((offset.x - subX) * 10) / 10;
      let newY = Math.round((offset.y - subY) * 10) / 10;

      let newOffset = {x: newX, y: newY};
      setOffset(newOffset);
      return newZoom;
    });
  }

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

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    
    lastMouseRef.current = { x: mx, y: my };
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
  };

  // ===========================
  // Canvas / hex size
  // ===========================

  let hexRadius = 50;
  let canvasWidth = 800;
  let canvasHeight = 800;

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
