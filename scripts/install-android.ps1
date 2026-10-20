param([string]$Serial, [string]$ApkPath)
. (Join-Path $PSScriptRoot 'android-env.ps1')
if (-not $ApkPath) { $ApkPath = Join-Path $ProjectRoot 'output\android\Mlang-Go-1.1-debug.apk' }
if (-not (Test-Path -LiteralPath $ApkPath)) { throw 'Build the APK first with npm run android:build.' }
$deviceOutput = & $AdbPath devices -l
if ($LASTEXITCODE -ne 0) { throw 'Could not query Android devices.' }
$devices = @($deviceOutput | Where-Object { $_ -match '^\S+\s+device(?:\s|$)' } | ForEach-Object { ($_ -split '\s+')[0] })
if ($Serial) {
    if ($Serial -notin $devices) { throw 'The selected phone is not connected and authorized. Unlock it and accept Allow USB debugging.' }
} elseif ($devices.Count -eq 1) { $Serial = $devices[0] }
elseif ($devices.Count -gt 1) { throw 'Multiple devices detected. Run this script with -Serial followed by the intended phone serial.' }
else { throw 'No authorized Android phone detected. Connect a data-capable USB cable, enable USB debugging, and accept the phone prompt.' }

# -r preserves existing app data. Never uninstall or clear a phone to fix errors.
$targetUser = (& $AdbPath -s $Serial shell am get-current-user | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $targetUser -notmatch '^\d+$') { throw 'Could not determine the active Android user.' }
& $AdbPath -s $Serial install --user $targetUser -r $ApkPath
if ($LASTEXITCODE -ne 0) { throw 'Installation failed. Existing app data has been preserved; review the ADB error above.' }
$launchOutput = & $AdbPath -s $Serial shell am start --user $targetUser -W -n 'com.mlangpocket.app/.MainActivity'
$launchOutput | Write-Output
if ($LASTEXITCODE -ne 0 -or -not ($launchOutput -match 'Status: ok')) { throw 'Installed, but the app launch could not be confirmed.' }
& $AdbPath -s $Serial shell dumpsys package com.mlangpocket.app | Select-String 'versionCode=|versionName=|lastUpdateTime='
Write-Host 'Mlang Go installed and launch requested. Check the phone screen to confirm it is usable.'
