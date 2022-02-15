module.exports = {
  env: {
    'vue/setup-compiler-macros': true,
  },
  ignorePatterns: [
    '*.config.*',
    '.eslintrc.js',
    'components.d.ts',
    'dist/**',
  ],
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'prettier',
    'airbnb-base',
    "plugin:@typescript-eslint/recommended",
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2022,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-plusplus': 0,
    'no-bitwise': 0,
    'no-nested-ternary': 0,
    'no-underscore-dangle': 0,
    'no-restricted-globals': 0,

    'max-len': 0,
    'prefer-destructuring': 0, // Conflicts with prohibit of props destructuring

    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,

    // Troubleshoot for typescript enums
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': ["error"],
    '@typescript-eslint/ban-ts-comment': 1,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-empty-function': 0,

    'vue/multi-word-component-names': 0, // Allow unconventional names in "pages"
    'vue/component-api-style': 2, // Allow only script-setup style
  },
};
