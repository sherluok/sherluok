- https://github.com/connor4312/esbuild-problem-matchers
- esbuild 默认错误输出格式参考文档 https://esbuild.github.io/api/#logging 和源码

## The `chrome` task type

Provide new task type `"chrome"` to launch chrome browser at desired `--remote-debugging-port`. Create a `.vscode/tasks.json` file:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "chrome",
      "label": "launch",
      "startingPage": "http://localhost:8080",
      "remoteDebuggingPort": 9230,
      "isBackground": true,
    },
  ]
}
```

This task will launch chrome if there is no chrome process running at this remote debugging port, the task will continue running until the chrome process is closed. This type of task is used before chrome debugger launch, for example, the `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome",
      "type": "chrome",
      "request": "attach",
      "preLaunchTask": "launch",
      "urlFilter": "http://localhost:8080/*",
      "port": 9230,
    }
  ]
}
```

For more detail on this files, go to [example/.vscode](./example/.vscode) folder.

## The `$common` problem matcher

Usage:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "shell",
      "label": "Run webpack dev server",
      "command": "pnpm",
      "args": ["dev"],
      "isBackground": true,
      "problemMatcher": "$common",
    }
  ]
}
```

The `$common` problem matcher is a background task problem matcher with `beginsPattern` equals to `vscode background task begins` and `endsPattern` equals to `vscode background task ends`, it's used by my webpack [VscodeTaskPlugin]().

## Bundle Extension

```sh
pnpm run build
pnpm exec vsce package
```

## Install Extension from Bundled

```sh
code --install-extension ./problem-matcher-0.2.0.vsix
```

> or run vscode task: install

## Install Extension from Marketplace

```sh
code --install-extension sherluok.problem-matcher
```

## Publish Extension

```sh
pnpm exec vsce publish
```

> or run vscode task: publish

Open https://marketplace.visualstudio.com/manage
