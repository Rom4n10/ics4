import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    // Scripts clásicos del navegador: comparten globals entre archivos
    // (AppState, ModalManager, Toast, etc.), por eso no-undef y no-unused-vars
    // no aplican a nivel de archivo.
    files: ['js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: globals.browser,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['tests/**/*.js', 'testunitarios/**/*.js', 'vitest.config.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser, ...globals.vitest },
    },
  },
];
