import chalk from 'chalk';
import fetch from 'node-fetch';
import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { getRevision, loadDocs, loadExamples } from 'utils/three';
import { validateCommand } from 'utils/discord';
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
    const revision = await getRevision();

    // Compare local revision
    if (revision !== this.revision) {
      this.revision = revision;

      this.user?.setPresence({
        status: 'online',
        activities: [
          {
            name: `three.js - r${revision}`,
            type: 'PLAYING',
          },
        ],
      });

      this.docs = await loadDocs();
      console.info(
        `${chalk.cyanBright('[Bot]')} ${[...this.docs.keys()].length} docs loaded`
      );

      this.examples = await loadExamples();
      console.info(
        `${chalk.cyanBright('[Bot]')} ${[...this.examples.keys()].length} examples loaded`
      );
    }
  }

  /**
   * Loads and registers interactions with Discord remote
   */
  async loadInteractions() {
    try {
      const url = config.guild
        ? `/applications/${this.user.id}/guilds/${config.guild}/commands`
        : `/applications/${this.user.id}/commands`;

      await fetch(`https://discord.com/api/v9${url}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${config.token}`,
          'User-Agent': 'Three.js Discord Bot',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.commands.map(validateCommand)),
      });

      console.info(`${chalk.cyanBright('[Bot]')} loaded interactions`);
    } catch (error) {
      console.error(chalk.red(`bot#loadInteractions >> ${error.stack}`));
    }
  }

  /**
   * Loads and starts up the bot.
   */
  async start() {
    try {
      this.loadEvents();
      this.loadCommands();

      if (process.env.NODE_ENV !== 'test') {
        await this.login(config.token);
        await this.loadInteractions();

        this.listeners = new Collection();
      }

      const syncThree = async () => {
        await this.loadThree();

        setTimeout(syncThree, config.ttl);
      };
      await syncThree();
    } catch (error) {
      console.error(chalk.red(`bot#start >> ${error.message}`));
    }
  }
}

export default Bot;
