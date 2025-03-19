- [Local workspace extensions](https://code.visualstudio.com/updates/v1_89#_local-workspace-extensions)
- https://code.visualstudio.com/docs/editor/tasks#_background-watching-tasks
- https://github.com/paulober/vscode-rollup-problem-matcher/blob/main/package.json
- https://github.com/cloudflare/workers-sdk/discussions/4174

### 创建软连接
```powershell
# https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/new-item?view=powershell-7.4#example-7-create-a-symbolic-link-to-a-file-or-folder
New-Item -Itemtype SymbolicLink -Target "C:\Users\host\src\peatip\integrations\vscode-problem-matcher" -Path "C:\Users\host\src\peatip\.vscode\extensions\vscode-problem-matcher-extension"
# https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/remove-item?view=powershell-7.4
Remove-Item -Path "C:\Users\sherluok\github.com\sherluok\peatip\.vscode\extensions\vscode-problem-matcher-extension"
```

Logos
- vscode: https://code.visualstudio.com/api/references/contribution-points#contributes.icons
- icomoon: https://www.eliostruyf.com/add-custom-themable-icon-visual-studio-code/
- webpak: https://webpack.js.org/branding/
- cloudflare: https://www.svgrepo.com/svg/349320/cloudflare

### 安装

执行下面的命令将在当前目录下创建 `.vscode/extensions/vscode-problem-matcher` 文件夹。

```sh
pnpm dlx vscode-problem-matcher install
```

或者

```sh
node --import tsx ../../integrations/vscode-problem-matcher/src/link.ts
```

## 开发

- VS Code Task Provider：
  - https://code.visualstudio.com/api/extension-guides/task-provider
  - https://github.com/microsoft/vscode-extension-samples/blob/main/task-provider-sample/README.md
  - https://code.visualstudio.com/docs/editor/tasks
