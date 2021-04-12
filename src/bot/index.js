import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import config from 'config';

/**
 * An extended `Client` to support slash-command interactions and events.
 */
class Bot extends Client {
  /**
   * Loads and registers `Client` events from the events folder
   */
  loadEvents() {
    if (!this.events) this.events = new Collection();

    const files = readdirSync(resolve(__dirname, '../events'));

    for (const file of files) {
      const event = require(resolve(__dirname, '../events', file)).default;

      this.on(event.name, (...args) => event.execute(this, ...args));

      this.events.set(event.name, event);
    }

    console.info(`${chalk.cyanBright('[Bot]')} ${files.length} events loaded`);

    return this.events;
  }

  /**
   * Loads and registers interaction commands from the commands folder
   */
  loadCommands() {
    if (!this.commands) this.commands = new Collection();

    const files = readdirSync(resolve(__dirname, '../commands'));

    for (const file of files) {
      const command = require(resolve(__dirname, '../commands', file)).default;

      this.commands.set(command.name, command);
    }

    console.info(`${chalk.cyanBright('[Bot]')} ${files.length} commands loaded`);

    return this.commands;
  }

  /**
   * Updates slash commands with Discord.
   */
  async updateCommands() {
    // Update remote
    await Promise.all(
      this.commands.map(({ name, description, options }) =>
        this.application.commands.create({ name, description, options })
      )
    );

    console.info(`${chalk.cyanBright('[Bot]')} updated slash commands`);
  }

  /**
   * Loads and starts up the bot.
   */
  async start() {
    try {
      this.loadEvents();
      this.loadCommands();

      await this.login(config.token);
      await this.updateCommands();
    } catch (error) {
      console.error(chalk.red(`bot#start >> ${error.message}`));
    }
  }
}

export default Bot;
