import { MapSet } from '^/base/common/collection';
import { ClosePathCommand, CubicBezierPathCommand, LineToPathCommand, MoveToPathCommand, PathCommand, QuadraticBezierPathCommand } from '^/base/common/path-data';

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
export function * parsePathData(data: string): Generator<PathCommand> {
  const components = data.split(' ');
  for (let i = 0; i < components.length; i += 1) {
    switch (components[i]) {
      case 'M':
        yield new MoveToPathCommand(
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        );
        break;
      case 'L':
        yield new LineToPathCommand(
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        );
        break;
      case 'Q':
        yield new QuadraticBezierPathCommand(
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        );
        break;
      case 'C':
        yield new CubicBezierPathCommand(
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
          parseFloat(components[++i]),
        );
        break;
      case 'Z':
        yield new ClosePathCommand();
        break;
      default:
        throw new Error(`Unknown command ${components[i]} at index ${i} of ${data}`);
    }
  }
}
