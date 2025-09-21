# Chrome 浏览器相关工具

包括 Chrome 进程的启动和 Chrome Devtools Protocol 的封装。

```ts
import {
  findChromium,
  formatChromiumFlags,
  launchChromium,
  getWebSocketDebuggerUrlFromStderr,
  getWebSocketDebuggerUrlFromJsonVersion,
} from '@peatip/chrome/process';

import {
  ProtocolSessionManager,
} from '@peatip/chrome/protocol';
```

## 更新 Protocol 相关 TypeScript 类型声明

该命令将从仓库 https://github.com/chromedevtools/devtools-protocol 下载两个文件，然后在 `src` 目录中生成两个 `.d.ts` 文件。

```sh
pnpm run generate-protocol-dts
```
