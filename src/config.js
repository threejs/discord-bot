import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  guild: process.env.GUILD,
  token: process.env.TOKEN,
};

export default config;
