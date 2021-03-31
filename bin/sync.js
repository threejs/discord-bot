const { Client } = require('discord.js');
const { join } = require('path');
const { readdirSync } = require('fs');

const COMMANDS_FOLDER = join(__dirname, '../src/commands');

const bot = new Client();
bot.login(process.env.TOKEN || process.argv[2]);

bot.on('ready', async () => {
  // Auth remote application
  const remote = await bot.api.applications(bot.user.id);

  // Begin sync
  const commands = readdirSync(COMMANDS_FOLDER).map(
    file => require(join(COMMANDS_FOLDER, file)).default
  );
  const cache = await remote.commands.get();

  // Update remote commands
  for (const command in commands) {
    const previous = cache.find(({ name }) => name === command.name);

    // Exclude private props
    const { title, description, options } = command;
    const data = { title, description, options };

    // Update remote
    if (previous.id) {
      await remote.commands(previous.id).patch({ data });
    } else {
      await remote.commands.post({ data });
    }
  }

  // Cleanup cache
  for (const command in cache) {
    const exists = commands.find(({ name }) => name === command.name);

    if (!exists) await remote.commands(command.id).delete();
  }

  return bot.destroy();
});
