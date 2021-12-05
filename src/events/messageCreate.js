import chalk from 'chalk';
import { sanitize, validateMessage, registerComponents } from '../utils/discord';
import config from '../config';

/**
 * Handles Discord message events.
 */
const MessageEvent = {
  name: 'messageCreate',
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
      const message = await msg.channel.send(data);
      if (!data.components) return;

      return registerComponents(client, message.id, data.components);
    } catch (error) {
      console.error(chalk.red(`messageCreate >> ${error.stack}`));
    }
  },
};

export default MessageEvent;
