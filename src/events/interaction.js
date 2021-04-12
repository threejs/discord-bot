import chalk from 'chalk';
import { validateMessage } from 'utils/discord';

/**
 * Handles interaction events.
 */
const Interaction = {
  name: 'interaction',
  async execute(client, interaction) {
    try {
      if (!interaction.isCommand()) return;

      const { commandName, options } = interaction;

      const command = client.commands.get(commandName);
      if (!command) return;

      const output = await command.execute({
        client,
        options: options?.map(({ value }) => value),
      });
      if (!output) return;

      return interaction.channel.send(validateMessage(output));
    } catch (error) {
      console.error(chalk.red(`interaction >> ${error.stack}`));
    }
  },
};

export default Interaction;
