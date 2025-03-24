import { findFrameNode, outlineStroke, parsePathData, stringifySolidPaint, unionByFillStyle } from '^/base/figma';
import { normalizeWindingRule, stringifyPath, translatePath } from '^/base/path-data';
import { openTunnel } from '^/base/rpc';
import { Observable, Observer } from 'rxjs';
import { ExportLog, ExportOptions, Language, MainProcessService, Presets } from './protocol';

console.clear();

// https://www.figma.com/plugin-docs/api/properties/figma-showui/

figma.showUI(__html__, {
  width: 400,
  height: 720,
  themeColors: true,
});

// Create RPC tunnel, listen messages from ui.

const tunnel = openTunnel({
  encode: (message) => message,
  decode: (encoded) => encoded,
  listen() {
    return new Observable((observer) => {
      figma.ui.on('message', (pluginMessage) => {
        observer.next(pluginMessage);
      });
    });
  },
  send(encoded) {
    figma.ui.postMessage(encoded);
  },
});

// Provide methods to resolve RPC call from ui.

tunnel.serve<MainProcessService>({
  async test() {
    return 1234;
  },
  async getLanguage() {
    const storageValue = await figma.clientStorage.getAsync('language');
    const parseResult = Language.safeParse(storageValue);
    return parseResult.success ? parseResult.data : 'en-US';
  },
  async setLanguage(value) {
    await figma.clientStorage.setAsync('language', value);
  },
  async getPresets() {
    const storageValue = await figma.clientStorage.getAsync('presets');
    const parseResult = Presets.safeParse(storageValue);
    return parseResult.success ? parseResult.data : {
      selection: 0,
      options: [{
        id: 0,
        name: 'Temporary',
        sourceNode: undefined,
        exportOptions: undefined,
      }],
    };
  },
  async createPreset(data) {
    const presets = await this.getPresets();
    presets.options.push(data);
    await figma.clientStorage.setAsync('presets', presets);
    return presets;
  },
  async switchPreset(id) {
    const presets = await this.getPresets();
    presets.selection = id;
    await figma.clientStorage.setAsync('presets', presets);
    return presets;
  },
  async updatePreset(data) {
    const presets = await this.getPresets();
    const index = presets.options.findIndex((it) => it.id === data.id);
    if (index !== -1) {
      presets.options.splice(index, 1, data);
    }
    await figma.clientStorage.setAsync('presets', presets);
    return presets;
  },
  async deletePreset(id) {
    const presets = await this.getPresets();
    const index = presets.options.findIndex((it) => it.id === id);
    if (index !== -1) {
      presets.options.splice(index, 1);
    }
    await figma.clientStorage.setAsync('presets', presets);
    return presets;
  },
  selectSourceNode() {
    return new Promise((resolve, reject) => {
      figma.ui.hide();
      figma.on('selectionchange', () => {
        if (figma.currentPage.selection.length === 1) {
          const node = figma.currentPage.selection[0];
          if (node.type === 'FRAME') {
            figma.ui.show();
            resolve({
              id: node.id,
              name: node.name,
            });
            return;
          }
          figma.ui.show();
          reject('The node you select is not a Frame node!');
          return;
        }
        figma.ui.show();
        reject('The node you select is not a single node!');
      });
      return;
    });
  },
  export(options) {
    return new Observable((observer) => {
      runExport(options, observer).catch((error) => {
        observer.error(error);
      });
    });
  },
});

async function runExport(options: ExportOptions, observer: Observer<ExportLog>): Promise<void> {
  console.log(options);
  // 1. Find source node by name or id.

  const sourceNodeName = 'Icon';
  const sourceNode = findFrameNode(sourceNodeName);

  if (!sourceNode) {
    observer.next({ level: 'error', message: `Cannot find Frame type node by name "${sourceNodeName}"!` });
    observer.error('?');
    return;
  }

  if (!sourceNode.children.length) {
    observer.next({ level: 'error', message: `Source node "${sourceNodeName}" has no child!` });
    observer.error('?');
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
    fill: {
      hex: string;
    } | {
      var: string;
    };
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
      observer.next({ level: 'info', message: `Warning: Node ${icon.name} is not a FrameNode but a ${icon.type}!` });
      continue;
    }

    if (icon.children.length === 0) {
      observer.next({ level: 'info', message: `Warning: FrameNode ${icon.name} has no child!` });
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
          observer.next({ level: 'info', message: `Warning: ${clone.name}'s child ${element.name} is not a VectorNode but a ${element.type}!` });
          element.remove();
          continue;
        }

        // https://www.figma.com/plugin-docs/api/Constraints/
        element.constraints = {
          horizontal: 'SCALE',
          vertical: 'SCALE',
        };

        const opacity = clone.opacity * element.opacity;

        let fill: { hex: string } | { var: string };
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

            fill = {
              hex: stringifySolidPaint(paint, 1),
            };

            if (paint.boundVariables?.color) {
              const localVariable = allLocalVariables[paint.boundVariables.color.id];
              exportedVars[localVariable.name] = fill.hex;
              fill = {
                var: localVariable.name,
              };
            }
          }
        }

        const { x, y } = element;
        element.x = 0;
        element.y = 0;

        // 3. Convert Even-odd rules to Non-zero rules, simplify <path> elements's attributes.

        element.vectorPaths = element.vectorPaths.filter((path) => path.windingRule !== 'NONE').map((path) => {
          let commands = [...parsePathData(path.data)];
          if (path.windingRule === 'EVENODD') {
            console.warn('EVENODD icon[ %s ] element[ %s ] %s', clone.name, element.name, 'Convert fill rule:', path.data);
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

  // 4. Create component.

  // 5. Send exported metadata to http server.
  if (options.sendToHttpServer && options.httpServerEndpoint) {
    console.log('Sending exported data to', options.httpServerEndpoint);
    try {
      // Figma plugin runtime dont have global URL object.
      const [path, search = '', hash] = options.httpServerEndpoint.split(/[\?\#]/);
      const searchParams = search.split('&');

      if (options.generateJsonFile) {
        searchParams.push('generateJsonFile');
      }
      if (options.generateJsonDeclarationFile) {
        searchParams.push('generateJsonDeclarationFile');
      }
      if (options.generateIconDefinationsFile) {
        searchParams.push('generateIconDefinationsFile');
      }
      if (options.generateReactElementsFile) {
        searchParams.push('generateReactElementsFile');
      }
      if (options.generateReactComponentsFile) {
        searchParams.push('generateReactComponentsFile');
      }

      const endpoint = [[path, searchParams.filter(Boolean).join('&')].filter(Boolean).join('?'), hash].filter(Boolean).join('#');

      observer.next({ level: 'info', message: `Sending exported data to ${endpoint} ...` });
      console.log('Sending exported data to', endpoint);

      await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          vars: exportedVars,
          icons: Object.fromEntries(Object.entries(exportedIcons).map(([name, icon]) => [name, [icon.width, icon.height, icon.paths.map((path) => [path.d, path.opacity, path.fill])]])),
        }),
      });
      observer.next({ level: 'info', message: `Sending ok.` });
      console.log(`Sending ok.`);
    } catch (error) {
      observer.next({ level: 'info', message: `Sending failed!` });
      console.error(error);
    }
  }

  // 6. Clean up.

  observer.next({ level: 'info', message: 'ojbk!' });
  observer.complete();
}
