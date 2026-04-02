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
      //radius: 20,
      sides: 6,
      inset: 0,
      // Context
      lineWidth: 2,
      fillStyle: '#71411f',
      strokeStyle: 'white',

      offsetX: 0,
      offsetY: 0
      // Other
      //randomColors: null
    };

    this.options = { ...defaultGridOptions, ...options };
    //console.log("options: ", this.options);
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
      Math.floor(gridX * m.gridSpaceX) + opts.offsetX,
      Math.floor(gridY * m.gridSpaceY + (gridX % 2 ? m.gridOffsetY : 0)+ opts.offsetY)
    );
  }

  gridMeasurements(opts) {
    const { diameter, radius, sides } = opts,
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

  static getHexBoardSize(canvasWidth, canvasHeight, radius) {
    const hexWidth = radius * 2;
    const colStep = radius * 1.5;
    const rowStep = Math.sqrt(3) * radius;
    const rowOffset = rowStep / 2;

    const cols = Math.floor((canvasWidth - hexWidth) / colStep);
    const rows = Math.floor((canvasHeight - hexWidth - rowOffset) / rowStep) + 1;

    return {
      cols: Math.max(0, cols),
      rows: Math.max(0, rows),
    };
  }

  // Random Board Generator Funcs

  static getRandomBoard(hexRadius, canvasWidth, canvasHeight) {

    let boardSizes = BoardGenerator.getHexBoardSize(canvasWidth, canvasHeight, hexRadius)
    let boardWidth = boardSizes.cols;
    let boardHeight = boardSizes.rows;

    let maxCellCount = boardWidth * boardHeight;
    let cellCount = Math.floor(maxCellCount * 0.7);
    console.log("cell count: ", cellCount);

    let startCell = [Math.floor(boardWidth / 2), Math.floor(boardHeight / 2)];
    let cells = [startCell];

    function getNeighborCell(cell) { 
      let changingIndex = randomItem([0, 1]);
      let changeAmount = randomItem([-1, 1]);

      var newVal = cell[changingIndex] + changeAmount;
      
      if (newVal == 0) {
        newVal = cell[changingIndex] + 1;
      }

      if (changingIndex == 0 && newVal == boardWidth + 1) {
        newVal = cell[0] - 1;
      } else if (changingIndex == 1 && newVal == boardHeight + 1) {
        newVal = cell[1] - 1;
      }

      if (newVal > boardWidth && changingIndex == 1) {
        console.log("height", {
          new: newVal, 
          old: cell,
          changeAmount: changeAmount
        });
      }
      
      if (changingIndex == 0) {
        return [newVal, cell[1]];
      } else {
        return [cell[0], newVal];
      }
    }

    for (let i=0; i < cellCount - 1; i++) {
      while (true) {
        let newCell = getNeighborCell(randomItem(cells));

        // check if this cell already in there
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

function drawBoard(canvas, cells, hexRadius, offsetX, offsetY) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const boardGen = new BoardGenerator({
    radius: hexRadius,
    inset: 2,
    offsetX: offsetX,
    offsetY: offsetY
  }, canvas.width, canvas.height);

  boardGen.drawHexes(ctx, cells);
}

export function Board() {
  const dispatch = useAppDispatch();
  const points = useAppSelector(selectPoints);
  const canvasRef = useRef(null);

  let canvasWidth = 800;
  let canvasHeight = 800;

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  let hexRadius = 50;

  // Generate points
  useEffect(() => {
    if (points.length === 0) {
      const cells = BoardGenerator.getRandomBoard(hexRadius, canvasWidth, canvasHeight);
      dispatch(setPoints(cells));
    }
  }, [points, dispatch]);

  // draw to canvas
  useEffect(() => {
    if (points.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBoard(canvas, points, hexRadius*zoom, offset.x, offset.y);
  }, [points, zoom, offset]);

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
    console.log(dx, dy);

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
