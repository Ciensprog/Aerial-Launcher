import js from '@eslint/js'
import importX from 'eslint-plugin-import-x'
import tseslint from 'typescript-eslint'

import globals from 'globals'

export default tseslint.config(
  { ignores: ['.vite/**', 'out/**', 'node_modules/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  importX.configs['flat/recommended'],
  importX.configs['flat/typescript'],
  importX.configs['flat/electron'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  }
)
