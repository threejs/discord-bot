import chalk from 'chalk';
import { Client, Collection } from 'discord.js';
import { readdir } from 'fs';
import { sep } from 'path';

class Bot extends Client {
  constructor(options) {
    super(options);

    this.commands = new Collection();
  }

  loadEvents(dir) {
    readdir(`${dir}${sep}events`, (error, events) => {
      if (error) return console.log(error);

      events.forEach(event => {
        const handler = require(`${dir}${sep}events${sep}${event}`).default;

        this.on(event.split('.').shift(), (...args) => handler(this, ...args));
      });

      console.info(`${chalk.cyanBright('[Bot]')} ${events.length} events loaded`);
    });
  }

  loadCommands(dir) {
    readdir(`${dir}${sep}commands`, (error, commands) => {
      if (error) return console.error(error);

      commands.forEach(command => {
        const handler = require(`${dir}${sep}commands${sep}${command}`).default;

        this.commands.set(handler.name, handler);
      });

      console.info(`${chalk.cyanBright('[Bot]')} ${commands.length} commands loaded`);
    });
  }
}

export default Bot;
