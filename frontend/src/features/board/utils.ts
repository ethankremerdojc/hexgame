export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomItem = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getCSRFToken(): string {
  const name = "csrftoken=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }

  return "";
}

// Below two have both the names and numbers if you do values, otherwise reversed
// White, Purple, Red, 0, 1, 2
export function getEnumValueByIndex(enumeration: any, index: number): any {
  const keys = Object.keys(enumeration);
  return keys[index];
}

export function getRandomEnumValue(enumeration: any): number {
  const keys = Object.keys(enumeration);
  return randomInt(0, Math.floor(keys.length / 2));
}

function applyElementTransform(el: any, path:any) {
  const transformList = el.transform?.baseVal;

  if (!transformList || transformList.numberOfItems === 0) {
    return path;
  }

  const consolidated = transformList.consolidate();
  if (!consolidated) {
    return path;
  }

  const m = consolidated.matrix;

  const matrix = new DOMMatrix([
    m.a, m.b,
    m.c, m.d,
    m.e, m.f,
  ]);

  const transformedPath = new Path2D();
  transformedPath.addPath(path, matrix);
  return transformedPath;
}

function getChildItems(parent: any, teamColor: string|void): any[] {

  let items: any[] = [];

  for (const el of parent.children) {
    const tag = el.tagName.toLowerCase();

    if (tag == "g") { // group
      items = [...items, ...getChildItems(el, teamColor)];
      continue
    }

    let strokeColor = el.getAttribute("stroke");
    if (strokeColor == "$TEAMCOLOR$") {
      strokeColor = teamColor;
    }

    let strokeWidth = el.getAttribute("strokewidth");

    let fillColor = el.getAttribute("fill");
    if (fillColor == "$TEAMCOLOR$") {
      fillColor = teamColor;
    }

    let path = new Path2D();

    if (tag === "path") {
      const d = el.getAttribute("d");
      if (!d) continue;
      path = new Path2D(d),
      path = applyElementTransform(el, path);

      items.push({
        path,
        fill: fillColor,
        stroke: strokeColor,
        srokeWidth: strokeWidth
      });
    }

    if (tag === "circle") {
      const cx = Number(el.getAttribute("cx") || 0);
      const cy = Number(el.getAttribute("cy") || 0);
      const r = Number(el.getAttribute("r") || 0);

      path.arc(cx, cy, r, 0, Math.PI * 2);
      path = applyElementTransform(el, path);

      items.push({
        path,
        fill: fillColor,
        stroke: strokeColor,
        srokeWidth: strokeWidth
      });
    }

    if (tag === "rect") {
      const x = Number(el.getAttribute("x") || 0);
      const y = Number(el.getAttribute("y") || 0);
      const width = Number(el.getAttribute("width") || 0);
      const height = Number(el.getAttribute("height") || 0);

      path.rect(x, y, width, height);
      path = applyElementTransform(el, path);

      items.push({
        path,
        fill: fillColor,
        stroke: strokeColor,
        srokeWidth: strokeWidth
      });
    }
  }

  return items
}

function svgToPath2Ds(svgText: string, teamColor:string|void) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  var svg = doc.querySelector("svg");

  if (!svg) {
    throw new Error("Invalid SVG: no <svg> root found");
  }

  const items = getChildItems(svg, teamColor);

  return {
    viewBox: svg.getAttribute("viewBox"),
    items,
  };
}

function drawSvgPath2Ds(ctx: CanvasRenderingContext2D, svgData: any, x: number, y: number, width: number, height: number) {
  const [minX, minY, vbWidth, vbHeight] = svgData.viewBox
    .split(/\s+/)
    .map(Number);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width / vbWidth, height / vbHeight);
  ctx.translate(-minX, -minY);

  for (const item of svgData.items) {
    if (item.fill && item.fill !== "none") {
      ctx.fillStyle = item.fill;
      ctx.fill(item.path);
    }

    if (item.stroke && item.stroke !== "none") {
      ctx.strokeStyle = item.stroke;
      ctx.stroke(item.path);
    }
  }

  ctx.restore();
}

export function drawSvgToCanvas(svgData: any, ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, teamColor: string|void=undefined) {
  let svgImageData = svgToPath2Ds(svgData, teamColor);
  drawSvgPath2Ds(ctx, svgImageData, x, y, width, height);
}
