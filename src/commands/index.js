import chalk from 'chalk';
import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Valid option `type` values
 * @readonly
 * @enum {Number}
 */
export const CommandOptionTypes = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
};

/**
 * @typedef Choice
 * @property {String} name
 * @property {String} value
 */

/**
 * @typedef Option
 * @property {String} name
 * @property {String} description
 * @property {Number} type
 * @property {Boolean} required
 * @property {Choice[]} choices
 */

/**
 * @typedef Command
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {Option[]} options
 */

class CommandManager extends Collection {
  /**
   * Loads bot commands from the `commands` folder
   * @param {String} [path] Target command folder
   */
  constructor(path = __dirname) {
    super();

    readdirSync(path).forEach(file => {
      if (!file.startsWith('index')) {
        const command = require(join(path, file)).default;

        if (command?.name) {
          this.set(command.name, command);
        }
      }
    });

    console.info(`${chalk.cyanBright('[Bot]')} ${this.keys().length} commands loaded`);
  }

  /**
   * Syncs local and remote commands
   * @param client Current client context
   */
  async sync(client) {
    // Auth remote application
    const application = await client.api.applications(client.user.id);
    this.commands = application.commands;

    // Begin sync
    const commands = this.array();
    const cache = await this.commands.get();

    // Update remote commands
    for (const command in commands) {
      const previous = cache.find(({ name }) => name === command.name);

      await this.update({ id: previous?.id, ...command });
    }

    // Cleanup cache
    for (const command in cache) {
      const exists = this.get(command.name);

      if (!exists) await this.delete(command);
    }

    return commands;
  }

  /**
   * Registers or updates a command
   * @param {Command} command Command payload object
   */
  async update(command) {
    const { id, title, description, options } = command;

    // Exclude private props
    const data = { title, description, options };

    // Update remote
    if (id) {
      await this.commands(id).patch({ data });
    } else {
      await this.commands.post({ data });
    }

    return command;
  }

  /**
   * Deletes a command by ID
   * @param {Command} command Target command ID
   */
  async delete(command) {
    await this.commands(command.id).delete();

    return command;
  }
}

export default CommandManager;
