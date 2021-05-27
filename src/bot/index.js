import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { loadDocs, loadExamples } from 'utils/three';
import { CLIENT_INTENTS } from 'constants';
import config from 'config';

/**
 * An extended `Client` to support slash-command interactions and events.
 */
class Bot extends Client {
  constructor({ ...rest }) {
    super({ intents: CLIENT_INTENTS, ...rest });
  }

  /**
   * Loads and registers events from the events folder.
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
   * Loads and registers commands from the commands folder.
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
   * Loads and generates three.js docs and examples
   */
  async loadThree() {
    this.docs = await loadDocs();
    console.info(`${chalk.cyanBright('[Bot]')} ${this.docs.array().length} docs loaded`);

    this.examples = await loadExamples();
    console.info(
      `${chalk.cyanBright('[Bot]')} ${this.examples.array().length} examples loaded`
    );
  }

  /**
   * Loads and registers interactions with Discord remote
   */
  async loadInteractions() {
    const remote = config.guild ? this.guilds.cache.get(config.guild) : this.application;

    await remote.commands.set(this.commands.array());

    console.info(
      `${chalk.cyanBright('[Bot]')} ${this.commands.array().length} interactions loaded`
    );
  }

  /**
   * Loads and starts up the bot.
   */
  async start() {
    try {
      this.loadEvents();
      this.loadCommands();

      await this.loadThree();

      if (process.env.NODE_ENV !== 'test') {
        await this.login(config.token);
        await this.loadInteractions();
      }
    } catch (error) {
      console.error(chalk.red(`bot#start >> ${error.message}`));
    }
  }
}

export default Bot;
