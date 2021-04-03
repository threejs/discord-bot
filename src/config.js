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
  icon:
    process.env.ICON ||
    'https://github.com/mrdoob/three.js/blob/master/icon.png?raw=true',
  github: process.env.GITHUB || 'https://github.com/threejs/discord-bot',
  locale: process.env.LOCALE || 'en',
  prefix: process.env.PREFIX || '!',
  guild: process.env.GUILD,
  clientID: process.env.CLIENTID,
  token: process.env.TOKEN,
  env: process.env.NODE_ENV,
};

export default config;
