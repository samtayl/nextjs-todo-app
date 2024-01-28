module.exports = {
  root: true,
  extends: [
    '@samtayl',
    '@samtayl/import',
    '@samtayl/node',
  ],
  env: {
    es2024: true,
  },
  parserOptions: {
    ecmaVersion: '2024',
    sourceType: 'module',
  },
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: [
          'modules',
          'dynamicImport',
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        'node/no-unsupported-features/es-syntax': [
          'error',
          {
            ignores: [],
          },
        ],
      },
    },
  ],
};
