import { faCopy, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GlobalMain } from '^/web/pages/layout';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import * as s from './page.css';

export function Component() {
  const [hostname, setHostname] = useState('localhost');
  const [port, setPort] = useState('1080');
  const [password, setPassword] = useState('abc123');
  const [method, setMethod] = useState('chacha20-ietf-poly1305');

  const uri = useMemo(() => {
    return toSIP002URIScheme(hostname, port, password, method);
  }, [hostname, port, password, method]);

  return (
    <GlobalMain>
      <strong>Shadowsocks QR Code Generator</strong>

      <div className={s.form}>
        <label className={s.field}>
          <div className={s.label}>hostname:</div>
          <input className={s.input} type="text" placeholder="ip or domain" value={hostname} onChange={(e) => setHostname(e.target.value)} />
        </label>
        <label className={s.field}>
          <div className={s.label}>port:</div>
          <input className={s.input} type="text" placeholder="0-60000" value={port} onChange={(e) => setPort(e.target.value)} />
        </label>
        <label className={s.field}>
          <div className={s.label}>password:</div>
          <div>
            <input className={s.input} type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button><FontAwesomeIcon icon={faEye} /></button>
          </div>
        </label>
        <label className={s.field}>
          <div className={s.label}>method:</div>
          <input className={s.input} type="text" placeholder="eg. chacha20-ietf-poly1305" value={method} onChange={(e) => setMethod(e.target.value)} />
        </label>
      </div>

      <fieldset className={s.fieldset}>
        <legend><a href="https://shadowsocks.org/doc/sip002.html">SIP002 URI scheme</a> and QR Code:</legend>
        <div className={s.uri}>
          <code>{uri}</code>
          <div className={s.copyBtn}>
            <FontAwesomeIcon icon={faCopy} />
          </div>
        </div>
        <QRCodeSVG value={uri} size={128} />
      </fieldset>
    </GlobalMain>
  );
}

function toSIP002URIScheme(
  hostname: string,
  port: number | string,
  password: string,
  method: string,
) {
  const userinfo = btoa(`${method}:${password}`);
  return `ss://${userinfo}@${hostname}:${port}`;
}
