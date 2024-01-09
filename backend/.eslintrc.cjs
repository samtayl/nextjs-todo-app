module.exports = {
  overrides: [
    {
      files: ['**/test/**/*.js'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
  ],
};
