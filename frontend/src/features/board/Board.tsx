import React, { useEffect, useRef, useState  } from "react";
import { selectPoints, setPoints } from "@/features/board/boardSlice";
import { useAppDispatch, useAppSelector } from '@/app/hooks'

const TAU = 2 * Math.PI;

const randomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

class BoardGenerator {
  constructor(options={}, canvasWidth, canvasHeight) {
    const defaultGridOptions = {
      radius: 20,
      sides: 6,
      inset: 0,
      // Context
      lineWidth: 2,
      fillStyle: '#71411f',
      strokeStyle: 'white',
      // Other
      //randomColors: null
    };

    this.options = { ...defaultGridOptions, ...options };

    let diameter = this.options.radius * 2;
    this.options.boardWidth = canvasWidth / diameter;
    this.options.boardHeight = canvasHeight / diameter;
  }

  drawHexes(ctx, cells) {
    const opts = {...this.options};

    const hexPoints = this.createPoly(opts);

    opts.diameter = opts.radius * 2;
    ctx.fillStyle = opts.fillStyle;

    for (var cell of cells) {
      this.drawPoly(ctx, this.gridToPixel(cell[0], cell[1], opts), hexPoints, opts);
    }
  }

  createPoly(opts, points = []) {
    const
      { inset, radius, sides } = opts,
      size = radius - inset,
      step = TAU / sides;

    for (let i = 0; i < sides; i++) {
      points.push(this.toPolarCoordinate(0, 0, size, step * i));
    }
    return points;
  }

  drawPoly(ctx, origin, points, opts) {
    ctx.strokeStyle = opts.strokeStyle;
    ctx.save();
    ctx.translate(origin.x, origin.y);
    this.polyPath3(ctx, points);
    ctx.restore();
    if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
    if (opts.fillStyle) ctx.fill();
    if (opts.strokeStyle) ctx.stroke();
  }

  polyPath3(ctx, points = []) {
    const [{ x: startX, y: startY }] = points;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    points.forEach(({ x, y }) => { ctx.lineTo(x, y); });
    ctx.closePath();
  }

  gridToPixel(gridX, gridY, opts) {
    const m = this.gridMeasurements(opts);
    return this.toPoint(
      Math.floor(gridX * m.gridSpaceX),
      Math.floor(gridY * m.gridSpaceY + (gridX % 2 ? m.gridOffsetY : 0))
    );
  }

  gridMeasurements(opts) {
    const { diameter, inset, radius, sides } = opts,
      edgeLength = Math.sin(Math.PI / sides) * diameter,
      gridSpaceX = diameter - edgeLength / 2,
      gridSpaceY = Math.cos(Math.PI / sides) * diameter,
      gridOffsetY = gridSpaceY / 2;

    return {
      diameter,
      edgeLength,
      gridSpaceX,
      gridSpaceY,
      gridOffsetY
    };
  }

  toPoint(x, y) { return ({ x, y }) }

  toPolarCoordinate(centerX, centerY, radius, angle) {
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  // Random Board Generator Funcs

  static getRandomBoard(cellCount) {

    function getNeighborCell(cell) { 
      let changingIndex = randomItem([0, 1]);
      let changeAmount = randomItem([-1, 1]);

      let copied = [...cell];
      copied[changingIndex] += changeAmount;
      return copied;
    }

    let startCell = [6, 6];

    let cells = [startCell];

    for (let i=0; i < cellCount - 1; i++) {
      while (true) {
        let newCell = getNeighborCell(randomItem(cells));
        
        let exists = false;
        for (var cell of cells) {
          if (cell[0] == newCell[0] && cell[1] == newCell[1]) {
            exists = true;
          }
        }

        if (!exists) {
          cells.push(newCell);
          break
        }
      }
    }
    return cells;
  }
}

function drawBoard(canvas, cells) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const boardGen = new BoardGenerator({
    radius: 40,
    inset: 2,
  }, canvas.width, canvas.height);

  boardGen.drawHexes(ctx, cells);
}

export function Board() {
  const dispatch = useAppDispatch();
  const points = useAppSelector(selectPoints);
  const canvasRef = useRef(null);

  // Generate points
  useEffect(() => {
    if (points.length === 0) {
      const cells = BoardGenerator.getRandomBoard(25);
      dispatch(setPoints(cells));
    }
  }, [points, dispatch]);

  // draw to canvas
  useEffect(() => {
    if (points.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBoard(canvas, points);
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      style={{ border: "1px solid #ccc" }}
    />
  );
}
