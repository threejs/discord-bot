import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdir } from 'fs';
import { resolve, sep } from 'path';
import config from '../config';

const DEFAULT_PATH = resolve(__dirname, '..');

class Bot extends Client {
  constructor(options) {
    super(options);

    this.events = new Collection();
    this.commands = new Collection();
  }

  /**
   * Loads Discord events from the `event` folder
   * @param {string} [path] Optional root folder
   */
  async loadEvents(path = DEFAULT_PATH) {
    return await Promise.resolve(
      new Promise((resolve, reject) => {
        readdir(`${path}${sep}events`, (error, files) => {
          if (error) return reject(error);

          files.forEach(file => {
            const handler = require(`${path}${sep}events${sep}${file}`).default;
            const event = file.split('.').shift();

            this.events.set(event, handler);
            this.on(event, (...args) => handler(this, ...args));
          });

          if (config.env !== 'test') {
            console.info(`${chalk.cyanBright('[Bot]')} ${files.length} events loaded`);
          }

          resolve(true);
        });
      })
    );
  }

  /**
   * Loads Discord commands from the `commands` folder
   * @param {string} [path] Optional root folder
   */
  async loadCommands(path = DEFAULT_PATH) {
    return await Promise.resolve(
      new Promise((resolve, reject) => {
        readdir(`${path}${sep}commands`, (error, files) => {
          if (error) return reject(error);

          files.forEach(file => {
            const command = require(`${path}${sep}commands${sep}${file}`).default;

            this.commands.set(command.name, command);
          });

          if (config.env !== 'test') {
            console.info(`${chalk.cyanBright('[Bot]')} ${files.length} commands loaded`);
          }

          resolve(true);
        });
      })
    );
  }
}

export default Bot;
