param([switch]$Offline)
. (Join-Path $PSScriptRoot 'android-env.ps1')
Push-Location $ProjectRoot
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Web build failed.' }
    & npx.cmd --no-install cap sync android
    if ($LASTEXITCODE -ne 0) { throw 'Android asset sync failed.' }
    Push-Location (Join-Path $ProjectRoot 'android')
    try {
        $gradleArgs = @(':app:assembleDebug', '--no-daemon', '--max-workers=1', '--console=plain')
        if ($Offline) { $gradleArgs += '--offline' }
        & .\gradlew.bat @gradleArgs
        if ($LASTEXITCODE -ne 0) { throw 'Android APK build failed.' }
    } finally { Pop-Location }
    $destination = Join-Path $ProjectRoot 'output\android'
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    $apk = Join-Path $destination 'Mlang-Go-1.1-debug.apk'
    Copy-Item -LiteralPath (Join-Path $ProjectRoot 'android\app\build\outputs\apk\debug\app-debug.apk') -Destination $apk -Force
    $stream = [IO.File]::OpenRead($apk)
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $hash = [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-', '') }
    finally { $stream.Dispose(); $hasher.Dispose() }
    [IO.File]::WriteAllText(($apk + '.sha256'), "$hash  $([IO.Path]::GetFileName($apk))" + [Environment]::NewLine)
    Write-Host "APK ready: $apk"
    Write-Host "SHA256: $hash"
} finally { Pop-Location }
