import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  prefix: process.env.PREFIX || '!',
  guild: process.env.GUILD,
  token: process.env.TOKEN,
};

export default config;
