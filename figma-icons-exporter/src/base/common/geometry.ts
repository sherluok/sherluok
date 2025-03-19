export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  left: number;
  right: number;
  width: number;
  top: number;
  bottom: number;
  height: number;
};

export type QuadraticBezier = {
  startingPoint: Point;
  controlPoint: Point;
  endPoint: Point;
};

export type CubicBezier = {
  startingPoint: Point;
  startControlPoint: Point;
  endControlPoint: Point;
  endPoint: Point;
};

/**
 * 两点之间线性插值。
 * @param start 起始端点，当 `t = 0` 时返回该值
 * @param end 结束端点，当 `t = 1` 时返回该值
 */
export function lerpPoint(start: Point, end: Point, t: number): Point {
  return {
    x: (1 - t) * start.x + t * end.x,
    y: (1 - t) * start.y + t * end.y,
  };
}

/**
 * 求三阶贝塞尔 `t` 对应的点。
 * @see https://mp.weixin.qq.com/s/ryAHxHL0VVk5Yz45Zk1JUg
 */
function lerpCubicBezierPoint(_: CubicBezier, t: number): Point {
  const a = lerpPoint(_.startingPoint, _.startControlPoint, t);
  const b = lerpPoint(_.startControlPoint, _.endControlPoint, t);
  const c = lerpPoint(_.endControlPoint, _.endPoint, t);
  const e = lerpPoint(a, b, t);
  const f = lerpPoint(b, c, t);
  return lerpPoint(e, f, t);
}

export function * getCubicBezierPolyline(_: CubicBezier, step: number): Generator<Point> {
  for (let t = 0; t <= 1; t += step) {
    yield lerpCubicBezierPoint(_, t);
  }
}

export function * getQuadraticBezierPolyline(_: QuadraticBezier, step: number): Generator<Point> {
  const cubicBezier = convertQuadraticBezierToCubicBezier(_);
  yield * getCubicBezierPolyline(cubicBezier, step);
}

/**
 * 二阶贝塞尔曲线升阶为三阶贝塞尔
 * @see https://mp.weixin.qq.com/s/k-jU2o0ihRfPSFg2_ctIaw?token=659769831&lang=zh_CN
 */
export function convertQuadraticBezierToCubicBezier(_: QuadraticBezier): CubicBezier {
  return {
    startingPoint: _.startingPoint,
    startControlPoint: {
      x: _.startingPoint.x + (2 / 3) * (_.controlPoint.x - _.startingPoint.x),
      y: _.startingPoint.y + (2 / 3) * (_.controlPoint.y - _.startingPoint.y),
    },
    endControlPoint: {
      x: _.endPoint.x + (2 / 3) * (_.controlPoint.x - _.endPoint.x),
      y: _.endPoint.y + (2 / 3) * (_.controlPoint.y - _.endPoint.y),
    },
    endPoint: _.endPoint,
  };
}

export function calcPolygonArea(points: Point[], absolute = false): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const addX = points[i].x;
    const addY = points[(i + 1) % points.length].y;
    const subX = points[(i + 1) % points.length].x;
    const subY = points[i].y;
    area += addX * addY * 0.5 - subX * subY * 0.5;
  }
  if (absolute) {
    return Math.abs(area);
  } else {
    return area;
  }
}

export function getPolygonBoundingBox(vertices: Point[]): BoundingBox {
  const xArr = vertices.map(({ x }) => x);
  const yArr = vertices.map(({ y }) => y);
  const minX = Math.min(...xArr);
  const maxX = Math.max(...xArr);
  const minY = Math.min(...yArr);
  const maxY = Math.max(...yArr);
  return {
    left: minX,
    right: maxX,
    width: maxX - minX,
    top: minY,
    bottom: maxY,
    height: maxY - minY,
  };
}

/**
 * 判断点是否在多边形内（射线法）
 * @see https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon#63436180
 * @see https://mp.weixin.qq.com/s/paXdumV4esHwnz3EbEj_1Q
 */
export function isPointInPolygon(pt: Point, polygon: Point[], bb: BoundingBox, skipBB = false): boolean {
  const between = (p: number, a: number, b: number) => (p >= a && p <= b) || (p <= a && p >= b);
  let inside = false;

  // not in bbox - quit || no bbox defined
  if (!skipBB || !bb.bottom) {
    if (bb.left > pt.x || bb.top > pt.y || bb.bottom < pt.y || bb.right < pt.x) {
      return false;
    }
  }

  for (let i = polygon.length - 1, j = 0; j < polygon.length; i = j, j++) {
    const A = polygon[i];
    const B = polygon[j];
    // corner cases
    if ((pt.x == A.x && pt.y == A.y) || (pt.x == B.x && pt.y == B.y))
      return true;
    if (A.y == B.y && pt.y == A.y && between(pt.x, A.x, B.x)) return true;
    if (between(pt.y, A.y, B.y)) {
      // if pt inside the vertical range
      // filter out "ray pass vertex" problem by treating the line a little lower
      if ((pt.y == A.y && B.y >= A.y) || (pt.y == B.y && A.y >= B.y)) continue;
      // calc cross product `ptA X ptB`, pt lays on left side of AB if c > 0
      const c = (A.x - pt.x) * (B.y - pt.y) - (B.x - pt.x) * (A.y - pt.y);
      if (c == 0) return true;
      if (A.y < B.y == c > 0) inside = !inside;
    }
  }
  return inside ? true : false;
}
