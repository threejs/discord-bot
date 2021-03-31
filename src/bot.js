import { Collection, Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

class Bot extends Client {
  constructor(options) {
    super(options);

    this.events = this.loadEvents();
    this.commands = this.loadCommands();
  }

  /**
   * Loads bot events from the `events` folder.
   *
   * @param {String} [path] Target base directory.
   */
  loadEvents(path = __dirname) {
    const events = new Collection();

    readdirSync(join(path, 'events')).forEach(file => {
      if (!file.startsWith('index')) {
        const handler = require(join(path, 'events', file)).default;
        const event = file.replace('.js', '');

        events.set(event, handler);
        this.on(event, (...args) => handler(this, ...args));
      }
    });

    return events;
  }

  /**
   * Loads bot commands from the `commands` folder.
   *
   * @param {String} [path] Target base directory.
   */
  loadCommands(path = __dirname) {
    const commands = new Collection();

    readdirSync(join(path, 'commands')).forEach(file => {
      const command = require(join(path, 'commands', file)).default;

      if (command?.name) {
        commands.set(command.name, command);
      }
    });

    return commands;
  }
}

export default Bot;
