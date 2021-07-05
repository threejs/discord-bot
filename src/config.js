import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  ttl: process.env.TTL || 60 * 60 * 1000,
  prefix: process.env.PREFIX || '!',
  guild: process.env.GUILD,
  token: process.env.TOKEN,
};

export default config;
