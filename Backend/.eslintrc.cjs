import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { languageOptions: { globals: globals.node } },
  js.configs.recommended,
  prettier,
  {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    },
    ignores: ['node_modules/', 'coverage/', 'dist/']
  }
];
