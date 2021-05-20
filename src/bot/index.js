import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { loadDocs, loadExamples } from 'utils/three';
import { INTENTS_DEFAULTS } from 'constants';
import config from 'config';

/**
 * An extended `Client` to support slash-command interactions and events.
 */
class Bot extends Client {
  constructor({ intents, ...rest }) {
    super({ intents: [...INTENTS_DEFAULTS, ...intents], ...rest });
  }

  /**
   * Loads and registers `Client` events from the events folder.
   */
  loadEvents() {
    if (!this.events) this.events = new Collection();

    try {
      const files = readdirSync(resolve(__dirname, '../events'));

      for (const file of files) {
        const event = require(resolve(__dirname, '../events', file)).default;

        this.on(event.name, (...args) => event.execute(this, ...args));

        this.events.set(event.name, event);
      }

      console.info(`${chalk.cyanBright('[Bot]')} ${files.length} events loaded`);

      return this.events;
    } catch (error) {
      console.error(chalk.red(`bot#loadEvents >> ${error.stack}`));
    }
  }

  /**
   * Loads and registers interaction commands from the commands folder.
   */
  loadCommands() {
    if (!this.commands) this.commands = new Collection();

    try {
      const files = readdirSync(resolve(__dirname, '../commands'));

      for (const file of files) {
        const command = require(resolve(__dirname, '../commands', file)).default;

        this.commands.set(command.name, command);
      }

      console.info(`${chalk.cyanBright('[Bot]')} ${files.length} commands loaded`);

      return this.commands;
    } catch (error) {
      console.error(chalk.red(`bot#loadCommands >> ${error.stack}`));
    }
  }

  /**
   * Loads and starts up the bot.
   */
  async start() {
    try {
      this.loadEvents();
      this.loadCommands();

      this.docs = await loadDocs();
      this.examples = await loadExamples();

      if (process.env.NODE_ENV !== 'test') {
        await this.login(config.token);

        const { commands } = config.guild
          ? this.guilds.cache.get(config.guild)
          : this.application;

        await commands.set(this.commands.array());
      }
    } catch (error) {
      console.error(chalk.red(`bot#start >> ${error.message}`));
    }
  }
}

export default Bot;
