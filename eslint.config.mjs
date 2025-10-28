import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

// Common rules for all JavaScript files
const commonRules = {
  ...js.configs.recommended.rules,
  'semi': 'error',
  'indent': ['error', 2],
  'no-multi-spaces': 'error',
  'space-in-parens': 'error',
  'no-multiple-empty-lines': 'error',
  'prefer-const': 'error',
  'no-use-before-define': 'error',
  'no-console': 'error',
  'curly': 'error',
  'no-undef-init': 'error',
  'init-declarations': ['error', 'always'],
  'quotes': ['error', 'backtick']
};

// Import plugin rules
const importRules = {
  'import/no-unresolved': 'error',
  'import/named': 'error',
  'import/default': 'error',
  'import/namespace': 'error'
};

export default [
  // Global ignores
  {
    ignores: [
      'jest.config.js',
      'coverage/',
      'node_modules/',
      'dist/',
      'build/'
    ]
  },
  
  // Configuration for ES modules (frontend files)
  {
    files: [
      'js/widget.js',
      'js/util.js',
      'js/settings.js',
      'js/backend.js',
      'js/translator.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        XMLHttpRequest: 'readonly',
        URL: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        RegExp: 'readonly',
        // Browser globals
        FormData: 'readonly'
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      ...commonRules,
      ...importRules
    }
  },
  
  // Configuration for CommonJS modules (Node.js files)
  {
    files: [
      'build/version-update.js',
      'build/version-check.js',
      'build/notarize.js',
      'js/auto-update.js',
      'js/logger.js',
      'js/preload.js',
      'main.js',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      ...commonRules,
      ...importRules
    }
  },
  
  // Configuration for test files (Jest)
  {
    files: ['test/**/*.js', 'test/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Jest test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Browser globals for tests
        FormData: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    },
    rules: {
      ...commonRules,
      // Simplified rules for test files
      'no-console': 'warn', // Allow console in tests
      'init-declarations': 'off' // Relaxed for tests
    }
  }
];
