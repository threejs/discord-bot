import chalk from 'chalk';
import { embed } from 'utils';
import config from 'config';

const Help = {
  name: 'help',
  description: "Displays this bot's commands.",
  execute({ client, msg }) {
    try {
      return msg.channel.send(
        embed({
          title: 'Commands',
          fields: client.commands.map(({ name, args, description }) => ({
            name: `${config.prefix}${name}${args ? args.map(arg => ` \`${arg}\``) : ''}`,
            value: description,
          })),
        })
      );
    } catch (error) {
      console.error(chalk.red(`${config.prefix}help >> ${error.stack}`));
    }
  },
};

export default Help;
