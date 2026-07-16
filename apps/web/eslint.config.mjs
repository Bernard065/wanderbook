import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Workaround for nrwl/nx#33989 (Nx 22+/@nx/vitest bug):
      // non-buildable libs with a Vitest test target get misclassified
      // as "buildable", incorrectly flagging their import into apps
      // like this one. Safe to disable until upstream is fixed.
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
