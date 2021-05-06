import chalk from 'chalk';
import config from 'config';
import { sanitize, validateMessage } from 'utils/discord';
import { INTERACTION_RESPONSE_FLAGS, INTERACTION_TIMEOUT } from 'constants';

/**
 * Handles Discord message events.
 */
const MessageEvent = {
  name: 'message',
  async execute(client, msg) {
    try {
      if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

      const input = sanitize(msg.content);

      const options = input.substring(config.prefix.length).split(' ');
      const name = options.shift().toLowerCase();
      const command = client.commands.get(name);
      if (!command) return;

      const output = await command.execute({ ...client, options });
      if (!output) return;

      const message = validateMessage(output);
      const response = await msg.channel.send(message);

      if (message.flags === INTERACTION_RESPONSE_FLAGS.EPHEMERAL) {
        response.delete({ timeout: INTERACTION_TIMEOUT });
      }

      return response;
    } catch (error) {
      console.error(chalk.red(`message >> ${error.stack}`));
    }
  },
};

export default MessageEvent;
