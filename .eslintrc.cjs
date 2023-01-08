module.exports = {
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "prettier"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: false,
    },
  },
  plugins: ["prettier"],
  rules: {
    "vue/no-v-html": 0,
    "prettier/prettier": "error",
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
};
