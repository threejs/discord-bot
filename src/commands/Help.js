import chalk from 'chalk';

const Help = {
  name: 'help',
  description: "Displays this bot's commands.",
  execute({ client }) {
    try {
      return {
        title: 'Commands',
        fields: client.commands.map(({ name, options, description }) => ({
          name: `/${name}${options?.map(({ name }) => ` \`${name}\``) || ''}`,
          value: description,
        })),
      };
    } catch (error) {
      console.error(chalk.red(`/help >> ${error.stack}`));
    }
  },
};

export default Help;
