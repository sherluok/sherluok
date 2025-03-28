#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

# Write-Host "`$basedir: $basedir";

# $command = "node $basedir\x.cjs $args";

# Write-Host "`$command: $command";

node.exe --import tsx "$basedir\..\src\x.ts" $args

# Write-Host "before exit $LASTEXITCODE";
exit $LASTEXITCODE;
# Write-Host "after exit $LASTEXITCODE";
