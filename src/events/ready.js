import chalk from 'chalk';
import config from '../config';

const ready = client => {
  client.user.setActivity(`${config.prefix}help`, { type: 'LISTENING' });

  console.info(`${chalk.cyanBright('[Bot]')} connected as ${client.user.tag}`);
};

export default ready;
