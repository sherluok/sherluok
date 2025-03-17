import { getFixedPathDataString } from '^/fix';
import { MapSet } from '^/base/common/collection';

export function findFrameNode(frameNodeName: string, parent: ChildrenMixin = figma.currentPage): FrameNode | null {
  for (const node of parent.children) {
    if (node.type === 'FRAME' && node.name === frameNodeName) {
      return node;
    }
  }
  return null;
}

export function getVariantOptions(component: ComponentSetNode, property: string): string[] {
  // https://www.figma.com/plugin-docs/api/ComponentSetNode/#component-properties-related-properties
  if (!(property in component.componentPropertyDefinitions && component.componentPropertyDefinitions[property].type === 'VARIANT')) {
    throw new Error(`Requires variant property "name" on component "${component.name}"!`);
  }
  if (!Array.isArray(component.componentPropertyDefinitions[property].variantOptions)) {
    throw new Error(`No options found variant property "name" on component "${component.name}"!`);
  }
  return component.componentPropertyDefinitions[property].variantOptions;
}

export function outlineStroke(frame: FrameNode) {
  for (const child of frame.children) {
    switch (child.type) {
      case 'LINE':
      case 'POLYGON':
      case 'RECTANGLE':
      case 'ELLIPSE':
      // case 'TEXT':
      case 'VECTOR':
        const outlined = child.outlineStroke();
        if (outlined) {
          frame.appendChild(outlined);
          child.remove();
        }
        break;
      default:
        break;
    }
  }
}

export function unionByFillStyle(frame: FrameNode) {
  const solidPaints: Record<string, SolidPaint> = {};
  const groups = new MapSet<SolidPaint, SceneNode>();
  for (const child of frame.children) {
    if (hasFills(child) && isSolidFill(child.fills)) {
      const solidPaint = child.fills[0];
      let id: string;
      if (solidPaint.boundVariables?.color) {
        id = solidPaint.boundVariables.color.id + 'opacity:' + child.opacity;
        solidPaints[id] ??= solidPaint;
      } else {
        id = stringifySolidPaint(solidPaint, child.opacity);
        solidPaints[id] ??= solidPaint;
      }
      groups.add(solidPaints[id], child);
    }
  }
  for (const [solidPaint, set] of groups.entries()) {
    if (set.size === 1) {
      figma.flatten([...set], frame);
    } else {
      const union = figma.union([...set], frame);
      union.fills = [solidPaint];
      figma.flatten([union], frame);
    }
  }
}

export function hasFills(node: BaseNode): node is VectorNode {
  return 'fills' in node;
}

export function isSolidFill(fills: readonly Paint[] | typeof figma.mixed): fills is SolidPaint[] {
  return Array.isArray(fills) && fills.length === 1 && fills[0].type === 'SOLID';
}

export function stringifySolidPaint(paint: SolidPaint, pathThrough = 0) {
  const { color: { r, g, b }, opacity = 0 } = paint;
  return `#${[r, g, b, opacity * pathThrough].map((n) => Math.floor(n * 255).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * A series of path commands that encodes how to draw the path.
 * @see https://www.figma.com/plugin-docs/api/properties/VectorPath-data/
 * @see https://www.figma.com/plugin-docs/api/VectorPath/
 */
export namespace FigmaVectorPathData {
  export type Command = [
    ['M', x: number, y: number],
    ['L', x: number, y: number],
    ['Q', x0: number, y0: number, x: number, y: number],
    ['C', x0: number, y0: number, x1: number, y1: number, x: number, y: number],
    ['Z'],
  ][number];

  export type Commands = Command[];

  export function * parse(data: string): Generator<Command> {
    const components = data.split(' ');
    for (let i = 0; i < components.length; ++i) {
      const c = components[i];
      if (c === 'M' || c === 'L') {
        yield [
          c,
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        ];
      } else if (c === 'Q') {
        yield [
          c,
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        ];
      } else if (c === 'C') {
        yield [
          c,
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        ];
      } else if (c === 'Z') {
        yield [c];
      } else {
        throw new Error(`Unknown command: ${c}`);
      }
    }
  }

  export function translate(commands: Commands, x: number, y: number): Commands {
    return commands.map((it) => {
      switch (it[0]) {
        case 'M':
        case 'L':
          return [it[0], it[1] + x, it[2] + y];
        case 'Q':
          return [it[0], it[1] + x, it[2] + y, it[3] + x, it[4] + y];
        case 'C':
          return [it[0], it[1] + x, it[2] + y, it[3] + x, it[4] + y, it[5] + x, it[6] + y];
        default:
          return [it[0]];
      }
    });
  }

  export function stringify(commands: Commands): string {
    return commands.flat().join(' ');
  }

  export function nonezero(commands: Commands): Commands {
    return [...parse(getFixedPathDataString(stringify(commands)))];
  }
}
