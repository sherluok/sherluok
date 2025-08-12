import { calcPolygonArea, getCubicBezierPolyline, getPolygonBoundingBox, getQuadraticBezierPolyline, isPointInPolygon, Point } from './geometry';

export type PathCommand = [
  MoveToPathCommand,
  LineToPathCommand,
  QuadraticBezierPathCommand,
  CubicBezierPathCommand,
  ClosePathCommand,
][number];

export type SubPathInternalCommand = [
  LineToPathCommand,
  QuadraticBezierPathCommand,
  CubicBezierPathCommand,
][number];

export class SubPath {
  constructor(
    public moveToCommand: MoveToPathCommand,
    public internalCommands: SubPathInternalCommand[],
    public closeCommand: ClosePathCommand | null,
  ) {}

  * [Symbol.iterator](): Generator<PathCommand> {
    yield this.moveToCommand;
    yield * this.internalCommands;
    if (this.closeCommand) {
      yield this.closeCommand;
    }
  }

  get closed(): boolean {
    return this.closeCommand !== null;
  }
}

/**
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#moveto_path_commands)
 */
export class MoveToPathCommand {
  public readonly type = 'M';

  constructor(
    public x: number,
    public y: number,
  ) { }

  toString() {
    return [this.type, this.x, this.y].join(' ');
  }

  translate(x: number, y: number) {
    return new MoveToPathCommand(
      this.x + x,
      this.y + y,
    );
  }

  get endPoint(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

/**
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#lineto_path_commands)
 */
export class LineToPathCommand {
  public readonly type = 'L';

  constructor(
    public x: number,
    public y: number,
  ) { }

  toString() {
    return [this.type, this.x, this.y].join(' ');
  }

  translate(x: number, y: number) {
    return new LineToPathCommand(
      this.x + x,
      this.y + y,
    );
  }

  get endPoint(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

/**
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#quadratic_b%C3%A9zier_curve)
 */
export class QuadraticBezierPathCommand {
  public readonly type = 'Q';

  constructor(
    public x1: number,
    public y1: number,
    public x: number,
    public y: number,
  ) { }

  toString() {
    return [this.type, this.x1, this.y1, this.x, this.y].join(' ');
  }

  translate(x: number, y: number) {
    return new QuadraticBezierPathCommand(
      this.x1 + x,
      this.y1 + y,
      this.x + x,
      this.y + y,
    );
  }

  get endPoint(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }

  get controlPoint(): Point {
    return {
      x: this.x1,
      y: this.y1,
    };
  }
}

/**
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#cubic_b%C3%A9zier_curve)
 */
export class CubicBezierPathCommand {
  public readonly type = 'C';

  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public x: number,
    public y: number,
  ) { }

  toString() {
    return [this.type, this.x1, this.y1, this.x2, this.y2, this.x, this.y].join(' ');
  }

  translate(x: number, y: number) {
    return new CubicBezierPathCommand(
      this.x1 + x,
      this.y1 + y,
      this.x2 + x,
      this.y2 + y,
      this.x + x,
      this.y + y,
    );
  }

  get endPoint(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }

  get startControlPoint(): Point {
    return {
      x: this.x1,
      y: this.y1,
    };
  }

  get endControlPoint(): Point {
    return {
      x: this.x2,
      y: this.y2,
    };
  }
}

/**
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d#closepath)
 */
export class ClosePathCommand {
  public readonly type = 'Z';

  constructor() { }

  toString() {
    return [this.type].join(' ');
  }

  translate(x: number, y: number) {
    return new ClosePathCommand();
  }
}

export function translatePath(commands: PathCommand[], x: number, y: number): PathCommand[] {
  return commands.map((command) => command.translate(x, y));
}

export function stringifyPath(commands: PathCommand[]): string {
  return commands.map((command) => command.toString()).join(' ');
}

export function * splitPathToSubPaths(commands: PathCommand[]): Generator<SubPath> {
  let moveToCommand: MoveToPathCommand | null = null;
  let internalCommands: SubPathInternalCommand[] = [];
  let closeCommand: ClosePathCommand | null = null;
  for (let command of commands) {
    if (command.type === 'Z') {
      closeCommand = command;
      continue;
    }
    if (command.type === 'M') {
      if (moveToCommand) {
        yield new SubPath(
          moveToCommand,
          internalCommands,
          closeCommand,
        );
      }
      moveToCommand = command;
      internalCommands = [];
      closeCommand = null;
      continue;
    }
    if (closeCommand) {
      throw new Error(`Invalid command ${stringifyPath([...internalCommands, command])}, Z must be followed by M!`);
    }
    internalCommands.push(command);
  }
  if (moveToCommand) {
    yield new SubPath(
      moveToCommand,
      internalCommands,
      closeCommand,
    );
  }
}

function reverseSubPath(subPath: SubPath): SubPath {
  const internalCommands: SubPathInternalCommand[] = [];
  let currentPoint = subPath.moveToCommand.endPoint;
  for (const command of subPath.internalCommands) {
    switch (command.type) {
      case 'L':
        internalCommands.unshift(new LineToPathCommand(
          currentPoint.x,
          currentPoint.y,
        ));
        currentPoint = command.endPoint;
        break;
      case 'Q':
        internalCommands.unshift(new QuadraticBezierPathCommand(
          command.x1,
          command.y1,
          currentPoint.x,
          currentPoint.y,
        ));
        currentPoint = command.endPoint;
        break;
      case 'C':
        internalCommands.unshift(new CubicBezierPathCommand(
          command.x2,
          command.y2,
          command.x1,
          command.y1,
          currentPoint.x,
          currentPoint.y,
        ));
        currentPoint = command.endPoint;
        break;
    }
  }

  const moveToCommand = new MoveToPathCommand(currentPoint.x, currentPoint.y);
  const closeCommand = subPath.closed ? new ClosePathCommand() : null;

  return new SubPath(
    moveToCommand,
    internalCommands,
    closeCommand,
  );
}

/** Convert path that display normal with `fill="evenodd"` to path that display normal with `fill="nonezero"`. */
export function normalizeWindingRule(commands: PathCommand[], toClockwise = false, sort = true, step = 0.1): PathCommand[] {
  let subPaths = [...splitPathToSubPaths(commands)];

  const polys = subPaths.map((subPath, index) => {
    const pts = [...getPathDataPolyine(subPath, step)];
    const bb = getPolygonBoundingBox(pts);
    const area = calcPolygonArea(pts);
    const cw = area >= 0;
    const includes: number[] = [];
    const includedIn: number[] = [];
    return { pts, bb, cw, index, inter: 0, includes, includedIn };
  });

  // check poly intersections
  for (let i = 0; i < polys.length; i++) {
    const prev = polys[i];

    for (let j = 0; j < polys.length; j++) {
      const next = polys[j];

      // skip if the same poly or parent
      if (i === j || next.includes.includes(i)) {
        continue;
      }

      // if mid point is in previous polygon
      const ptMid = { x: next.bb.left + next.bb.width / 2, y: next.bb.top + next.bb.height / 2 };
      const inPoly = isPointInPolygon(ptMid, prev.pts, prev.bb);

      if (inPoly) {
        polys[j].inter += 1;
        next.includedIn.push(i);
        prev.includes.push(j);
      }
    }
  }

  // reverse paths
  for (let i = 0; i < polys.length; i++) {
    let { cw, includedIn, includes } = polys[i];

    // outer path direction to counter clockwise
    if (
      !includedIn.length && cw && !toClockwise
      || !includedIn.length && !cw && toClockwise
    ) {
      subPaths[i] = reverseSubPath(subPaths[i]);
      polys[i].cw = polys[i].cw ? false : true;
      cw = polys[i].cw;
    }

    // reverse inner sub paths
    for (let j = 0; j < includes.length; j++) {
      let ind = includes[j];
      let child = polys[ind];

      if (child.cw === cw) {
        subPaths[ind] = reverseSubPath(subPaths[ind]);
        polys[ind].cw = polys[ind].cw ? false : true;
      }
    }
  }

  return subPaths.map((it) => [...it]).flat();
}

// Polyfill for iterator helpers, which Figma QuickJS plugin runtime do not have.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helper_objects
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/drop
// https://www.figma.com/blog/an-update-on-plugin-security/
// https://bellard.org/quickjs/Changelog
function * drop<T>(generator: Generator<T>, count: number): Generator<T> {
  let i = 0;
  for (const it of generator) {
    if (i++ >= count) {
      yield it;
    }
  }
}

function* getPathDataPolyine(commands: Iterable<PathCommand>, step: number): Generator<Point> {
  let currentPoint: Point | null = null;
  for (const command of commands) {
    switch (command.type) {
      case 'M':
      case 'L': {
        yield command.endPoint;
        currentPoint = command.endPoint;
        break;
      }
      case 'Q': {
        if (!currentPoint) {
          throw new Error('Unexpected start command Q!');
        }
        yield* drop(getQuadraticBezierPolyline({
          startingPoint: currentPoint,
          controlPoint: command.controlPoint,
          endPoint: command.endPoint,
        }, step), 1);
        currentPoint = command.endPoint;
        break;
      }
      case 'C':
        if (!currentPoint) {
          throw new Error('Unexpected start command C!');
        }
        yield* drop(getCubicBezierPolyline({
          startingPoint: currentPoint,
          startControlPoint: command.startControlPoint,
          endControlPoint: command.endControlPoint,
          endPoint: command.endPoint,
        }, step), 1);
        currentPoint = command.endPoint;
        break;
    }
  }
}
