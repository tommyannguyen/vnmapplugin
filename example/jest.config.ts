import type { Config } from 'jest';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Config = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@rnmapbox/maps$': path.resolve(__dirname, '../src/index.ts'),
  },
};

export default config;
