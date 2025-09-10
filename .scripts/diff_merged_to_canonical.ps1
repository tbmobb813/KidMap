# Diff merged archive files against their declared canonical targets.
$root = (Get-Location).Path
$mergedDir = Join-Path $root "_tests_\duplicates\merged"
$out = @()
if (-Not (Test-Path $mergedDir)) { Write-Output "MERGED_DIR_NOT_FOUND: $mergedDir"; exit 0 }
Get-ChildItem -Path $mergedDir -Filter *.test.tsx -File | ForEach-Object {
    $mfile = $_.FullName
    $head = Get-Content -LiteralPath $mfile -TotalCount 10 -ErrorAction SilentlyContinue -Raw
    $canonicalRel = $null
    # Try several regexes to capture the canonical path in the header
    $patterns = @(
        'merged into `([^`]*)`',
        'merged into (_tests_[^\s`]*)',
        'Use `([^`]*)` for the canonical',
        'Use (_tests_[^\s`]*) for the canonical'
    )
    foreach ($p in $patterns) {
        $m = [regex]::Match($head, $p)
        if ($m.Success) { $canonicalRel = $m.Groups[1].Value; break }
    }

    $canonicalPath = $null
    $canonicalExists = $false
    if ($canonicalRel) {
        # normalize forward slashes to backslashes
        $canonicalRel = $canonicalRel -replace '/', '\\'
        # If path is relative (starts with _tests_), join with root
        if ($canonicalRel -match '^[\\/_]*?_tests_') {
            # Trim leading slashes
            $trim = $canonicalRel -replace '^[\\/]+',''
            $canonicalPath = Join-Path $root $trim
        } elseif ([System.IO.Path]::IsPathRooted($canonicalRel)) {
            $canonicalPath = $canonicalRel
        } else {
            $canonicalPath = Join-Path $root $canonicalRel
        }
        $canonicalExists = Test-Path $canonicalPath
    }

    $mergedLines = @()
    $canonLines = @()
    try { $mergedLines = Get-Content -LiteralPath $mfile -ErrorAction Stop } catch { $mergedLines = @() }
    if ($canonicalExists) {
        try { $canonLines = Get-Content -LiteralPath $canonicalPath -ErrorAction Stop } catch { $canonLines = @() }
    }

    # Compute unique lines in merged that are not present in canonical (simple text-based heuristic)
    $onlyInMerged = @()
    if ($mergedLines.Count -gt 0) {
        $onlyInMerged = $mergedLines | Where-Object { $_ -ne '' } | Where-Object { $_ -notin $canonLines }
    }
    $onlyInCanonical = @()
    if ($canonicalExists -and $canonLines.Count -gt 0) {
        $onlyInCanonical = $canonLines | Where-Object { $_ -ne '' } | Where-Object { $_ -notin $mergedLines }
    }

    $sampleMerged = $onlyInMerged | Select-Object -First 8

    $canDelete = ($onlyInMerged.Count -eq 0)

    $out += [PSCustomObject]@{
        MergedFile = $mfile
        CanonicalDeclared = $canonicalRel
        CanonicalPath = $canonicalPath
        CanonicalExists = $canonicalExists
        UniqueLinesInMerged = $onlyInMerged.Count
        UniqueLinesSample = $sampleMerged -join "\n"
        UniqueLinesInCanonical = $onlyInCanonical.Count
        CanSafelyDeleteMergedArchive = $canDelete
    }
}

$reportPath = "C:\\Users\\Admin\\WSLProjects\\apps\\KidMap\\merge_diff_report.json"
$out | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportPath -Encoding utf8
if (Test-Path $reportPath) { Write-Output ("WROTE=" + $reportPath) } else { Write-Output ("FAILED_TO_WRITE=" + $reportPath) }
