# Compare files in _tests_/duplicates/discardable to canonical candidate dirs
$root = (Get-Location).Path
$discardableDir = Join-Path $root "_tests_\duplicates\discardable"
$candidateDirs = @(
    Join-Path $root "_tests_\components",
    Join-Path $root "_tests_\core",
    Join-Path $root "_tests_\misc",
    Join-Path $root "_tests_\critical",
    Join-Path $root "_tests_\infra"
)

$report = @()
if (-Not (Test-Path $discardableDir)) { Write-Output "DISCARDABLE_DIR_NOT_FOUND: $discardableDir"; exit 0 }
Get-ChildItem -Path $discardableDir -Filter *.test.tsx -File | ForEach-Object {
    $f = $_
    $name = $f.Name
    if ($name -match '__') { $candidateName = ($name -split '__')[-1] } else { $candidateName = $name }
    $found = $null
    foreach ($dir in $candidateDirs) {
        $candidatePath = Join-Path $dir $candidateName
        if (Test-Path $candidatePath) { $found = $candidatePath; break }
    }
    if ($found) {
        $a = Get-Content -Raw -LiteralPath $f.FullName
        $b = Get-Content -Raw -LiteralPath $found
        $status = if ($a -eq $b) { 'identical' } else { 'different' }
        $report += [PSCustomObject]@{Discardable = $f.FullName; Canonical = $found; Status = $status}
    } else {
        $report += [PSCustomObject]@{Discardable = $f.FullName; Canonical = $null; Status = 'no-canonical-found'}
    }
}

$outPath = Join-Path $root "discardable_comparison.json"
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $outPath -Encoding utf8

$total = $report.Count
$ident = ($report | Where-Object {$_.Status -eq 'identical'}).Count
$diff = ($report | Where-Object {$_.Status -eq 'different'}).Count
$none = ($report | Where-Object {$_.Status -eq 'no-canonical-found'}).Count
Write-Output ("TOTAL_DISCARDABLE=$total")
Write-Output ("IDENTICAL=$ident")
Write-Output ("DIFFERENT=$diff")
Write-Output ("NO_CANONICAL=$none")
Write-Output ("WROTE=$outPath")
