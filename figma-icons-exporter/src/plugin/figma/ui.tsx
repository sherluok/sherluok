import { cx } from '^/base/web/css';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Button } from './components/button';
import { Checkbox, Radio } from './components/checkbox';
import { Select } from './components/select';
import { TextArea, TextInput } from './components/text-input';
import { PluginMessageToUI, sendMessageToBackground } from './message';
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
  const [pending, setPending] = useState(false);
  const [logMessages, setLogMessages] = useState('');

  const iconsSourceNodeName = useInputProps('');
  const createFigmaComponent = useCheckboxProps(true);
  const iconsCreateComponentNodeName = useInputProps('');
  const sendToHttpServer = useCheckboxProps(false);
  const httpEnpointAddress = useInputProps('http://localhost:3974/api/figma-icons-exporter');
  const saveAsJson = useCheckboxProps(false);
  const includeTypescripDeclarationForJson = useCheckboxProps(false);
  const saveAsTypeScript = useCheckboxProps(false);
  const saveAsReactComponent = useCheckboxProps(false);

  const handleSubmit = async () => {
    setPending(true);
    setLogMessages('');
    sendMessageToBackground({
      type: 'export',
      data: {
        createComponent: createFigmaComponent.checked && iconsCreateComponentNodeName.value ? {
          nodeName: iconsCreateComponentNodeName.value,
        } : undefined,
        sendToServer: sendToHttpServer.checked && httpEnpointAddress.value ? {
          httpEndpointAddress: httpEnpointAddress.value,
        } : undefined,
        saveJson: saveAsJson.checked ? {
          typesciptDelcaration: includeTypescripDeclarationForJson.checked,
        } : undefined,
      },
    });
  };

  useEffect(() => {
    const ab = new AbortController();
    window.addEventListener('message', (event) => {
      const parseResult = PluginMessageToUI.safeParse(event.data.pluginMessage);
      if (parseResult.error) {
        console.error(parseResult.error);
        return;
      }
      const { type, data } = parseResult.data;
      if (data.state === 'pending') {
        setLogMessages((value) => value + data.message + '\n');
      } else if (data.state === 'fulfilled') {
        setPending(false);
        setLogMessages((value) => value + data.message + '\n');
      } else if (data.state === 'rejected') {
        setPending(false);
        setLogMessages((value) => value + data.message + '\n');
      }
    }, {
      signal: ab.signal,
    });
    return () => {
      ab.abort();
    };
  }, []);

  const presets = [
    {
      mutable: false,
      label: 'Temporary',
    },
    {
      mutable: true,
      label: 'Peatip Studio',
    },
    {
      mutable: true,
      label: '福立盟',
    },
  ];

  return (
    <div>
      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>Presets</span>
        </div>
        <div style={{ display: 'flex' }}>
          <Select placeholder="Choose Preset" options={presets} getValue={(it) => it.label} value={'Temporary'}>
            {(option) => option.label}
          </Select>
        </div>
        <div style={{ display: 'none', flexWrap: 'wrap', columnGap: 16, rowGap: 12, }}>
          <Radio checked>Temporary</Radio>
          <Radio>Peatip Studio</Radio>
          <Radio>福立盟</Radio>
          <Radio>福立盟</Radio>
          <Radio>福立盟</Radio>
          <Radio>福立盟</Radio>
          <Radio>福立盟</Radio>
        </div>
      </div>

      <div className={s.group.container}>
        <div className={s.group.header}>
          <span className={s.group.title}>Source Node</span>
        </div>
        <div className={s.nodeNamePickerCombo}>
          <TextInput {...iconsSourceNodeName} placeholder="The icons source frame node name" />
          <Button>
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
          <span className={s.group.title}>Export Type</span>
        </div>
        <div className={s.targets.grid}>
          <Checkbox className={s.targets.checkbox} {...createFigmaComponent}>Create figma component</Checkbox>
          <div className={s.targets.desciption}>
            Create a Figma component to use in design.
          </div>
          {createFigmaComponent.checked && (
            <div className={cx(s.targets.content, s.nodeNamePickerCombo)}>
              <TextInput {...iconsCreateComponentNodeName} disabled={!createFigmaComponent.checked} placeholder="The icons output frame node name" />
              <Button disabled={!createFigmaComponent.checked}>
                <div className={s.icon.container}>
                  <svg className={s.icon.svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                    <path fill="currentcolor" d="M302.2 329.1H196.1l55.8 136c3.9 9.4-.6 20-9.4 24l-49.2 21.4c-9.2 4-19.4-.6-23.3-9.7l-53.1-129.1-86.7 89.1C18.7 472.7 0 463.6 0 448V18.3C0 1.9 19.9-6.1 30.3 5.4l284.4 292.5c11.5 11.2 3 31.1-12.5 31.1z" />
                  </svg>
                </div>
                <span>Pick</span>
              </Button>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...sendToHttpServer}>Send to http server</Checkbox>
          <div className={s.targets.desciption}>
            Create a Figma component to use in design.
          </div>
          {sendToHttpServer.checked && (
            <div className={s.targets.content}>
              <TextArea disabled={!sendToHttpServer.checked} {...httpEnpointAddress} style={{ width: '100%' }} rows={4} placeholder="The http endpoint address" />
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsJson}>Save as json</Checkbox>
          <div className={s.targets.desciption}>
            Save as a .json and .d.json.ts file.
          </div>
          {saveAsJson.checked && (
            <div className={s.targets.content}>
              <Checkbox>Include typescript declaration for json</Checkbox>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsTypeScript}>Save as typescript</Checkbox>
          <div className={s.targets.desciption}>
            Save as a .ts file, which exports all icons as IconDefination object.
          </div>
          {saveAsTypeScript.checked && (
            <div className={s.targets.content}>
              <Checkbox>As IconDefination</Checkbox>
            </div>
          )}

          <Checkbox className={s.targets.checkbox} {...saveAsReactComponent}>Save as react components</Checkbox>
          <div className={s.targets.desciption}>
            Save as a .tsx file, which exports all icons as React component function.
          </div>
          {saveAsReactComponent.checked && (
            <div className={s.targets.content}>
              <Radio>As ReactElement object</Radio>
              <Radio>As ReactComponent function</Radio>
            </div>
          )}
        </div>

      </div>

      <div className={s.group.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16 }}>
          <Button size="large">Save to Presets</Button>
          <Button size="large" color="primary" disabled={pending} onClick={handleSubmit}>Export</Button>
        </div>
        <TextArea readOnly rows={8} placeholder="Export log messages" value={logMessages} />
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
