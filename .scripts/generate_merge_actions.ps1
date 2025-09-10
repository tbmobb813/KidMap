# File: scripts/Generate-MergeActions.ps1
<#!
.SYNOPSIS
  Generate merge actions by mapping merged archive tests to canonical tests and collecting unique lines.

.DESCRIPTION
  Scans a merged tests folder, extracts/infers the canonical test path for each merged file, compares
  line sets, and emits a JSON report including per-file unique lines and counts. Uses robust regexes
  with a named capture group to avoid missing-capture bugs. Supports multiple file patterns and recursion.

.PARAMETER Root
  Absolute repo root (parent of the _tests_ folders).

.PARAMETER MergedSubdir
  Subdirectory (under Root) containing merged test files.

.PARAMETER CandidateSubdirs
  Candidate canonical test subfolders (under Root) to search by filename fallback.

.PARAMETER OutputFileName
  Report file name (written under Root). Defaults to 'merge_actions.json'.

.PARAMETER FilePatterns
  One or more glob patterns for merged files (e.g., '*.test.tsx','*.test.ts').

.PARAMETER Recurse
  Recurse into subdirectories of the merged folder when searching for files.

.PARAMETER CaseSensitive
  Compare lines case-sensitively (default is case-insensitive).

.PARAMETER IgnoreBlank
  Ignore blank-only lines in comparisons and in output arrays.

.PARAMETER MaxLinesPerSide
  Maximum number of unique lines to include per side (merged/canonical) in the output object (to avoid huge payloads).

.NOTES
  Keeps logic simple, line-based; not an AST diff. Designed for maintainability and robustness.
#>

[CmdletBinding()]
param(
  [string]$Root = 'C:\\Users\\Admin\\WSLProjects\\apps\\KidMap',
  [string]$MergedSubdir = '_tests_\\duplicates\\merged',
  [string[]]$CandidateSubdirs = @(
    '_tests_\\core',
    '_tests_\\components',
    '_tests_\\misc',
    '_tests_\\critical',
    '_tests_\\infra'
  ),
  [string]$OutputFileName = 'merge_actions.json',
  [string[]]$FilePatterns = @('*.test.tsx','*.test.ts'),
  [switch]$Recurse,
  [switch]$CaseSensitive,
  [switch]$IgnoreBlank,
  [ValidateRange(1,5000)][int]$MaxLinesPerSide = 500
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

# --- Helpers ---

# Named capture 'path' avoids fragile group-index branches.
#!/usr/bin/env pwsh
# Generate merge actions: call the robust diff script and write a simplified merge_actions.json
$root = 'C:\Users\Admin\WSLProjects\apps\KidMap'
$diffScript = Join-Path $root '.scripts\diff_merged_to_canonical_v2.ps1'

if (-not (Test-Path $diffScript)) { Write-Output "DIFF_SCRIPT_NOT_FOUND: $diffScript"; exit 1 }

# Run the diff script (produces merge_diff_report_v2.json)
& powershell -NoProfile -ExecutionPolicy Bypass -File $diffScript

# Prefer any existing merge_diff_report JSON (v4/v3/v2). Pick the newest by name if multiple.
$candidates = Get-ChildItem -Path $root -Filter 'merge_diff_report*.json' -File -ErrorAction SilentlyContinue | Sort-Object Name -Descending
if ($candidates -and $candidates.Count -gt 0) { $report = $candidates[0].FullName } else { Write-Output "DIFF_REPORT_NOT_FOUND: merge_diff_report*.json in $root"; exit 2 }

# read the diff report and transform into actions
$data = ConvertFrom-Json (Get-Content -Raw -LiteralPath $report)
$out = @()
foreach ($item in $data) {
  $out += [PSCustomObject]@{
    MergedFile = $item.MergedFile
    CanonicalDeclared = $item.CanonicalDeclared
    CanonicalPath = $item.CanonicalPath
    CanonicalExists = $item.CanonicalExists
    UniqueLinesInMerged = $item.UniqueLinesInMerged
    UniqueLinesInCanonical = $item.UniqueLinesInCanonical
    CanSafelyDeleteMergedArchive = $item.CanSafelyDeleteMergedArchive
  }
}

$reportPath = Join-Path $root 'merge_actions.json'
$out | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding utf8
if (Test-Path $reportPath) { Write-Output ("WROTE=$reportPath") } else { Write-Output ("FAILED_TO_WRITE=$reportPath") }