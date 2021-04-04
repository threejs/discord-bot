import chalk from 'chalk';
import config from 'config';
import { sanitize, validateMessage } from 'utils/discord';

/**
 * Handles Discord message events.
 */
const MessageEvent = {
  name: 'message',
  async execute(client, msg) {
    try {
      if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

      const input = sanitize(msg.content);

      const args = input.substring(config.prefix.length).split(' ');
      const name = args.shift().toLowerCase();
      const command = client.commands.get(name);
      if (!command) return;

      const output = await command.execute({ client, args });
      if (!output) return;

      return msg.channel.send(validateMessage(output));
    } catch (error) {
      console.error(chalk.red(`message >> ${error.stack}`));
    }
  },
};

export default MessageEvent;
