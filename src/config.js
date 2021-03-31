import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  docs: {
    url: process.env.DOCS_URL || 'https://threejs.org/docs/index.html#',
    list: process.env.DOCS_LIST || 'https://threejs.org/docs/list.json',
  },
  examples: {
    url: process.env.EXAMPLES_URL || 'https://threejs.org/examples/',
    list: process.env.EXAMPLES_LIST || 'https://threejs.org/examples/files.json',
    tags: process.env.EXAMPLES_TAGS || 'https://threejs.org/examples/tags.json',
  },
  github: process.env.GITHUB || 'https://github.com/threejs/discord-bot',
  icon:
    process.env.ICON ||
    'https://github.com/mrdoob/three.js/blob/master/icon.png?raw=true',
  color: process.env.COLOR || 0x049ef4,
  prefix: process.env.PREFIX || '!',
  locale: process.env.LOCALE || 'en',
  port: process.env.PORT || 8080,
  key: process.env.KEY,
  env: process.env.NODE_ENV,
};

export default config;
