import chalk from 'chalk';
import config from '../config';
import { embed } from '../utils';

const Uptime = {
  name: 'uptime',
  description: "Displays this bot's current uptime.",
  execute({ client, msg }) {
    try {
      let totalSeconds = client.uptime / 1000;

      const days = Math.floor(totalSeconds / 86400).toFixed(0);
      const hours = Math.floor(totalSeconds / 3600).toFixed(0);

      totalSeconds %= 3600;

      const minutes = Math.floor(totalSeconds / 60).toFixed(0);
      const seconds = (totalSeconds % 60).toFixed(0);

      return msg.channel.send(
        embed({
          title: 'Uptime',
          description: `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`,
          footer: {
            text: '!uptime',
          },
        })
      );
    } catch (error) {
      console.error(chalk.red(`${config.prefix}uptime >> ${error.stack}`));
    }
  },
};

export default Uptime;
