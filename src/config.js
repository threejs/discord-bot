import dotenv from 'dotenv';

dotenv.config();

const config = {
  color: process.env.COLOR || 0x049ef4,
  apiEndpoint: process.env.APIENDPOINT || 'https://threejs.org/docs/index.html#',
  docsEndpoint: process.env.DOCSENDPOINT || 'https://threejs.org/docs/list.json',
  prefix: process.env.PREFIX || '!',
  token: process.env.TOKEN,
};

export default config;
