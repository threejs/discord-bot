import chalk from 'chalk';
import config from 'config';
import { sanitize, validateMessage, registerComponents } from 'utils/discord';

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

      const data = validateMessage(output);
      const message = await client.api.channels(msg.channel.id).messages.post({ data });

      if (data.components) registerComponents(client, message.id, data.components);
    } catch (error) {
      console.error(chalk.red(`message >> ${error.stack}`));
    }
  },
};

export default MessageEvent;
