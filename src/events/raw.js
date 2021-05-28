import chalk from 'chalk';
import { sanitize, validateMessage, registerButtons } from 'utils/discord';
import { INTERACTION_TYPE, INTERACTION_RESPONSE_TYPE } from 'constants';

/**
 * Handles interaction events.
 */
const RawEvent = {
  name: 'raw',
  async execute(client, packet) {
    try {
      if (packet.t !== 'INTERACTION_CREATE') return;

      const interaction = packet.d;
      const { type } = interaction;

      switch (type) {
        // Command interactions
        case INTERACTION_TYPE.APPLICATION_COMMAND: {
          const { name, options } = interaction.data;

          const command = client.commands.get(name);
          if (!command) return;

          const output = await command.execute({
            ...client,
            options: options?.map(({ value }) => sanitize(value)),
          });
          if (!output) return;

          const data = validateMessage(output);
          const message = await client.api
            .interactions(interaction.id, interaction.token)
            .callback.post({
              data: {
                type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
                data,
              },
            });

          if (output.buttons) registerButtons(client, message, output.buttons);

          return;
        }
        // Button interactions
        case INTERACTION_TYPE.BUTTON: {
          const listenerId = `${interaction.message.id}-${interaction.data.custom_id}`;

          const callback = client.listeners.get(listenerId);
          if (!callback) return;

          client.listeners.delete(listenerId);

          return callback(interaction);
        }
        default:
          return;
      }
    } catch (error) {
      console.error(chalk.red(`raw >> ${error.stack}`));
    }
  },
};

export default RawEvent;
