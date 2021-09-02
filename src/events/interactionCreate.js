import chalk from 'chalk';
import { sanitize, validateMessage, registerComponents } from 'utils/discord';

/**
 * Handles interaction events.
 */
const InteractionEvent = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    try {
      switch (interaction.type) {
        // Command interactions
        case 'APPLICATION_COMMAND': {
          const { commandName, options } = interaction;

          const command = client.commands.get(commandName);
          if (!command) return;

          const output = await command.execute({
            ...client,
            options: options?.data?.map(({ value }) => sanitize(value)),
          });
          if (!output) return;

          const data = validateMessage(output);
          await interaction.reply(data);
          if (!data.components) return;

          const message = await client.api
            .webhooks(client.user.id, interaction.token)
            .messages('@original')
            .get();

          return registerComponents(client, message.id, data.components);
        }
        // Button interactions
        case 'MESSAGE_COMPONENT': {
          const listenerId = `${interaction.message.id}-${interaction.customId}`;

          const callback = client.listeners.get(listenerId);
          if (!callback) return;

          const output = await callback(interaction);
          if (!output) return;

          const data = validateMessage(output);
          return await interaction.update(data);
        }
        default:
          return;
      }
    } catch (error) {
      console.error(chalk.red(`interactionCreate >> ${error.stack}`));
    }
  },
};

export default InteractionEvent;
