import chalk from 'chalk';
import Bot from 'bot';
import { embed } from 'utils/embed';

const Help = {
  name: 'help',
  description: "Displays this bot's commands.",
  execute({ client }) {
    try {
      const commands = client.commands || Bot.loadCommands();

      return embed({
        title: 'Commands',
        fields: commands.map(({ name, options, description }) => ({
          name: `/${name}${options ? options.map(({ name }) => ` \`${name}\``) : ''}`,
          value: description,
        })),
      });
    } catch (error) {
      console.error(chalk.red(`/help >> ${error.stack}`));
    }
  },
};

export default Help;
