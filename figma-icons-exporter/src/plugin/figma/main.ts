import { ok } from '^/base/common/assert';
import { FigmaVectorPathData, findFrameNode, outlineStroke, stringifySolidPaint, unionByFillStyle } from '^/base/figma/plugin';
import { ExportData } from '^/exports/common';
import { PluginMessageFromUI, sendMessageToUI, sendPendingMessageToUI } from './message';

console.clear();
console.log('Banner of Icons Exporter.');

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 400,
  height: 720,
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message
figma.ui.on('message', async (pluginMessage: unknown): Promise<void> => {
  console.log('[figma.ui.onmessage]', pluginMessage);
  const parseResult = PluginMessageFromUI.safeParse(pluginMessage);
  if (parseResult.error) {
    console.error(parseResult.error);
    return;
  }
  const { type, data } = parseResult.data;
  if (type === 'export') {
    if (data.createComponent) {
      sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: 'Not supported!' } });
    }
    if (data.sendToServer) {
      sendMessageToUI({ type: 'export-result', data: { state: 'pending', message: 'sending to server...' } });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // await uploadToServer(data.sendToServer.httpEndpointAddress).then(() => {
      //   sendMessageToUI({ type: 'export-result', data: { state: 'fulfilled', message: 'Ok.' } });
      // }).catch((error) => {
      //   console.error('error:', error);
      //   if (typeof error === 'object' && error !== null && 'message' in error) {
      //     sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: error.message } });
      //   } else {
      //     sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: String(error) } });
      //   }
      // });
    }
    if (data.saveJson) {
      sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: 'Not supported!' } });
    }
    sendMessageToUI({ type: 'export-result', data: { state: 'fulfilled', message: 'ojbk!' } });
    return;
  }
  console.log(`Unkndown message type "${type}", close plugin.`);
  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
});

async function uploadToServer(endpoint: string): Promise<void> {
  sendPendingMessageToUI('Finding Icon...');
  const sourceName = 'Icon';
  const sourceNode = findFrameNode(sourceName);
  ok(sourceNode, `Cannot find FrameNode "Icon"!`);

  const formatTargetName = 'Icon Formatted';
  if (true) {
    findFrameNode(formatTargetName)?.remove();
  }
  const formatTargetNode = findFrameNode(formatTargetName) ?? (() => {
    ok(sourceNode.children[0]);
    const sampleItemSize = sourceNode.children[0].width;

    const node = figma.createFrame();
    node.name = formatTargetName;
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

  const allLocalVariables = await figma.variables.getLocalVariablesAsync().then((vs) => Object.fromEntries(vs.map((it) => [it.id, it])));

  sendPendingMessageToUI('Genering...');

  const entries: ExportData = { vars: {}, icons: {} };

  for (const it of sourceNode.children) {
    if (it.type !== 'FRAME') {
      sendPendingMessageToUI(`Warning: Node ${it.name} is not a FrameNode but a ${it.type}!`);
      continue;
    }

    if (it.children.length === 0) {
      sendPendingMessageToUI(`Warning: FrameNode ${it.name} has no child!`);
      continue;
    }

    const startTime = Date.now();
    const clone = it.clone();
    try {
      clone.resize(it.width, it.height);

      outlineStroke(clone);
      unionByFillStyle(clone);

      const pathDatas: ExportData.Path[] = [];

      for (const child of clone.children) {
        if (child.type !== 'VECTOR') {
          sendPendingMessageToUI(`Warning: ${clone.name}'s child ${child.name} is not a VectorNode but a ${child.type}!`);
          child.remove();
          continue;
        }

        // https://www.figma.com/plugin-docs/api/Constraints/
        child.constraints = {
          horizontal: 'SCALE',
          vertical: 'SCALE',
        };

        const opacity = clone.opacity * child.opacity;

        let fill: string | { var: string };
        const fills = child.fills;
        if (typeof fills === 'symbol') {
          console.warn(`%s's child %s's fills not paints!`, clone.name, child.name, fills);
        } else {
          const visiblePaints = fills.filter((fill) => fill.visible);
          if (visiblePaints.length !== 1) {
            console.warn(`%s's child %s's fills not single!`, clone.name, child.name, visiblePaints);
          } else {
            const [paint] = visiblePaints;
            if (paint.type !== 'SOLID') {
              console.warn(`%s's child %s's fill not a solid paint!`, clone.name, child.name, paint.type, paint);
              child.remove();
              continue;
            }
            fill = stringifySolidPaint(paint, 1);
            if (paint.boundVariables?.color) {
              const variable = allLocalVariables[paint.boundVariables.color.id];
              // if (variable.name === 'icon-default-color') {
              //   fill = undefined;
              // } else {
                entries.vars[variable.name] = fill;
                fill = {
                  var: variable.name,
                };
              // }
            }
          }
        }

        const { x, y } = child;
        child.x = 0;
        child.y = 0;
        child.vectorPaths = child.vectorPaths.filter((it) => {
          if (it.windingRule === 'NONE') {
            console.warn('Warning: ignore open path', clone.name, it.windingRule, it.data);
            return false;
          }
          return true;
        }).map((it) => {
          let commands = [...FigmaVectorPathData.parse(it.data)];
          if (it.windingRule === 'EVENODD') {
            console.warn('EVENODD', clone.name, child.name, child.vectorPaths, child.vectorNetwork, it.data);
            commands = FigmaVectorPathData.nonezero(commands);
            console.log(child.vectorNetwork);
          }
          commands = FigmaVectorPathData.translate(commands, x, y);
          const d = FigmaVectorPathData.stringify(commands);
          pathDatas.push([d, opacity, fill]);
          return {
            windingRule: 'NONZERO',
            data: d,
          };
        });
      }

      clone.fills = [];
      formatTargetNode.appendChild(clone);

      // const pathElements = pathProps.map(({ d, fill, opacity }) => `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" />`).join('');
      // console.log(`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${pathElements}</svg>`);

      entries.icons[it.name] = [it.width, it.height, pathDatas];
    } catch(error) {
      clone.remove();
      throw error;
    } finally {
      console.log('[processing icon] %s %dms', it.name, Date.now() - startTime);
    }
  }

  sendPendingMessageToUI(`Fetching "${endpoint}"...`);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(entries),
    });
    sendMessageToUI({ type: 'export-result', data: { state: 'fulfilled', message: `status code ${res.status} "${res.statusText}"` } });
  } catch (error) {
    console.error(error);
    sendMessageToUI({ type: 'export-result', data: { state: 'rejected', message: String(error) } });
  }
}
