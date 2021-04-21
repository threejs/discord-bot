import chalk from 'chalk';

/**
 * Handles the bot's ready state.
 */
const ReadyEvent = {
  name: 'ready',
  execute(client) {
    console.info(`${chalk.cyanBright('[Bot]')} connected as ${client.user.tag}`);
  },
};

export default ReadyEvent;
