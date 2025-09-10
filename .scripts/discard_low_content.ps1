# Move low-content or placeholder test files from rescue -> discarded
$root = (Get-Location).Path
$rescueDir = Join-Path $root "_tests_\duplicates\rescue"
$discardedDir = Join-Path $root "_tests_\duplicates\discarded"
if (-Not (Test-Path $rescueDir)) { Write-Output "RESCUE_DIR_NOT_FOUND: $rescueDir"; exit 0 }
if (-Not (Test-Path $discardedDir)) { New-Item -ItemType Directory -Path $discardedDir | Out-Null }

$thresholdChars = 200
$moved = @()
$retained = @()
Get-ChildItem -Path $rescueDir -Filter *.test.tsx -File | ForEach-Object {
    $path = $_.FullName
    $raw = Get-Content -Raw -LiteralPath $path -ErrorAction SilentlyContinue
    if (-not $raw) { Push-Location; $moveTo = Join-Path $discardedDir $_.Name; Move-Item -LiteralPath $path -Destination $moveTo; $moved += $moveTo; Pop-Location; return }

    # strip block comments and line comments
    $stripped = $raw -replace '(?s)/\*.*?\*/',''    # remove /* ... */
    $stripped = $stripped -replace '^[ \t]*//.*$','' -replace "\r","" -replace "\n","\n"
    # remove lines that are only comment-like
    $lines = $stripped -split "\n"
    $usefulLines = $lines | Where-Object { $_ -notmatch '^[ \t]*($|//|\*)' -and $_ -notmatch '\.\.\.existing code\.\.\.' -and $_ -notmatch 'placeholder' -and $_ -notmatch 'TODO' }
    $usefulText = ($usefulLines -join "\n").Trim()

    if ($usefulText.Length -lt $thresholdChars) {
        $moveTo = Join-Path $discardedDir $_.Name
        Move-Item -LiteralPath $path -Destination $moveTo
        $moved += $moveTo
    } else {
        $retained += $path
    }
}

$out = [PSCustomObject]@{
    MovedCount = $moved.Count
    RetainedCount = $retained.Count
    Moved = $moved
    Retained = $retained
}
$out | ConvertTo-Json -Depth 5 | Out-File -FilePath (Join-Path $root "discard_low_content_report.json") -Encoding utf8
Write-Output ("MOVED=" + $out.MovedCount)
Write-Output ("RETAINED=" + $out.RetainedCount)
Write-Output ("WROTE=" + (Join-Path $root "discard_low_content_report.json"))
