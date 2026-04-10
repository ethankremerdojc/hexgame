import { drawSvgToCanvas } from "./utils.js";
import grassTileSvg from "./svg/grassTile.svg?raw";
import forestTileSvg from "./svg/forestTile.svg?raw";
import rockTileSvg from "./svg/rockTile.svg?raw";
import waterTileSvg from "./svg/waterTile.svg?raw";

function getPatternCanvas(img, tileWidth, tileHeight) {
  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const tctx = tile.getContext("2d");

  drawSvgToCanvas(
    img, tctx,
    0, 0,
    tileWidth, tileHeight
  );

  return tile
}


export function getGrassCanvas(radius) {
  return getPatternCanvas(grassTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getMountainCanvas(radius) {
  return getPatternCanvas(rockTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getWaterCanvas(radius) {
  return getPatternCanvas(waterTileSvg, Math.floor(radius/2), Math.floor(radius/2));
}

export function getForestCanvas(radius) {
  return getPatternCanvas(forestTileSvg, radius, radius);
}
