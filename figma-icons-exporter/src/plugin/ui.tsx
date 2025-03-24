import { openTunnel } from '^/base/rpc';
import { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLoaderData } from 'react-router';
import { Observable } from 'rxjs';
import { createLabelsGetter } from './i18n';
import { ExportOptions, Language, MainProcessService, RenderProcessService } from './protocol';
import { Button, Checkbox, SegmentedControl, SegmentedItem, Select, TextArea, TextInput } from './styled';
import * as s from './ui.css';

const tunnel = openTunnel({
  encode: (message) => message,
  decode: (encoded) => encoded,
  listen() {
    return new Observable((observer) => {
      window.addEventListener('message', (event) => {
        observer.next(event.data.pluginMessage);
      });
    });
  },
  send(encoded) {
    window.parent.postMessage({ pluginMessage: encoded }, '*');
  },
});

tunnel.serve<RenderProcessService>({
  async test() {
    return 5678;
  },
});

const client = tunnel.proxy<MainProcessService>();

function useInputProps<T>(initialValue: T, hookChange?: (value: T) => void) {
  const [value, setValue] = useState<T>(initialValue);
  const onChange = useCallback((value: T) => {
    hookChange?.(value);
    setValue(value);
  }, []);
  return { value, onChange };
}

function useCheckboxProps(initialValue: boolean, hookChange?: (value: boolean) => void) {
  const [checked, setChecked] = useState(initialValue);
  const onChange = useCallback((value: boolean) => {
    hookChange?.(value);
    setChecked(value);
  }, []);
  return { checked, onChange };
}

async function getConfiguration() {
  const language = await client.getLanguage();
  const presets = await client.getPresets();
  const config = {
    language,
    presets,
  };
  console.log('getConfiguration():', config);
  return config;
}

// Creating a User Interface
// https://www.figma.com/plugin-docs/creating-ui/
export function MainPage() {
  const config = useLoaderData<typeof getConfiguration>();


  const language = useInputProps<Language>(config.language, (value) => {
    client.setLanguage(value).catch(console.error);
  });

  const i18n = useMemo(() => createLabelsGetter(language.value), [language.value]);

  const currentPreset = config.presets.options.find((it) => it.id === config.presets.selection);
  if (!currentPreset) {
    throw config.presets;
  }

  const [isExporting, setExporting] = useState(false);
  const [logMessages, setLogMessages] = useState('');

  const iconsSourceNodeName = useInputProps(currentPreset.sourceNode?.name ?? '');
  const createFigmaComponent = useCheckboxProps(!!currentPreset.exportOptions?.createFigmaComponent);
  const figmaComponentNodeId = useInputProps(currentPreset.exportOptions?.figmaComponentNodeId ?? '');
  const figmaComponentNodeName = useInputProps(currentPreset.exportOptions?.figmaComponentNodeName ?? '');
  const sendToHttpServer = useCheckboxProps(!!currentPreset.exportOptions?.sendToHttpServer);
  const httpServerEnpoint = useInputProps(currentPreset.exportOptions?.httpServerEndpoint ?? 'http://localhost:3974/api/figma-icons-exporter');
  const generateJsonFile = useCheckboxProps(!!currentPreset.exportOptions?.generateJsonFile);
  const generateJsonDeclarationFile = useCheckboxProps(!!currentPreset.exportOptions?.generateJsonDeclarationFile);
  const generateIconDefinationsFile = useCheckboxProps(false);
  const generateReactElementsFile = useCheckboxProps(false);
  const generateReactComponentsFile = useCheckboxProps(false);

  const [isPickingSourceNode, setPickingSourceNode] = useState(false);
  const onPickSourceNode = () => {
    setPickingSourceNode(true);
    client.selectSourceNode().then((node) => {
      console.log({ node });
      iconsSourceNodeName.onChange(node.name);
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      setPickingSourceNode(false);
    });
  };

  const [isPickingOutputNode, setPickingOutputNode] = useState(false);
  const onPickOutputNode = () => {
  };

  const handleSubmit = async () => {
    setExporting(true);
    setLogMessages('');
    const exportOptions: ExportOptions = {
      createFigmaComponent: createFigmaComponent.checked,
      figmaComponentNodeId: figmaComponentNodeId.value,
      figmaComponentNodeName: figmaComponentNodeName.value,
      sendToHttpServer: sendToHttpServer.checked,
      httpServerEndpoint: httpServerEnpoint.value,
      generateJsonFile: generateJsonFile.checked,
      generateJsonDeclarationFile: generateJsonDeclarationFile.checked,
      generateIconDefinationsFile: generateIconDefinationsFile.checked,
      generateReactElementsFile: generateReactElementsFile.checked,
      generateReactComponentsFile: generateReactComponentsFile.checked,
    };
    const currentPreset = config.presets.options.find((it) => it.id === config.presets.selection);
    if (currentPreset) {
      client.updatePreset({
        ...currentPreset,
        exportOptions,
      }).catch(console.error);
    }
    client.export(exportOptions).subscribe({
      next(log) {
        setLogMessages((value) => value + log.message + '\n');
      },
      complete() {
        setExporting(false);
      },
      error() {
        setExporting(false);
      },
    });
  };

  // const presets = [
  //   {
  //     id: 0,
  //     mutable: false,
  //     label: i18n.presetTemporary,
  //   },
  //   {
  //     id: 1,
  //     mutable: true,
  //     label: 'Peatip Studio',
  //   },
  //   {
  //     id: 2,
  //     mutable: true,
  //     label: '福立盟',
  //   },
  // ];
  const selectedPresetId = useInputProps<number>(config.presets.selection);

  return (
    <div>
      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>{i18n.presetInGroupTitle}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <Select placeholder="Choose Preset" options={config.presets.options} getValue={(it) => it.id} {...selectedPresetId}>
            {(option) => option.name}
          </Select>
          <SegmentedControl {...language}>
            <SegmentedItem value="zh-CN">中文</SegmentedItem>
            <SegmentedItem value="en-US">English</SegmentedItem>
          </SegmentedControl>
        </div>
      </div>

      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>{i18n.sourceNodeInGroupTitle}</span>
        </div>
        <div className={s.nodeNamePickerCombo}>
          <TextInput {...iconsSourceNodeName} placeholder="Frame node name" />
          <Button onClick={onPickSourceNode} disabled={isPickingSourceNode} pending={isPickingSourceNode}>
            <div className={s.icon.container}>
              <svg className={s.icon.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path fill="currentcolor" d="M302.2 329.1H196.1l55.8 136c3.9 9.4-.6 20-9.4 24l-49.2 21.4c-9.2 4-19.4-.6-23.3-9.7l-53.1-129.1-86.7 89.1C18.7 472.7 0 463.6 0 448V18.3C0 1.9 19.9-6.1 30.3 5.4l284.4 292.5c11.5 11.2 3 31.1-12.5 31.1z" />
              </svg>
            </div>
            <span>Pick</span>
          </Button>
        </div>
      </div>

      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>{i18n.exportTypeInGroupTitle}</span>
        </div>
        <div className={s.targets.grid}>
          <Checkbox className={s.targets.checkbox} {...createFigmaComponent}>{i18n.createFigmaComponent}</Checkbox>
          <div className={s.targets.desciption}>{i18n.createFigmaComponentDesc}</div>
          {createFigmaComponent.checked && (
            <div className={s.targets.content}>
              <div className={s.nodeNamePickerCombo}>
                <TextInput {...figmaComponentNodeName} disabled={!createFigmaComponent.checked} placeholder="Frame node name" />
                <Button disabled={!createFigmaComponent.checked || isPickingOutputNode} onClick={onPickOutputNode} pending={isPickingOutputNode}>
                  <div className={s.icon.container}>
                    <svg className={s.icon.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                      <path fill="currentcolor" d="M302.2 329.1H196.1l55.8 136c3.9 9.4-.6 20-9.4 24l-49.2 21.4c-9.2 4-19.4-.6-23.3-9.7l-53.1-129.1-86.7 89.1C18.7 472.7 0 463.6 0 448V18.3C0 1.9 19.9-6.1 30.3 5.4l284.4 292.5c11.5 11.2 3 31.1-12.5 31.1z" />
                    </svg>
                  </div>
                  <span>{i18n.useCurrentSelectionButton}</span>
                </Button>
              </div>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...sendToHttpServer}>{i18n.sendToHttpServer}</Checkbox>
          <div className={s.targets.desciption}>{i18n.sendToHttpServerDesc}</div>
          {sendToHttpServer.checked && (
            <div className={s.targets.content}>
              <TextArea disabled={!sendToHttpServer.checked} {...httpServerEnpoint} style={{ width: '100%' }} rows={4} placeholder="The http endpoint address" />
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...generateJsonFile}>{i18n.genJson}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genJsonDesc}</div>
          {generateJsonFile.checked && (
            <div className={s.targets.content}>
              <Checkbox {...generateJsonDeclarationFile}>{i18n.genJsonDeclaration}</Checkbox>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...generateIconDefinationsFile}>{i18n.genTypescript}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genTypescriptDesc}</div>

          <Checkbox className={s.targets.checkbox} {...generateReactElementsFile}>{i18n.genReactElement}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genReactElementDesc}</div>

          <Checkbox className={s.targets.checkbox} {...generateReactComponentsFile}>{i18n.genReactComponent}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genReactComponentDesc}</div>
        </div>

      </div>

      <div className={s.group.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16 }}>
          <Button size="large">{i18n.saveToPresetsButton}</Button>
          <Button size="large" color="primary" disabled={isExporting} onClick={handleSubmit} pending={isExporting}>{i18n.exportButton}</Button>
        </div>
        <TextArea readOnly rows={8} placeholder={i18n.exportLoggerPlaceholder} value={logMessages} />
      </div>
    </div>
  );
}

const router = createMemoryRouter([
  {
    path: '/',
    loader: getConfiguration,
    element: <MainPage />,
  },
]);

const containerEle = document.getElementById('root')!;
createRoot(containerEle).render(<RouterProvider router={router} />);
