import { findFrameNode, outlineStroke, parsePathData, stringifySolidPaint, unionByFillStyle } from '^/base/figma';
import { normalizeWindingRule, stringifyPath, translatePath } from '^/base/path-data';
import { PluginMessageFromUI, sendMessageToUI, sendPendingMessageToUI } from './message';

console.clear();

// https://www.figma.com/plugin-docs/api/properties/figma-showui/
figma.showUI(__html__, {
  width: 400,
  height: 720,
  themeColors: true,
});

figma.ui.on('message', async (pluginMessage: unknown): Promise<void> => {
  console.log('[figma.ui.onmessage]', pluginMessage);
  const { error, data: message } = PluginMessageFromUI.safeParse(pluginMessage);
  if (error) {
    console.error(error);
    return;
  }
  if (message.type === 'export') {
    if (message.data.sendToServer) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    runExport();
    return;
  }

  if (message.type === 'request') {
    if (message.method === 'select-source-node') {
      const requestId = message.id;
      figma.on('selectionchange', () => {
        if (figma.currentPage.selection.length === 1) {
          const node = figma.currentPage.selection[0];
          if (node.type === 'FRAME') {
            sendMessageToUI({
              id: requestId,
              type: 'response',
              method: 'select-source-node',
              success: true,
              value: {
                nodeId: node.id,
                nodeName: node.name,
              },
            });
            return;
          }
          sendMessageToUI({
            id: requestId,
            type: 'response',
            method: 'select-source-node',
            success: false,
            error: 'The node you select is not a Frame node!',
          });
          return;
        }
        sendMessageToUI({
          id: requestId,
          type: 'response',
          method: 'select-source-node',
          success: false,
          error: 'The node you select is not a single node!',
        });
      });
      return;
    }
    return;
  }

  console.log(`Unkndown message type "${message.type}", close plugin.`);
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
});

async function runExport(
  sourceNodeName = 'Icon',
): Promise<void> {

  // 1. Find source node by name or id.

  const sourceNode = findFrameNode(sourceNodeName);

  if (!sourceNode) {
    sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: `Cannot find Frame type node by name "${sourceNodeName}"!` } });
    return;
  }

  if (!sourceNode.children.length) {
    sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: `Source node "${sourceNodeName}" has no child!` } });
    return;
  }

  // 2. Create a temporary fromatting context node.

  const formattingContextNodeName = 'Icon Formatted';
  findFrameNode(formattingContextNodeName)?.remove();
  const formattingContextNode = (() => {
    const sampleItemSize = sourceNode.children[0].width;

    const node = figma.createFrame();
    node.name = formattingContextNodeName;
    node.x = sourceNode.x + sourceNode.width + sampleItemSize;
    node.y = sourceNode.y;

    node.resize(sampleItemSize * (10 + 1), sampleItemSize * (10 + 1));
    node.fills = [{ type: 'SOLID', color: { r: .25, g: .25, b: .25 } }];
    // https://www.figma.com/plugin-docs/api/properties/nodes-counteraxisspacing/
    node.layoutMode = 'HORIZONTAL';
    node.layoutWrap = 'WRAP';
    node.primaryAxisSizingMode = 'FIXED'; // width fixed
    node.counterAxisSizingMode = 'AUTO'; // height fit-content
    node.itemSpacing = sampleItemSize; // column-gap
    node.counterAxisSpacing = sampleItemSize; // row-gap
    node.paddingTop = sampleItemSize;
    node.paddingLeft = sampleItemSize;
    node.paddingRight = sampleItemSize;
    node.paddingBottom = sampleItemSize;
    return node;
  })();

  // 3. Flatten and outline nodes, make svg only contain <path> elements.

  const allLocalVariables = await figma.variables.getLocalVariablesAsync().then((vars) => Object.fromEntries(vars.map((it) => [it.id, it])));

  type Path = {
    d: string;
    opacity: number;
    fill: string | { var: string };
  };

  type Icon = {
    width: number;
    height: number;
    paths: Path[];
  };

  const exportedVars: Record<string, string> = {};
  const exportedIcons: Record<string, Icon> = {};

  for (const icon of sourceNode.children) {
    if (icon.type !== 'FRAME') {
      sendPendingMessageToUI(`Warning: Node ${icon.name} is not a FrameNode but a ${icon.type}!`);
      continue;
    }

    if (icon.children.length === 0) {
      sendPendingMessageToUI(`Warning: FrameNode ${icon.name} has no child!`);
      continue;
    }

    const startTime = Date.now();
    const clone = icon.clone();

    try {
      clone.resize(icon.width, icon.height);

      outlineStroke(clone);
      unionByFillStyle(clone);

      const pathDatas: Path[] = [];

      for (const element of clone.children) {
        if (element.type !== 'VECTOR') {
          sendPendingMessageToUI(`Warning: ${clone.name}'s child ${element.name} is not a VectorNode but a ${element.type}!`);
          element.remove();
          continue;
        }

        // https://www.figma.com/plugin-docs/api/Constraints/
        element.constraints = {
          horizontal: 'SCALE',
          vertical: 'SCALE',
        };

        const opacity = clone.opacity * element.opacity;

        let fill: string | { var: string };
        const fills = element.fills;
        if (typeof fills === 'symbol') {
          console.warn(`%s's child %s's fills not paints!`, clone.name, element.name, fills);
        } else {
          const visiblePaints = fills.filter((fill) => fill.visible);
          if (visiblePaints.length !== 1) {
            console.warn(`%s's child %s's fills not single!`, clone.name, element.name, visiblePaints);
          } else {
            const [paint] = visiblePaints;
            if (paint.type !== 'SOLID') {
              console.warn(`%s's child %s's fill not a solid paint!`, clone.name, element.name, paint.type, paint);
              element.remove();
              continue;
            }
            fill = stringifySolidPaint(paint, 1);
            if (paint.boundVariables?.color) {
              const localVariable = allLocalVariables[paint.boundVariables.color.id];
              exportedVars[localVariable.name] = fill;
              fill = {
                var: localVariable.name,
              };
            }
          }
        }

        const { x, y } = element;
        element.x = 0;
        element.y = 0;
        element.vectorPaths = element.vectorPaths.filter((it) => {
          if (it.windingRule === 'NONE') {
            console.warn('NONE icon[ %s ] element[ %s ] %s', clone.name, element.name, 'Ignore open path:', it.data);
            return false;
          }
          return true;
        }).map((it) => {
          let commands = [...parsePathData(it.data)];
          if (it.windingRule === 'EVENODD') {
            console.warn('EVENODD icon[ %s ] element[ %s ] %s', clone.name, element.name, 'Convert fill rule:', it.data);
            commands = normalizeWindingRule(commands);
          }
          commands = translatePath(commands, x, y);
          const d = stringifyPath(commands);
          pathDatas.push({ d, opacity, fill });
          return {
            windingRule: 'NONZERO',
            data: d,
          };
        });
      }

      clone.fills = [];

      formattingContextNode.appendChild(clone);

      exportedIcons[icon.name] = {
        width: icon.width,
        height: icon.height,
        paths: pathDatas,
      };
    } catch (error) {
      clone.remove();
      throw error;
    } finally {
      console.log('[processing icon] %s %dms', icon.name, Date.now() - startTime);
    }
  }

  // 3. Convert Even-odd rules to Non-zero rules, simplify <path> elements's attributes.

  // 4. Create component.

  // 5. Send exported metadata to http server.

  // 6. Clean up.

  sendMessageToUI({ type: 'export-result', data: { state: 'fulfilled', message: 'ojbk!' } });
}
