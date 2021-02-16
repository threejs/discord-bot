import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdir } from 'fs';
import { resolve, sep } from 'path';

const DEFAULT_PATH = resolve(__dirname, '..');

class Bot extends Client {
  constructor(options) {
    super(options);

    this.events = new Collection();
    this.commands = new Collection();
  }

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

          if (process.env.NODE_ENV !== 'test') {
            console.info(`${chalk.cyanBright('[Bot]')} ${files.length} events loaded`);
          }

          resolve(true);
        });
      })
    );
  }

  async loadCommands(path = DEFAULT_PATH) {
    return await Promise.resolve(
      new Promise((resolve, reject) => {
        readdir(`${path}${sep}commands`, (error, files) => {
          if (error) return reject(error);

          files.forEach(file => {
            const command = require(`${path}${sep}commands${sep}${file}`).default;

            this.commands.set(command.name, command);
          });

          if (process.env.NODE_ENV !== 'test') {
            console.info(`${chalk.cyanBright('[Bot]')} ${files.length} commands loaded`);
          }

          resolve(true);
        });
      })
    );
  }
}

export default Bot;
