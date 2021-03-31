import chalk from 'chalk';
import config from 'config';

/**
 * Handles the bot's ready state.
 *
 * @param client Discord client context.
 */
const ready = client => {
  try {
    client.user.setActivity(`${config.prefix}help`, { type: 'LISTENING' });
    console.info(`${chalk.cyanBright('[Bot]')} connected as ${client.user.tag}`);

    if (config.env === 'production') {
      client.user.setAvatar(config.icon);
    }
  } catch (error) {
    console.warn(chalk.yellow(`ready >> ${error.message}`));
  }
};

export default ready;
