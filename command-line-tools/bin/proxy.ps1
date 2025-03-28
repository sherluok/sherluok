# 本文件含有中文字符，需要以 UTF-8 with BOM 编码格式保存，参考：
# https://learn.microsoft.com/zh-cn/answers/questions/2198458/powershell-utf-8-ps1

# https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Core/about/about_ansi_terminals?view=powershell-5.1#ansi-terminal-support
# Get-PSReadLineOption
$ESC = [char]0x1b;
$RESET = 0;
$BOLD = 1;
$DIM = 2;
$RED = 31;
$GREEN = 92;
$YELLOW = 93;
$CYAN = 36;

Function Write-Proxy {
  Write-Host ("   $ESC[{0}m`$env:HTTP_PROXY  $ESC[{1}m= $ESC[{2}m`"$env:HTTP_PROXY`"$ESC[{3}m" -f $GREEN, "$RESET;$DIM", "$RESET;$CYAN", $RESET);
  Write-Host ("   $ESC[{0}m`$env:HTTPS_PROXY $ESC[{1}m= $ESC[{2}m`"$env:HTTPS_PROXY`"$ESC[{3}m" -f $GREEN, "$RESET;$DIM", "$RESET;$CYAN", $RESET);
  Write-Host ("   $ESC[{0}m`$env:ALL_PROXY   $ESC[{1}m= $ESC[{2}m`"$env:ALL_PROXY`"$ESC[{3}m" -f $GREEN, "$RESET;$DIM", "$RESET;$CYAN", $RESET);
  Write-Host ("   $ESC[{0}m`$env:NO_PROXY    $ESC[{1}m= $ESC[{2}m`"$env:NO_PROXY`"$ESC[{3}m" -f $GREEN, "$RESET;$DIM", "$RESET;$CYAN", $RESET);
}

Function Enable-Proxy {
  Write-Host "🟢 打开代理";
  $proxy = "http://127.0.0.1:1080";
  $env:HTTP_PROXY = $proxy;
  $env:HTTPS_PROXY = $proxy;
  $env:ALL_PROXY = $proxy;
  # $env:NO_PROXY = "";
  Write-Proxy;

  if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Host "`n$ESC[2m   只有 PowerShell 7.0 及以后版本，curl (Invoke-WebRequest) 命令才会使用环境变量，`n   您现在的 $($PSVersionTable.PSVersion.Major).$($PSVersionTable.PSVersion.Minor) 版本中只能通过 curl -Proxy `"$proxy`" 来显示指定代理。`n$ESC[0m";
  }
}

Function Disable-Proxy {
  Write-Host "🔴 关闭代理";
  $env:HTTP_PROXY = "";
  $env:HTTPS_PROXY = "";
  $env:ALL_PROXY = "";
  Write-Proxy;
}

Function Switch-Proxy {
  if (-not $env:HTTP_PROXY) {
    Enable-Proxy
  } else {
    Disable-Proxy;
  }
}

# 《您想要知道語句的 if 一切》
# https://learn.microsoft.com/zh-cn/powershell/scripting/learn/deep-dives/everything-about-if?view=powershell-7.5

if ($args[0] -eq "ls") {
  Write-Proxy;
} elseif ($args[0] -eq "on") {
  Enable-Proxy;
} elseif ($args[0] -eq "off") {
  Disable-Proxy;
} elseif (-not $args[0]) {
  Switch-Proxy;
} else {
  if ($args[0] -ne "help") {
    Write-Host ("$ESC[{0}m未知命令 `"{1}`"！$ESC[{2}m" -f "$RED;$BOLD", $args[0], $RESET);
  }
  Write-Host ("$ESC[{0}m使用方法：$ESC[{1}m" -f $RESET, $RESET);
  Write-Host ("$ESC[{0}m    proxy$ESC[{1}m $ESC[{2}m······$ESC[{3}m 🔄 切换代理$ESC[{4}m" -f $YELLOW, $RESET, $DIM, $RESET, $RESET);
  Write-Host ("$ESC[{0}m    proxy$ESC[{1}m on $ESC[{2}m···$ESC[{3}m 🟢 打开代理$ESC[{4}m" -f $YELLOW, $RESET, $DIM, $RESET, $RESET);
  Write-Host ("$ESC[{0}m    proxy$ESC[{1}m off $ESC[{2}m··$ESC[{3}m 🔴 关闭代理$ESC[{4}m" -f $YELLOW, $RESET, $DIM, $RESET, $RESET);
  Write-Host ("$ESC[{0}m    proxy$ESC[{1}m ls  $ESC[{2}m·····$ESC[{3}m 查看代理$ESC[{4}m" -f $YELLOW, $RESET, $DIM, $RESET, $RESET);
}
