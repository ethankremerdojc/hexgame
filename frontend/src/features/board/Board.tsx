import React, { useEffect, useRef, useState  } from "react";
import { selectCells, setCells } from "@/features/board/boardSlice";
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { BoardGenerator } from "./boardGen.ts";
import { randomItem } from "./utils.js";

function drawBoard(canvas, cells, hexRadius, offsetX, offsetY, selectedCell) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const boardGen = new BoardGenerator({
    radius: hexRadius,
    inset: 2,
    offsetX: offsetX,
    offsetY: offsetY,
    selectedCell: selectedCell
  }, canvas.width, canvas.height);

  boardGen.drawHexes(ctx, cells);
}

export function Board() {
  const dispatch = useAppDispatch();
  const cells = useAppSelector(selectCells);
  const canvasRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (cells.length === 0) {
      const newCells = BoardGenerator.getRandomBoard(hexRadius, canvasWidth, canvasHeight);
      dispatch(setCells(newCells));
    }
  }, [cells, dispatch]);

  // draw to canvas
  useEffect(() => {
    if (cells.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBoard(canvas, cells, hexRadius*zoom, offset.x, offset.y, randomItem(cells));
  }, [cells, zoom, offset]);

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

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    isDraggingRef.current = true;
    lastMouseRef.current = { x: mx, y: my };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - lastMouseRef.current.x;
    const dy = my - lastMouseRef.current.y;

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMouseRef.current = { x: mx, y: my };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  let hexRadius = 50;
  let canvasWidth = 800;
  let canvasHeight = 800;

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
