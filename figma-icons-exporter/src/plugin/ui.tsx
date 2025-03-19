import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Language, useLabels } from './locale';
import { requestSelectSourceNode, sendMessageToMain, watchMessageToUI } from './message';
import { Button, Checkbox, Radio, SegmentedControl, SegmentedItem, Select, TextArea, TextInput } from './styled';
import * as s from './ui.css';

function useInputProps<T>(initialValue: T) {
  const [value, onChange] = useState<T>(initialValue);
  return { value, onChange };
}

function useCheckboxProps(initialValue: boolean) {
  const [checked, onChange] = useState(initialValue);
  return { checked, onChange };
}

// Creating a User Interface
// https://www.figma.com/plugin-docs/creating-ui/
function MainPage() {
  const i18n = useLabels();

  const [isExporting, setExporting] = useState(false);
  const [logMessages, setLogMessages] = useState('');

  const iconsSourceNodeName = useInputProps('');
  const createFigmaComponent = useCheckboxProps(true);
  const iconsCreateComponentNodeName = useInputProps('');
  const sendToServer = useCheckboxProps(false);
  const httpEnpoint = useInputProps('http://localhost:3974/api/figma-icons-exporter');
  const saveAsJson = useCheckboxProps(false);
  const jsonTypescripDeclaration = useCheckboxProps(false);
  const saveAsTypeScript = useCheckboxProps(false);
  const saveAsReactComponent = useCheckboxProps(false);

  const [isPickingSourceNode, setPickingSourceNode] = useState(false);
  const onPickSourceNode = () => {
    setPickingSourceNode(true);
    requestSelectSourceNode().then((data) => {
      console.log(data);
      iconsSourceNodeName.onChange(data.nodeName);
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
    sendMessageToMain({
      type: 'export',
      data: {
        createComponent: createFigmaComponent.checked && iconsCreateComponentNodeName.value ? {
          nodeName: iconsCreateComponentNodeName.value,
        } : undefined,
        sendToServer: sendToServer.checked && httpEnpoint.value ? {
          httpEndpoint: httpEnpoint.value,
        } : undefined,
        saveJson: saveAsJson.checked ? {
          typesciptDelcaration: jsonTypescripDeclaration.checked,
        } : undefined,
      },
    });
  };

  useEffect(() => {
    const subscription = watchMessageToUI().subscribe((message) => {
      if (message.type === 'export-result') {
        if (message.data.state === 'pending') {
          setLogMessages((value) => value + message.data.message + '\n');
        } else if (message.data.state === 'fulfilled') {
          setExporting(false);
          setLogMessages((value) => value + message.data.message + '\n');
        } else if (message.data.state === 'rejected') {
          setExporting(false);
          setLogMessages((value) => value + message.data.message + '\n');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const presets = [
    {
      id: 0,
      mutable: false,
      label: i18n.presetTemporary,
    },
    {
      id: 1,
      mutable: true,
      label: 'Peatip Studio',
    },
    {
      id: 2,
      mutable: true,
      label: '福立盟',
    },
  ];

  const language = useInputProps<Language>(Language.enUS);

  return (
    <div>
      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>{i18n.presetInGroupTitle}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <Select placeholder="Choose Preset" options={presets} getValue={(it) => it.id} value={0}>
            {(option) => option.label}
          </Select>
          <SegmentedControl {...language}>
            <SegmentedItem value={Language.zhCN}>中文</SegmentedItem>
            <SegmentedItem value={Language.enUS}>English</SegmentedItem>
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
                <TextInput {...iconsCreateComponentNodeName} disabled={!createFigmaComponent.checked} placeholder="Frame node name" />
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

          <Checkbox className={s.targets.checkbox} {...sendToServer}>{i18n.sendToHttpServer}</Checkbox>
          <div className={s.targets.desciption}>{i18n.sendToHttpServerDesc}</div>
          {sendToServer.checked && (
            <div className={s.targets.content}>
              <TextArea disabled={!sendToServer.checked} {...httpEnpoint} style={{ width: '100%' }} rows={4} placeholder="The http endpoint address" />
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsJson}>{i18n.genJson}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genJsonDesc}</div>
          {saveAsJson.checked && (
            <div className={s.targets.content}>
              <Checkbox {...jsonTypescripDeclaration}>Include typescript declaration for json</Checkbox>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsTypeScript}>{i18n.genTypescript}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genTypescriptDesc}</div>
          {saveAsTypeScript.checked && (
            <div className={s.targets.content}>
              <Checkbox>As IconDefination</Checkbox>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsReactComponent}>{i18n.genReact}</Checkbox>
          <div className={s.targets.desciption}>{i18n.genReactDesc}</div>
          {saveAsReactComponent.checked && (
            <div className={s.targets.content}>
              <Radio>As ReactComponent function</Radio>
              <Radio>As ReactElement object</Radio>
            </div>
          )}
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
    element: <MainPage />,
  },
]);

const containerEle = document.getElementById('root')!;
createRoot(containerEle).render(<RouterProvider router={router} />);
