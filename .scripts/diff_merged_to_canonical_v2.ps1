# File: scripts/Compare-MergedToCanonical.ps1
<#! 
.SYNOPSIS
  Robustly diff merged archive tests against their canonical tests and emit a JSON report.

.DESCRIPTION
  Scans a "merged" tests folder, tries to infer the canonical test file referenced in each merged file
  (by regex extraction or by filename fallback), reads both files line-by-line, and reports unique lines
  on each side. Designed to help verify safe deletion of merged archives. Fixes a prior bug where
  one regex had no capture group, causing null canonical targets.

.PARAMETER Root
  Absolute repo root (parent of the _tests_ folders).

.PARAMETER MergedSubdir
  Subdirectory (under Root) containing merged test files.

.PARAMETER CandidateSubdirs
  Candidate canonical test subfolders (under Root) to search by filename fallback.

.PARAMETER OutputFileName
  Report file name (written under Root).

.PARAMETER FilePatterns
  One or more glob patterns for merged files (e.g., '*.test.tsx', '*.test.ts').

.PARAMETER Recurse
  Recurse into subdirectories of the merged folder when searching for files.

.PARAMETER CaseSensitive
  Compare lines case-sensitively. Defaults to case-insensitive to match PowerShell's default behavior.

.PARAMETER IgnoreBlank
  Ignore blank-only lines in comparisons.

.PARAMETER SampleCount
  Max number of sample lines from the merged-only set.

.NOTES
  Keep comparisons simple and readable; intentionally avoids full AST/semantic diffs.
#>

[CmdletBinding()]
param(
  [string]$Root = 'C:\Users\Admin\WSLProjects\apps\KidMap',
  [string]$MergedSubdir = '_tests_\duplicates\merged',
  [string[]]$CandidateSubdirs = @(
    '_tests_\core',
    '_tests_\components',
    '_tests_\misc',
    '_tests_\critical',
    '_tests_\infra'
  ),
  [string]$OutputFileName = 'merge_diff_report_v4.json',
  [string[]]$FilePatterns = @('*.test.tsx','*.test.ts'),
  [switch]$Recurse,
  [switch]$CaseSensitive,
  [switch]$IgnoreBlank,
  [ValidateRange(1, 1000)][int]$SampleCount = 8
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue' # do not terminate; handle per operation

# --- Helpers ---

# Named group 'path' avoids missing-capture bugs.
$script:CanonicalPatterns = @(
  'merged\s+into\s+[`"''“”]?(?<path>[^`"''“”\s]+)[`"''“”]?',
  'Use\s+[`"''“”]?(?<path>[^`"''“”\s]+)[`"''“”]?\s+for\s+the\s+canonical',
  '(?<path>_tests_[^\s`"''\)\;]+)'
) | ForEach-Object { [regex]::new($_, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) }

function Get-CanonicalRelFromContent {
  param([string]$Raw)
  if ([string]::IsNullOrWhiteSpace($Raw)) { return $null }
  foreach ($rx in $script:CanonicalPatterns) {
    $m = $rx.Match($Raw)
    if ($m.Success) {
      $g = $m.Groups['path']
      if ($g -and $g.Value) { return $g.Value }
    }
  }
  return $null
}

function Normalize-RealPath {
  param([string]$Rel)
  if (-not $Rel) { return $null }
  #!/usr/bin/env pwsh
  # Compare merged archives to canonical tests and emit a JSON report (robust, line-based)
  param(
    [string]$Root = 'C:\\Users\\Admin\\WSLProjects\\apps\\KidMap',
    [string]$MergedSubdir = '_tests_\\duplicates\\merged',
    [string[]]$CandidateSubdirs = @('_tests_\\core','_tests_\\components','_tests_\\misc','_tests_\\critical','_tests_\\infra'),
    [string]$OutputFileName = 'merge_diff_report_v4.json',
    [string[]]$FilePatterns = @('*.test.tsx'),
    [switch]$Recurse,
    [int]$SampleCount = 8
  )

  Set-StrictMode -Version Latest
  $ErrorActionPreference = 'Continue'

  function Normalize-RelPath { param([string]$Rel) if (-not $Rel) { return $null }; $p = $Rel.Trim().Trim("'", '"', '`'); $p = $p -replace '/', '\\'; $p = $p -replace '^[\\]+',''; return $p }
  function Read-RawSafe { param([string]$Path) try { Get-Content -LiteralPath $Path -Raw -ErrorAction Stop } catch { '' } }
  function Read-LinesSafe { param([string]$Path) try { @(Get-Content -LiteralPath $Path -ErrorAction Stop) } catch { @() } }

  $patterns = @(
    [regex]::new('merged\\s+into\\s+[`"\\'“”]?([^`"\\'“”\\s]+)[`"\\'“”]?', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase),
    [regex]::new('Use\\s+[`"\\'“”]?([^`"\\'“”\\s]+)[`"\\'“”]?\\s+for\\s+the\\s+canonical', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase),
    [regex]::new('(_tests_[^\\s`"\\'\\)\\;]+)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  )

  $mergedDir = Join-Path -Path $Root -ChildPath $MergedSubdir
  if (-not (Test-Path -LiteralPath $mergedDir -PathType Container)) { Write-Output "MERGED_DIR_NOT_FOUND: $mergedDir"; exit 0 }

  $candidateDirs = $CandidateSubdirs | ForEach-Object { Join-Path -Path $Root -ChildPath $_ }
  $out = @()

  # collect files
  $fileList = New-Object System.Collections.Generic.List[string]
  foreach ($pat in $FilePatterns) { Get-ChildItem -Path $mergedDir -Filter $pat -File -Recurse:$Recurse.IsPresent -ErrorAction SilentlyContinue | ForEach-Object { $fileList.Add($_.FullName) } }

  foreach ($mfile in $fileList) {
    $raw = Read-RawSafe -Path $mfile
    $canonicalRel = $null
    foreach ($rx in $patterns) { $m = $rx.Match($raw); if ($m.Success) { if ($m.Groups.Count -gt 1) { $canonicalRel = $m.Groups[1].Value } else { $canonicalRel = $m.Value }; break } }

    $canonicalPath = $null; $canonicalExists = $false
    if ($canonicalRel) {
      $normalized = Normalize-RelPath $canonicalRel
      if ($normalized -match '^[A-Za-z]:\\\\' -or $normalized -match '^\\\\') { $canonicalPath = $normalized }
      elseif ($normalized -match '^_tests_') { $canonicalPath = Join-Path -Path $Root -ChildPath $normalized }
      else { $canonicalPath = Join-Path -Path $Root -ChildPath $normalized }
      $canonicalExists = Test-Path -LiteralPath $canonicalPath -PathType Leaf
    }

    # fallback by filename
    if (-not $canonicalExists) {
      $base = [System.IO.Path]::GetFileName($mfile)
      $candidateName = if ($base -match '__') { ($base -split '__')[-1] } else { $base }
      foreach ($dir in $candidateDirs) { $cand = Join-Path -Path $dir -ChildPath $candidateName; if (Test-Path -LiteralPath $cand -PathType Leaf) { $canonicalPath = $cand; $canonicalExists = $true; break } }
    }

    $mergedLines = Read-LinesSafe -Path $mfile
    $canonLines = if ($canonicalExists) { Read-LinesSafe -Path $canonicalPath } else { @() }

    $onlyInMerged = @(); $onlyInCanonical = @()
    if ($mergedLines.Count -gt 0) { $onlyInMerged = $mergedLines | Where-Object { $_ -and ($canonLines -notcontains $_) } }
    if ($canonLines.Count -gt 0) { $onlyInCanonical = $canonLines | Where-Object { $_ -and ($mergedLines -notcontains $_) } }

    $sampleMerged = ($onlyInMerged | Select-Object -First $SampleCount) -join "`n"
    $canDelete = ($canonicalExists -and $onlyInMerged.Count -eq 0)

    $out += [PSCustomObject]@{
      MergedFile = $mfile
      CanonicalDeclared = $canonicalRel
      CanonicalPath = $canonicalPath
      CanonicalExists = $canonicalExists
      UniqueLinesInMerged = $onlyInMerged.Count
      UniqueLinesSample = $sampleMerged
      UniqueLinesInCanonical = $onlyInCanonical.Count
      CanSafelyDeleteMergedArchive = $canDelete
    }
  }

  $reportPath = Join-Path -Path $Root -ChildPath $OutputFileName
  $out | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding utf8
  if (Test-Path -LiteralPath $reportPath -PathType Leaf) { Write-Output ("WROTE=$reportPath") } else { Write-Output ("FAILED_TO_WRITE=$reportPath") }