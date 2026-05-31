import type { Config } from 'jest';

const config: Config = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@rnmapbox/maps$': '<rootDir>/../src/index.ts',
  },
};

export default config;
