import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdir } from 'fs';
import { sep } from 'path';

class Bot extends Client {
  constructor(options) {
    super(options);

    this.commands = new Collection();
  }

  async loadEvents(dir) {
    return await Promise.resolve(
      new Promise((resolve, reject) => {
        readdir(`${dir}${sep}events`, (error, events) => {
          if (error) return reject(error);

          events.forEach(event => {
            const handler = require(`${dir}${sep}events${sep}${event}`).default;

            this.on(event.split('.').shift(), (...args) => handler(this, ...args));
          });

          if (process.env.NODE_ENV !== 'test') {
            console.info(`${chalk.cyanBright('[Bot]')} ${events.length} events loaded`);
          }

          resolve(true);
        });
      })
    );
  }

  async loadCommands(dir) {
    return await Promise.resolve(
      new Promise((resolve, reject) => {
        readdir(`${dir}${sep}commands`, (error, commands) => {
          if (error) return reject(error);

          commands.forEach(command => {
            const handler = require(`${dir}${sep}commands${sep}${command}`).default;

            this.commands.set(handler.name, handler);
          });

          if (process.env.NODE_ENV !== 'test') {
            console.info(
              `${chalk.cyanBright('[Bot]')} ${commands.length} commands loaded`
            );
          }

          resolve(true);
        });
      })
    );
  }
}

export default Bot;
