// import { camelCase } from 'lodash';
// import { EXIT, visit } from 'unist-util-visit';
// import { Element } from 'xast';
// import { fromXml } from 'xast-util-from-xml';
// import { MapSet, ok } from './base';

// console.clear();
// console.log('Banner of Peatip Icons Exporter.');

// // This plugin will open a window to prompt the user to enter a number, and
// // it will then create that many rectangles on the screen.

// // This file holds the main code for plugins. Code in this file has access to
// // the *figma document* via the figma global object.
// // You can access browser APIs in the <script> tag inside "ui.html" which has a
// // full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// // This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// // Calls to "parent.postMessage" from within the HTML page will trigger this
// // callback. The callback will be passed the "pluginMessage" property of the
// // posted message
// figma.ui.onmessage =  (msg: {type: string, count: number}) => {
//   // One way of distinguishing between different types of messages sent from
//   // your HTML page is to use an object with a "type" property like this.
//   if (msg.type === 'create-rectangles') {
//     const nodes: SceneNode[] = [];
//     for (let i = 0; i < msg.count; i++) {
//       const rect = figma.createRectangle();
//       rect.x = i * 150;
//       rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//       figma.currentPage.appendChild(rect);
//       nodes.push(rect);
//     }
//     figma.currentPage.selection = nodes;
//     figma.viewport.scrollAndZoomIntoView(nodes);
//   }

//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };

// async function main() {
//   const sourceName = 'Icon';
//   const sourceNode = findIconSource(sourceName);

//   type Path = [d: string, fill: string, fillOpacity?: number];
//   const entries: [name: string, [width: number, height: number, paths: Path[]]][] = [];
//   for (const it of sourceNode.children) {
//     if (!(it.type === 'FRAME' && it.children.length)) {
//       console.warn(it.name, it.type, it);
//       return;
//     }
//     const paths: Path[] = [];
//     const start = Date.now();
//     const clone = it.clone();
//     try {
//       clone.resize(it.width, it.height);

//       outlineStroke(clone);
//       unionByFillStyle(clone);

//       const bytes = await clone.exportAsync({
//         format: 'SVG_STRING',
//         contentsOnly: true,
//         svgIdAttribute: false,
//         svgOutlineText: true,
//       });

//       const element = await new Promise<Element>((resolve, reject) => {
//         // console.log(bytes);
//         const xastRoot = fromXml(bytes);
//         visit(xastRoot, 'element', (svgElement) => {
//           if (svgElement.name === 'svg') {
//             visit(svgElement, 'element', (node) => {
//               if (node.name === 'svg') {
//                 return;
//               }
//               if (node.name !== 'path') {
//                 console.warn(`Frame "${it.name}": Element node tag type "${node.name}" is not allowed!`);
//                 return;
//               }
//               // if (node.attributes.fill === '#D9D9D9') {
//               //   delete node.attributes.fill;
//               // }
//               const d = node.attributes['d'];
//               ok(d);
//               const fill = node.attributes['fill'] ?? 'red';
//               const fillOpacity = parseFloat(node.attributes['fill-opacity'] ?? '1');
//               paths.push([d, fill, fillOpacity]);
//             });
//             resolve(svgElement);
//             return EXIT;
//           }
//         });
//         reject('cannot find svg element.');
//       });

//       entries.push([it.name, [it.width, it.height, paths]]);
//     } finally {
//       console.log('[processing icon] %s %dms', it.name, Date.now() - start);
//       clone.remove();
//     }
//   }

//   await fetch('http://localhost:3974/api/figma-icons-exporter', {
//     method: 'POST',
//     body: JSON.stringify(Object.fromEntries(entries)),
//   });
// }

// main().finally(() => {
//   figma.closePlugin();
// });

// function createMetadata(entries: [string, Element][]) {
//   return Object.fromEntries(entries.map(([name, element]) => {
//     visit(element, 'element', (childElement) => {
//       childElement.attributes = Object.fromEntries(Object.entries(childElement.attributes).map(([key, value]) => {
//         return [camelCase(key), value];
//       }));
//     });
//     delete element.attributes.fill;
//     delete element.attributes.xmlns;
//     delete element.attributes.width;
//     delete element.attributes.height;
//     return [name, JSON.parse(JSON.stringify(element, (key, value) => {
//       if (typeof value === 'object' && value !== null && 'type' in value) {
//         if (value.type !== 'element') {
//           console.log('unknown node type:', key, value);
//           return undefined;
//         } else {
//           return [value.name, value.attributes, value.children];
//         }
//       }
//       return value;
//     }))];
//   }));
// }

// function findIconSource(frameName: string): FrameNode {
//   for (const node of figma.currentPage.children) {
//     // console.log(node.type, node.name);
//     if (node.type === 'FRAME' && node.name === frameName) {
//       return node;
//     }
//   }

//   throw `Cannot find component ${frameName}.`;
// }

// function getVariantOptions(component: ComponentSetNode, property: string): string[] {
//   // https://www.figma.com/plugin-docs/api/ComponentSetNode/#component-properties-related-properties
//   if (!(property in component.componentPropertyDefinitions && component.componentPropertyDefinitions[property].type === 'VARIANT')) {
//     throw new Error(`Requires variant property "name" on component "${component.name}"!`);
//   }
//   if (!Array.isArray(component.componentPropertyDefinitions[property].variantOptions)) {
//     throw new Error(`No options found variant property "name" on component "${component.name}"!`);
//   }
//   return component.componentPropertyDefinitions[property].variantOptions;
// }

// function outlineStroke(frame: FrameNode) {
//   for (const child of frame.children) {
//     switch (child.type) {
//       case 'LINE':
//       case 'POLYGON':
//       case 'RECTANGLE':
//       case 'ELLIPSE':
//       // case 'TEXT':
//       case 'VECTOR':
//         const outlined = child.outlineStroke();
//         if (outlined) {
//           frame.appendChild(outlined);
//           child.remove();
//         }
//         break;
//       default:
//         break;
//     }
//   }
// }

// function unionByFillStyle(frame: FrameNode) {
//   const groups = new MapSet<string, SceneNode>();
//   for (const child of frame.children) {
//     if (hasFills(child) && isSolidFill(child.fills)) {
//       const rgba = stringifySolidPaint(child.fills[0], child.opacity);
//       groups.add(rgba, child);
//     }
//   }
//   for (const [color, set] of groups.entries()) {
//     if (set.size === 1) {
//       figma.flatten([...set], frame);
//     } else {
//       const union = figma.union([...set], frame);
//       union.fills = [figma.util.solidPaint(color)];
//       figma.flatten([union], frame);
//     }
//   }
// }

// function hasFills(node: BaseNode): node is VectorNode {
//   return 'fills' in node;
// }

// function isSolidFill(fills: readonly Paint[] | typeof figma.mixed): fills is SolidPaint[] {
//   return Array.isArray(fills) && fills.length === 1 && fills[0].type === 'SOLID';
// }

// function stringifySolidPaint(paint: SolidPaint, pathThrough = 0) {
//   const { color: { r, g, b }, opacity = 0 } = paint;
//   return `#${[r, g, b, opacity * pathThrough].map((n) => Math.floor(n * 255).toString(16).padStart(2, '0')).join('')}`;
// }

