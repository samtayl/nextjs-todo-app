module.exports = {
  overrides: [
    {
      files: ['**/test/**/*.cjs'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
};
