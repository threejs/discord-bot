import chalk from 'chalk';
import { sanitize, validateMessage } from 'utils/discord';

/**
 * Handles interaction events.
 */
const InteractionEvent = {
  name: 'interaction',
  async execute(client, interaction) {
    try {
      if (!interaction.isCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const output = await command.execute({
        ...client,
        options: interaction.options?.map(({ value }) => sanitize(value)),
      });
      if (!output) return;

      const message = validateMessage(output);
      return interaction.reply(message);
    } catch (error) {
      console.error(chalk.red(`interaction >> ${error.stack}`));
    }
  },
};

export default InteractionEvent;
