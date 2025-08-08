#!/usr/bin/env bash

echo "🚀 Starting Expo + Jest project repair..."

function safe_run() {
  echo "🔧 $1..."
  eval "$2" || echo "⚠️ Failed: $1"
}

# Reinstall dev dependencies
safe_run "Installing devDependencies" "npm install --save-dev jest jest-expo babel-jest eslint prettier lint-staged husky @types/jest"

# Create ESLint config
if [ ! -f .eslintrc.json ]; then
cat <<EOL > .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "plugins": ["react"],
  "env": { "browser": true, "es2021": true, "jest": true },
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" }
}
EOL
  echo "🧠 Created .eslintrc.json"
fi

# Create Prettier config
if [ ! -f .prettierrc ]; then
cat <<EOL > .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all"
}
EOL
  echo "🧠 Created .prettierrc"
fi

# Create .nvmrc
if [ ! -f .nvmrc ]; then
  echo "18" > .nvmrc
  echo "📦 Added .nvmrc with Node.js v18"
fi

# Create tsconfig.json
if [ ! -f tsconfig.json ]; then
cat <<EOL > tsconfig.json
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
EOL
  echo "🧠 Created tsconfig.json"
fi

# Patch unsafe global.navigator definitions
echo "🛠 Scanning and patching unsafe global.navigator overrides..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" | while read file; do
  if grep -q "Object.defineProperty(global, 'navigator'" "$file"; then
    sed -i.bak "s/Object\.defineProperty([^)]*navigator[^)]*)/global.navigator = { userAgent: 'node' };/g" "$file"
    echo "✅ Patched: $file"
  fi
done

# Format with Prettier
safe_run "Running Prettier" "npx prettier --write ."

# Run ESLint
safe_run "Running ESLint" "npx eslint . --ext .ts,.tsx,.js,.jsx"

# Git hook setup
if [ -d .git ]; then
  npx husky install
  npx husky add .husky/pre-commit "npx lint-staged"
  echo "✅ Pre-commit lint hook installed"
fi

# Validate Jest
safe_run "Running Jest" "npx jest --passWithNoTests"

echo "🏁 Project repair complete! You can now develop or test."
