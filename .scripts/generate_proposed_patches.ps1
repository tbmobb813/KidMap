Param()

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$outDir = Join-Path $repo '_tests_\duplicates\proposed_patches'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$candidates = @(
    @{ Merged = Join-Path $repo '_tests_\duplicates\merged\components__routeCard.test.tsx'; Canonical = Join-Path $repo '_tests_\core\routeCard.test.tsx'; Name = 'routeCard' },
    @{ Merged = Join-Path $repo '_tests_\duplicates\merged\telemetry.test.tsx'; Canonical = Join-Path $repo '_tests_\critical\telemetry.test.tsx'; Name = 'telemetry' }
)

$allSummaries = @()

foreach ($c in $candidates) {
    if (-not (Test-Path $c.Merged)) {
        Write-Output "SKIP: merged file not found: $($c.Merged)"
        continue
    }
    if (-not (Test-Path $c.Canonical)) {
        Write-Output "SKIP: canonical file not found: $($c.Canonical)"
        continue
    }
    $basename = $c.Name
    $backupPath = Join-Path $outDir "$basename` .backup"
    Copy-Item -Path $c.Canonical -Destination $backupPath -Force

    # Read lines (non-empty) preserving order
    $canonicalLines = Get-Content -LiteralPath $c.Canonical -ErrorAction Stop | ForEach-Object { $_.TrimEnd() }
    $mergedLines = Get-Content -LiteralPath $c.Merged -ErrorAction Stop | ForEach-Object { $_.TrimEnd() }

    $unique = @()
    foreach ($ln in $mergedLines) {
        if ($ln -and -not ($canonicalLines -contains $ln)) { $unique += $ln }
    }
    $unique = $unique | Select-Object -Unique

    $patchedPath = Join-Path $outDir "$basename.patched"
    Set-Content -LiteralPath $patchedPath -Value (Get-Content -LiteralPath $c.Canonical -ErrorAction Stop) -Force

    if ($unique.Count -gt 0) {
        Add-Content -LiteralPath $patchedPath -Value "" # newline
        Add-Content -LiteralPath $patchedPath -Value "// --- MERGED UNIQUE BLOCK: from $($c.Merged) ---"
        foreach ($l in $unique) { Add-Content -LiteralPath $patchedPath -Value $l }
        Add-Content -LiteralPath $patchedPath -Value "// --- END MERGED UNIQUE BLOCK ---"
    }

    $diffPath = Join-Path $outDir "$basename.patch"
    & git --no-pager diff --no-index -- "$c.Canonical" "$patchedPath" > $diffPath 2>&1

    $summary = [PSCustomObject]@{
        Name = $basename
        Merged = $c.Merged
        Canonical = $c.Canonical
        Backup = $backupPath
        Patched = $patchedPath
        UniqueCount = $unique.Count
        Diff = $diffPath
    }
    $allSummaries += $summary

    $summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outDir "$basename`_patch_summary.json") -Force
    Write-Output "WROTE: $(Join-Path $outDir "$basename`_patch_summary.json")"
}

# combined summary
$allSummaries | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outDir 'proposed_patches_index.json') -Force
Write-Output "WROTE INDEX: $(Join-Path $outDir 'proposed_patches_index.json')"
