## 添加到 Windows PowerShell

将 [`bin`](./bin) 目录的地址添加到 `PATH` 环境变量中，就可以在 PowerShell 中调用该目录下的命令。持久修改环境变量的方法有两类，一是通过 PowerShell 配置文件进行会话级修改，二是通过系统环境变量进行系统级修改，参考官方文档[《在 Windows 中创建持久性环境变量》](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_environment_variables?view=powershell-7.5#set-environment-variables-in-your-profile)。比较推荐修改配置文件的方法，因为它只在打开的 PowerShell 会话中生效。PowerShell 配置文件的地址通常是 `C:\Users\xxx\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`，当然针对不同用户权限有不同的地址，具体的请参考[《配置文件类型和位置》](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.5#profile-types-and-locations)，我们可以简单地通过 `$PROFILE` 自动变量获取当前会话的配置文件路径。

可以通过系统环境变量编辑器全局修改，或者在 [`$PROFILE`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7.5#profile-types-and-locations) 文件中临时修改。比较推荐后者，首先打开 `$PROFILE` 文件，该文件在每次打开 PowerShell 应用或新建 Session 时都会运行一次，我们利用这个特性，把 `bin` 目录的地址添加到 `PATH` 环境变量中。

首先打开 PowerShell 配置文件：

```powershell
notepad $PROFILE # $PROFILE 变量的值通常是 C:\Users\xxx\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

然后在最后一行添加下面修改 `PATH` 环境变量的代码：

```powershell
$env:PATH += ';C:\Users\xxx\...\sherluok\command-line-tools\bin'
```

上面两个步骤也可以通过一个命令完成：

```powershell
Add-Content $PROFILE -Value "`$env:PATH += ';$(pwd)\bin'"
```

最后新建一个 Power Shell 会话（重新打开 PowerShell）进行测试即可：

```powershell
Get-Command x
```
