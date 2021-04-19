import chalk from 'chalk';
import config from 'config';
import { sanitize, validateMessage } from 'utils/discord';

// Duration to persist ephemeral messages.
const EPHEMERAL_DURATION = 6000;

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

      const message = await msg.channel.send(validateMessage(output));

      // Expire ephemeral responses
      if (output?.ephemeral) message.delete({ timeout: EPHEMERAL_DURATION });

      return message;
    } catch (error) {
      console.error(chalk.red(`message >> ${error.stack}`));
    }
  },
};

export default MessageEvent;
