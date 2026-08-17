// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.angular/**',
    'dist/**',
    // Design references, not application sources — see SPEC §6.
    'design_handoff_website_redesign/**',
    // Not an Angular template: `prefer-self-closing-tags` would rewrite
    // <bfs-root></bfs-root> to <bfs-root />, which the HTML parser mis-nests.
    'projects/website/src/index.html',
  ]),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'bfs', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'bfs', style: 'camelCase' },
      ],
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-arrow-callback': 'error',
      curly: 'error',
      'no-redeclare': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'warn',
    },
  },
  {
    // Only the correctness rule. The plugin's recommended/stylistic presets add
    // enforce-consistent-class-order, which fights prettier-plugin-tailwindcss.
    files: ['**/*.html', '**/*.ts'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': {
        // Tailwind v4 has no config file; the entry point is how the plugin learns the theme.
        entryPoint: 'projects/website/src/styles.css',
      },
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]);
