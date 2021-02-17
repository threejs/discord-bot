import chalk from 'chalk';
import config from '../config';

const ready = async client => {
  try {
    client.user.setActivity(`${config.prefix}help`, { type: 'LISTENING' });
    console.info(`${chalk.cyanBright('[Bot]')} connected as ${client.user.tag}`);

    if (config.env === 'production') await client.user.setAvatar(config.icon);
  } catch (error) {
    console.warn(chalk.yellow(`ready >> ${error.message}`));
  }
};

export default ready;
