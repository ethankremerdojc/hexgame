import { drawSvgToCanvas } from "./utils.ts";
import grassTileSvg from "./svg/grassTile.svg?raw";
import forestTileSvg from "./svg/forestTile.svg?raw";
import rockTileSvg from "./svg/rockTile.svg?raw";
import desertTileSvg from "./svg/desertTile.svg?raw";

function getPatternCanvas(img: string, tileWidth: number, tileHeight: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const tctx = tile.getContext("2d");

  if (!tctx) { 
    throw new Error("Unable to create tile.");
  };

  drawSvgToCanvas(
    img, tctx,
    0, 0,
    tileWidth, tileHeight
  );

  return tile
}


export function getGrassCanvas(radius: number): HTMLCanvasElement {
  return getPatternCanvas(grassTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getMountainCanvas(radius: number): HTMLCanvasElement {
  return getPatternCanvas(rockTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getDesertCanvas(radius: number): HTMLCanvasElement {
  return getPatternCanvas(desertTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getForestCanvas(radius: number): HTMLCanvasElement {
  return getPatternCanvas(forestTileSvg, radius, radius);
}
