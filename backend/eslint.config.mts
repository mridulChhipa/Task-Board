import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
  prettierConfig,
  prettierPlugin,
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Do not use default exports. Use named exports instead.',
        },
        {
          selector: 'TSModuleDeclaration',
          message: 'Do not use TypeScript namespaces. Use ES modules instead.',
        },
        {
          selector: "ExportNamedDeclaration > VariableDeclaration[kind='let']",
          message:
            'Do not use mutable exports (export let). Use const or a getter function instead.',
        },
        {
          selector: 'PrivateIdentifier',
          message:
            "Use TypeScript's private keyword instead of # private fields.",
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-require-imports': 'error',

      'no-var': 'error',
      'prefer-const': 'error',
      'one-var': ['error', 'never'],

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': 'allow-with-description',
        },
      ],

      'func-style': [
        'error',
        'declaration',
        // {
        //   allowArrowFunctions: true,
        // },
      ],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      curly: ['error', 'all'],
      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],
      'default-case': 'error',

      'no-throw-literal': 'error',

      'no-eval': 'error',
      'no-with': 'error',
      'no-debugger': 'error',
      'no-new-wrappers': 'error',
      'new-cap': [
        'error',
        {
          newIsCap: true,
          capIsNew: false,
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: [
            'class',
            'interface',
            'typeAlias',
            'enum',
            'typeParameter',
          ],
          format: ['PascalCase'],
        },
        {
          selector: ['variable', 'function', 'method', 'parameter', 'property'],
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          modifiers: ['const', 'global'],
          format: ['UPPER_CASE', 'camelCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]);
