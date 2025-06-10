import { GlobalMain } from '^/web/pages/global-layout';

export function Component() {
  return (
    <GlobalMain>
      <strong>OKLCH Color Picker & Converter</strong>
      <div>Powered by <a href="https://culorijs.org/">culori</a>.</div>

      <label>
        <div style={{ marginTop: 16 }}>Please input a valid CSS <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"><code>&lt;color&gt;</code></a>:</div>
        <input type="text" placeholder="<hex-color> or <color-function>"></input>
      </label>

      <div style={{ marginTop: 16 }}>Equals to:</div>
      <ul>
        <li>
          <div>
            <span>HEX: </span>
          </div>
          <input type="text" />
        </li>
        <li>
          <div>
            <span>RGB: </span>
          </div>
          <input type="text" />
        </li>
        <li>
          <div>
            <span>HSL: </span>
          </div>
          <input type="text" />
        </li>
        <li>
          <div>
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch">
              <code>oklch</code>
            </a>
            <code>(L: </code>
            <select value="<percentage>">
              <option value="<number>">&lt;number&gt;</option>
              <option value="<percentage>">&lt;percentage&gt;</option>
            </select>
            <code> C: </code>
            <select value="<percentage>">
              <option value="<number>">&lt;number&gt;</option>
              <option value="<percentage>">&lt;percentage&gt;</option>
            </select>
            <code> H: </code>
            <select value="<angle>">
              <option value="<number>">&lt;number&gt;</option>
              <option value="<angle>">&lt;angle&gt;</option>
            </select>
            <code> / A: </code>
            <select value="<percentage>">
              <option value="<number>">&lt;number&gt;</option>
              <option value="<percentage>">&lt;percentage&gt;</option>
            </select>
            <code>)</code>
          </div>
          <input type="text" />
        </li>
      </ul>
    </GlobalMain>
  );
}
