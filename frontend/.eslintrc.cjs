module.exports = {
  overrides: [
    {
      files: ['app/**/*.{cjs,js}'],
      extends: ['next'],
      settings: {
        next: {
          rootDir: 'packages/frontend',
        },
      },
    },
  ],
};
