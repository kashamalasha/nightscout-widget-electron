module.exports = {
  overrides: [
    {
      files: [
        "js/widget.js",
        "js/util.js",
        "js/settings.js",
        "js/backend.js",
        "js/translator.js",
        "test/util.test.js",
      ],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      ecmaFeatures: {
        impliedStrict: true,
      },
      env: {
        browser: true,
        es2022: true,
        jest: true,
      },
      extends: ["eslint:recommended"],
      rules: {
        semi: "error",
        indent: ["error", 2],
        "no-multi-spaces": "error",
        "space-in-parens": "error",
        "no-multiple-empty-lines": "error",
        "prefer-const": "error",
        "no-use-before-define": "error",
        "no-console": "error",
        curly: "error",
        "no-undef-init": "error",
        "init-declarations": ["error", "always"],
        quotes: ["error", "backtick"],
      },
    },
    {
      files: [
        "build/version-update.js",
        "build/version-check.js",
        "build/notarize.js",
        "js/auto-update.js",
        "js/logger.js",
        "js/preload.js",
        "main.js",
      ],
      parserOptions: {
        ecmaVersion: 2022,
      },
      ecmaFeatures: {
        impliedStrict: true,
      },
      env: {
        browser: true,
        node: true,
        es2022: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
      ],
      rules: {
        semi: "error",
        indent: ["error", 2],
        "no-multi-spaces": "error",
        "space-in-parens": "error",
        "no-multiple-empty-lines": "error",
        "prefer-const": "error",
        "no-use-before-define": "error",
        "no-console": "error",
        curly: "error",
        "no-undef-init": "error",
        "init-declarations": ["error", "always"],
        quotes: ["error", "backtick"],
      },
    },
  ],
};
