import config from '../config';

const message = (client, msg) => {
  if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;

  const args = msg.content.substring(config.prefix.length).split(' ');
  const name = args.shift().toLowerCase();
  const command = client.commands.get(name);
  if (!command) return;

  command.execute({ client, msg, args });
};

export default message;
