import chalk from 'chalk';

/**
 * Handles the bot's ready state.
 */
const ReadyEvent = {
  name: 'ready',
  execute(client) {
    try {
      console.info(`${chalk.cyanBright('[Bot]')} connected as ${client.user.tag}`);
    } catch (error) {
      console.warn(chalk.yellow(`ready >> ${error.stack}`));
    }
  },
};

export default ReadyEvent;
