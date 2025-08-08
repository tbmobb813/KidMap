Write-Host "🚀 Starting Expo + Jest project repair..." -ForegroundColor Cyan

# Helper: Safe run
function Invoke-SafeRun($cmd, $description) {
    Write-Host "🔧 $description..." -ForegroundColor Gray
    try {
        Invoke-Expression $cmd
    } catch {
        Write-Host "⚠️ Failed: $description" -ForegroundColor Red
    }
}

# Reinstall test & linting dependencies
Invoke-SafeRun "npm install --save-dev jest jest-expo babel-jest eslint prettier lint-staged husky @types/jest" "Installing dev dependencies"

# Create basic ESLint config if missing
if (-not (Test-Path .eslintrc.json)) {
@'
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "plugins": ["react"],
  "env": { "browser": true, "es2021": true, "jest": true },
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" }
}
'@ | Set-Content .eslintrc.json
    Write-Host "🧠 Created .eslintrc.json"
}

# Create basic Prettier config if missing
if (-not (Test-Path .prettierrc)) {
@'
{
  "singleQuote": true,
  "trailingComma": "all"
}
'@ | Set-Content .prettierrc
    Write-Host "🧠 Created .prettierrc"
}

# Create .nvmrc if not exists
if (-not (Test-Path .nvmrc)) {
    "18" | Set-Content .nvmrc
    Write-Host "📦 Added .nvmrc with Node.js v18"
}

# Create tsconfig.json if missing
if (-not (Test-Path tsconfig.json)) {
@'
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "scripts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "build"]
}
'@ | Set-Content tsconfig.json
    Write-Host "🧠 Created tsconfig.json"
}

# Patch unsafe globals like Object.defineProperty(global, 'navigator'...)
Write-Host "🛠 Scanning and patching unsafe global.navigator overrides..." -ForegroundColor Cyan
$excludedExtensions = @(".json", ".md", ".lock", ".png", ".jpg", ".jpeg", ".ico", ".svg", ".zip", ".ps1")
$extensionsToScan = "*.ts", "*.tsx", "*.js", "*.jsx"

$allFiles = Get-ChildItem -Recurse -File -Include $extensionsToScan -ErrorAction SilentlyContinue |
            Where-Object { $excludedExtensions -notcontains $_.Extension }

foreach ($file in $allFiles) {
  $content = Get-Content $file.FullName -Raw
  $originalContent = $content # Store original content for comparison
}
  # 🛡️ Safe replace global.navigator overrides
  $pattern = "Object\.defineProperty\s*\(\s*global\s*,\s*['\""]navigator['\""]\s*,\s*\{.*?\}\s*\)"
  $replacement = "global.navigator = { userAgent: 'node' };"
  $content = [regex]::Replace($content, $pattern, $replacement, 'Singleline')
  
  if ($content -ne $originalContent) {
      Set-Content -Path $file.FullName -Value $content -Encoding UTF8
      Write-Host "✅ Patched: $($file.FullName)" -ForegroundColor Green
  }
  
  # 🧼 Format all files
  Invoke-SafeRun "npx prettier --write ." "Running Prettier"
  
  # 🧹 Lint the project
  Invoke-SafeRun "npx eslint --ext .ts,.tsx,.js,.jsx ." "Running ESLint"
  
  # 🪝 Git hook setup
  if (Test-Path .git) {
      npx husky install
      npx husky add .husky/pre-commit "npx lint-staged"
      Write-Host "✅ Pre-commit lint hook installed" -ForegroundColor Yellow
  }
  
  # ✅ Validate Jest setup
  Invoke-SafeRun "npx jest --passWithNoTests" "Running Jest"
  
  Write-Host "`n🏁 Project repair complete! You can now develop or test." -ForegroundColor Green
  Write-Host "🚀 Happy coding! 🚀" -ForegroundColor Cyan  