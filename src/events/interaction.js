import chalk from 'chalk';
import { sanitize, validateMessage } from 'utils/discord';
import { INTERACTION_RESPONSE_TYPE } from 'constants';

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

      const data = validateMessage(output);
      return client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data,
        },
      });
    } catch (error) {
      console.error(chalk.red(`interaction >> ${error.stack}`));
    }
  },
};

export default InteractionEvent;
