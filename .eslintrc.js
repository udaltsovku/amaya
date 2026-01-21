// .eslintrc.js 
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:nuxt/recommended",
    "plugin:vue/vue3-recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/html-closing-bracket-newline": "off",
    "vue/no-setup-props-destructure": "off",
    "vue/max-attributes-per-line": ['warn', {
      'singleline': 3,
    }],
    "vue/html-self-closing": "off",
    "@typescript-eslint/ban-ts-comment": "off",
  },
};