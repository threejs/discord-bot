import chalk from 'chalk';

const Help = {
  name: 'help',
  description: "Displays this bot's commands.",
  execute({ commands }) {
    try {
      const commandList = commands.reduce((list, { name, options, description }) => {
        const args = options?.map(({ name }) => ` \`${name}\``) || '';

        list += `\n**/${name}**${args} - ${description}`;

        return list;
      }, '');

      return {
        content: `**Commands**:\n${commandList}`,
        ephemeral: true,
      };
    } catch (error) {
      console.error(chalk.red(`/help >> ${error.stack}`));
    }
  },
};

export default Help;
