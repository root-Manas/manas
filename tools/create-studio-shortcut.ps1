$ErrorActionPreference = 'Stop'
$studioRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$shortcutPath = 'C:\Users\Public\Desktop\Blog Studio.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = (Get-Command powershell.exe).Source
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$(Join-Path $PSScriptRoot 'start-studio.ps1')`""
$shortcut.WorkingDirectory = $studioRoot
$shortcut.Description = 'Open the local Manas Blog Studio in your browser'
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,70"
$shortcut.Save()
Write-Output $shortcutPath
