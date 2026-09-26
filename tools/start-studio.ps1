$ErrorActionPreference = 'Stop'
$studioRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$studioUrl = 'http://127.0.0.1:4177/studio/'

function Test-Studio {
  try {
    $response = Invoke-WebRequest -Uri $studioUrl -TimeoutSec 2 -UseBasicParsing
    return $response.StatusCode -eq 200 -and $response.Content.Contains('Blog Studio')
  } catch {
    return $false
  }
}

if (-not (Test-Studio)) {
  $node = (Get-Command node.exe -ErrorAction Stop).Source
  $previous = $env:BLOG_STUDIO_NO_BROWSER
  $env:BLOG_STUDIO_NO_BROWSER = '1'
  try {
    Start-Process -FilePath $node -ArgumentList 'tools/studio-server.js' -WorkingDirectory $studioRoot -WindowStyle Hidden
  } finally {
    $env:BLOG_STUDIO_NO_BROWSER = $previous
  }
  $ready = $false
  for ($attempt = 0; $attempt -lt 50; $attempt++) {
    Start-Sleep -Milliseconds 100
    if (Test-Studio) { $ready = $true; break }
  }
  if (-not $ready) { throw 'Blog Studio could not start on 127.0.0.1:4177.' }
}

if ($env:BLOG_STUDIO_NO_BROWSER -ne '1') { Start-Process $studioUrl }
