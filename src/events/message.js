import chalk from 'chalk';
import config from 'config';
import { sanitize } from 'utils/discord';

/**
 * Handles Discord message events.
 *
 * @param client Discord client context.
 * @param msg Discord message context.
 */
const message = async (client, msg) => {
  try {
    if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

    const input = sanitize(msg.content);

    const args = input.substring(config.prefix.length).split(' ');
    const name = args.shift().toLowerCase();
    const command = client.commands.get(name);
    if (!command) return;

    const query = args.join(' ');
    const options = { client, query };

    const output = await command.execute(options);
    await msg.channel.send(output);

    return msg;
  } catch (error) {
    console.warn(chalk.yellow(`message >> ${error.message}`));
  }
};

export default message;
