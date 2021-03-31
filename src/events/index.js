import chalk from 'chalk';
import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

class EventManager extends Collection {
  /**
   * Loads bot events from the `events` folder.
   *
   * @param {String} [path] Target event folder.
   */
  constructor(path = __dirname) {
    super();

    readdirSync(path).forEach(file => {
      if (!file.startsWith('index')) {
        const handler = require(join(path, file)).default;
        const event = file.replace('.js', '');

        this.set(event, handler);
      }
    });

    console.info(`${chalk.cyanBright('[Bot]')} ${this.keys().length} events loaded`);
  }

  /**
   * Syncs and binds bot events.
   *
   * @param client Current client context.
   */
  sync(client) {
    this.keys().forEach(event => {
      const handler = this.get(event);

      client.on(event, (...args) => handler(client, ...args));
    });
  }
}

export default EventManager;
