import jsdoc from "eslint-plugin-jsdoc";

export default [
  {
    files: ["iteration-*/**/*.js"],
    plugins: { jsdoc },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "jsdoc/require-jsdoc": ["warn", {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ArrowFunctionExpression: false,
        },
      }],
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-type": "warn",
      "jsdoc/check-types": "warn",
    },
  },
];
