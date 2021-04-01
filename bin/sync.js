import { Client } from 'discord.js';
import { join } from 'path';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Root commands folder
const COMMANDS_FOLDER = join(__dirname, '../src/commands');

// Sync arguments
const FLAGS = process.argv.slice(2);
const TOKEN = process.env.TOKEN;
const GUILD = process.env.GUILD;

// Authenticate
const bot = new Client();
bot.login(TOKEN);

// Handle bot connection
bot.on('ready', async () => {
  try {
    // Auth remote application
    const remote = () =>
      GUILD
        ? bot.api.applications(bot.user.id).guilds(GUILD)
        : bot.api.applications(bot.user.id);

    // Begin sync
    const commands = readdirSync(COMMANDS_FOLDER).map(
      file => require(join(COMMANDS_FOLDER, file)).default
    );
    const cache = await remote().commands.get();

    // Update remote
    const updateRemote = async () =>
      await Promise.all(
        commands.map(async command => {
          // Exclude private props
          const { name, description, options } = command;
          const data = { name, description, options };

          // Update remote
          await remote().commands.post({ data });
        })
      );

    // Clear remote
    const clearRemote = async () =>
      await Promise.all(
        cache.map(async command => {
          await remote().commands(command.id).delete();

          return command;
        })
      );

    if (FLAGS.includes('--clear')) return await clearRemote();

    await clearRemote();
    await updateRemote();
  } catch (error) {
    console.error(error);
  }

  // Cleanup
  bot.destroy();
});
