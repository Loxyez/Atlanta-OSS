# Code Formatting and Style Guide

This project uses Prettier and ESLint to maintain consistent code quality and formatting across the codebase.

## Setup

The following tools are configured for this project:

- **Prettier**: Code formatter that enforces consistent style
- **ESLint**: JavaScript linter that identifies and reports on patterns in JavaScript
- **VS Code Integration**: Automatic formatting on save

## Configuration

### Prettier Configuration (`.prettierrc`)
```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": false,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto"
}
```

### ESLint Configuration
- Extends React App and Jest configurations
- Custom rules for code quality
- Maximum line length: 120 characters
- Warnings for camelCase violations and unused variables

## Available Scripts

### Formatting Scripts
```bash
# Check if files are formatted correctly
npm run prettier

# Automatically fix formatting issues
npm run prettier:fix

# Check specific file types only
npm run prettier:check

# Run ESLint to find code issues
npm run lint

# Automatically fix ESLint issues
npm run lint:fix

# Run both Prettier and ESLint fixes
npm run format
```

## Usage

### Manual Formatting
To format your code manually, run:
```bash
npm run format
```

### VS Code Integration
If you're using VS Code, the following settings are configured in `.vscode/settings.json`:
- Format on save is enabled
- Prettier is set as the default formatter
- ESLint auto-fix on save
- Single quotes preference
- 2-space indentation

### Pre-commit Hooks (Optional)
The project includes `lint-staged` configuration for pre-commit formatting:
```json
{
  "src/**/*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix"
  ],
  "src/**/*.{json,css,scss,md}": [
    "prettier --write"
  ]
}
```

## Style Guidelines

This configuration follows these principles:
- **Consistency**: All code follows the same formatting rules
- **Readability**: 120-character line limit for better readability
- **Modern JavaScript**: ES2020+ features support
- **React Best Practices**: JSX-specific formatting rules
- **Accessibility**: Single quotes for better accessibility

## File Exclusions

The following files and directories are excluded from formatting (`.prettierignore`):
- `node_modules/`
- `build/` and `dist/`
- Environment files (`.env*`)
- Package lock files
- Images and fonts
- Log files

## Troubleshooting

### Common Issues

1. **ESLint plugin conflicts**: Resolved by using React App's default ESLint configuration
2. **Line length warnings**: Increased to 120 characters for better developer experience
3. **Camelcase warnings**: Set to warnings instead of errors for existing codebase compatibility

### Getting Help

If you encounter issues with formatting:
1. Check if your VS Code has the Prettier extension installed
2. Verify that `.prettierrc` exists in the project root
3. Run `npm run format` to fix most issues automatically
4. For ESLint-specific issues, run `npm run lint` to see detailed error messages

## Benefits

- **Consistent Code Style**: All team members write code in the same style
- **Reduced Code Review Time**: No need to discuss formatting in reviews
- **Automatic Fixes**: Most issues are fixed automatically
- **Better Collaboration**: Easier to read and understand each other's code
- **Quality Assurance**: Catches common errors and enforces best practices
