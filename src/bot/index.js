import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import fetch from 'node-fetch';
import { validateMessage, validateCommand } from 'utils/discord';
import { INTERACTION_RESPONSE_TYPE, THREE } from 'constants';
import config from 'config';

/**
 * An extended `Client` to support slash-command interactions and events.
 */
class Bot extends Client {
  /**
   * Sends a message over an interaction endpoint.
   */
  async send(interaction, message) {
    const { name, options } = interaction.data;

    try {
      const response = await this.api
        .interactions(interaction.id, interaction.token)
        .callback.post({
          data: {
            type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
            data: validateMessage(message),
          },
        });

      return response;
    } catch (error) {
      console.error(
        chalk.red(
          `bot#send ${name}${
            options?.length ? ` ${options.map(({ value }) => value)}` : ''
          } >> ${error.stack}`
        )
      );
    }
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
   * Updates slash commands with Discord.
   */
  async updateCommands() {
    try {
      // Get remote target
      const remote = () =>
        config.guild
          ? this.api.applications(this.user.id).guilds(config.guild)
          : this.api.applications(this.user.id);

      // Get remote cache
      const cache = await remote().commands.get();

      // Update remote
      await Promise.all(
        this.commands.map(async command => {
          // Validate command props
          const data = validateCommand(command);

          // Check for cache
          const cached = cache?.find(({ name }) => name === command.name);

          // Create if no remote
          if (!cached?.id) return await remote().commands.post({ data });

          // Check if updated
          const needsUpdate =
            data.title !== cached.title ||
            data.description !== cached.description ||
            data.options?.length !== cached.options?.length ||
            data.options?.some(
              (option, index) =>
                JSON.stringify(option) !== JSON.stringify(cached.options[index])
            );
          if (needsUpdate) return await remote().commands(cached.id).patch({ data });
        })
      );

      // Cleanup cache
      await Promise.all(
        cache.map(async command => {
          const exists = this.commands.get(command.name);

          if (!exists) {
            await remote().commands(command.id).delete();
          }
        })
      );

      console.info(`${chalk.cyanBright('[Bot]')} updated slash commands`);
    } catch (error) {
      console.error(chalk.red(`bot#updateCommands >> ${error.stack}`));
    }
  }

  /**
   * Fetches and loads three.js documentation.
   */
  async loadDocs() {
    try {
      const json = await fetch(THREE.DOCS_LIST).then(res => res.json());

      const endpoints = Object.assign(
        {},
        ...(function _flatten(root) {
          return [].concat(
            ...Object.keys(root).map(key =>
              typeof root[key] === 'object' ? _flatten(root[key]) : { [key]: root[key] }
            )
          );
        })(json[THREE.LOCALE])
      );
      const docs = Object.keys(endpoints).map(key => ({
        name: key,
        url: `${THREE.DOCS_URL}${endpoints[key]}`,
      }));

      console.info(`${chalk.cyanBright('[Bot]')} ${docs.length} docs loaded`);

      return (this.docs = docs);
    } catch (error) {
      console.error(chalk.red(`bot#loadDocs >> ${error.stack}`));
    }
  }

  /**
   * Fetches and loads three.js examples.
   */
  async loadExamples() {
    try {
      const json = await fetch(THREE.EXAMPLES_LIST).then(res => res.json());
      const tags = await fetch(THREE.EXAMPLES_TAGS).then(res => res.json());

      const examples = Object.keys(json).reduce((results, group) => {
        const items = json[group].map(key => ({
          name: key,
          url: `${THREE.EXAMPLES_URL}#${key}`,
          tags: tags[key]
            ? Array.from(new Set([...key.split('_'), ...tags[key]]))
            : key.split('_'),
          thumbnail: {
            url: `${THREE.EXAMPLES_URL}screenshots/${key}.jpg`,
          },
        }));

        results.push(...items);

        return results;
      }, []);

      console.info(`${chalk.cyanBright('[Bot]')} ${examples.length} examples loaded`);

      return (this.examples = examples);
    } catch (error) {
      console.error(chalk.red(`bot#LoadExamples >> ${error.stack}`));
    }
  }

  /**
   * Loads and starts up the bot.
   */
  async start() {
    try {
      this.loadEvents();
      this.loadCommands();

      await this.loadDocs();
      await this.loadExamples();

      await this.login(config.token);
      await this.updateCommands();
    } catch (error) {
      console.error(chalk.red(`bot#start >> ${error.message}`));
    }
  }
}

export default Bot;
