import { FormEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '../exports/react';
import { ExportedData, Icons, Vars } from '../exports/zod';
import './ui.css';

function MainPage() {
  const [vars, setVars] = useState<Vars>();
  const [icons, setIcons] = useState<Icons>();

  const listRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (e: FormEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const { name, value } = e.target;
      window.localStorage.setItem(name, value);
      setVars((prev) => Object.assign({}, prev, { [name]: value }));
    }
  };

  useEffect(() => {
    const { signal, abort } = new AbortController();
    const eventSource = new EventSource('/api/exported-data');
    eventSource.addEventListener('message', (e) => {
      const data = ExportedData.parse(JSON.parse(e.data));
      const vars = Object.fromEntries(Object.entries(data.vars).map(([name, fallback]) => {
        const value = window.localStorage.getItem(name) ?? fallback;
        return [name, value];
      }));
      setVars(vars);
      setIcons(data.icons);
    }, { signal });
    return () => {
      abort();
    };
  }, []);

  useEffect(() => {
    vars && Object.entries(vars).forEach(([name, value]) => {
      listRef.current?.style.setProperty(`--${name}`, value);
    });
  }, [vars]);

  return (
    <div>
      <fieldset>
        <legend>Edit Color Variables</legend>
        <div id='vars'>
          {vars && Object.entries(vars).map(([name, value]) => (
            <label key={name}>
              <input type='color' name={name} value={value} onChange={handleColorChange} />
              <span>{name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div id='icons' ref={listRef}>
        {icons && Object.keys(icons).map((name) => (
          <div key={name}>
            <strong>{name}</strong>
            <Icon map={icons} name={name} />
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<MainPage />);
