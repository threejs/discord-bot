import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  icon:
    process.env.ICON ||
    'https://github.com/mrdoob/three.js/blob/master/icon.png?raw=true',
  github: process.env.GITHUB || 'https://github.com/threejs/discord-bot',
  locale: process.env.LOCALE || 'en',
  prefix: process.env.PREFIX || '!',
  guild: process.env.GUILD,
  token: process.env.TOKEN,
  env: process.env.NODE_ENV,
};

export default config;
