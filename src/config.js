import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  apiEndpoint: process.env.APIENDPOINT || 'https://threejs.org/docs/index.html#',
  docsEndpoint: process.env.DOCSENDPOINT || 'https://threejs.org/docs/list.json',
  color: process.env.COLOR || 0x049ef4,
  prefix: process.env.PREFIX || '?',
  token: process.env.TOKEN,
};

export default config;
