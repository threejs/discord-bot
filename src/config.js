import dotenv from 'dotenv';

dotenv.config();

/**
 * Bot config vars
 */
const config = {
  apiEndpoint: process.env.APIENDPOINT || 'https://threejs.org/docs/index.html#',
  docsEndpoint: process.env.DOCSENDPOINT || 'https://threejs.org/docs/list.json',
  icon:
    process.env.ICON ||
    'https://rawcdn.githack.com/mrdoob/three.js/dc2b340839e0fb1cf810a08dfbccf534121606b8/icon.png',
  color: process.env.COLOR || 0x049ef4,
  prefix: process.env.PREFIX || '!',
  token: process.env.TOKEN,
};

export default config;
