import env from '../../env.native';

class Config {
  // @ts-ignore - Parameter type requires TypeScript annotation
  get(key) {
    return env[key];
  }
}

const config = new Config();
export default config;
