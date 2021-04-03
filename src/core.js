import { Client, Collection, APIMessage } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { makeAPIRequest, validateEmbed } from 'utils/discord';
import { INTERACTION_RESPONSE_TYPE } from './constants';
import config from 'config';

/**
 * An extended `Client` to support slash-command interactions and events.
 */
class Core extends Client {
  constructor(options) {
    super(options);

    this.commands = new Collection();
    this.events = new Collection();
  }

  /**
   * Formats an interaction response into an `APIMessage`.
   *
   * @param interaction Remote Discord interaction object.
   * @param {String | APIMessage} content Stringified or pre-processed response.
   * @param [options] Overloaded message options or alternative input.
   */
  async createAPIMessage(interaction, content, options) {
    if (!(content instanceof APIMessage)) {
      content = APIMessage.create(
        this.channels.resolve(interaction.channel_id),
        typeof content === 'object' ? { embed: validateEmbed(content) } : content,
        options
      );
    }

    return content.resolveData();
  }

  /**
   * Sends a message over an interaction endpoint.
   *
   * @param interaction Remote Discord interaction object.
   * @param {String | APIResponse} content Stringified or pre-processed response.
   * @param [options] Overloaded message options or alternative input.
   */
  async send(interaction, content, options) {
    const { data } = await this.createAPIMessage(interaction, content, options);

    const response = await makeAPIRequest(
      `/interactions/${interaction.id}/${interaction.token}/callback`,
      'POST',
      {
        type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      }
    );

    return response;
  }

  /**
   * Loads and registers interaction commands from the commands folder
   */
  async loadCommands() {
    const files = readdirSync(resolve(__dirname, 'commands'));

    for (const file of files) {
      const command = require(resolve(__dirname, 'commands', file)).default;

      await makeAPIRequest(
        `/applications/${config.clientID}${
          config.guild ? `/guilds/${config.guild}` : ''
        }/commands`,
        'POST',
        {
          name: command.name,
          description: command.description,
          options: command?.options,
        }
      );

      this.commands.set(command.name, command);
    }
  }

  /**
   * Loads and registers `Client` events from the events folder
   */
  loadEvents() {
    const files = readdirSync(resolve(__dirname, 'events'));

    for (const file of files) {
      const event = require(resolve(__dirname, 'events', file)).default;

      this.on(event.name, (...args) => event.execute(this, ...args));

      this.events.set(event.name, event);
    }
  }

  /**
   * Authenticates, loads, and registers bot commands and events.
   *
   * @param {String} token Discord bot token.
   */
  async init(token) {
    if (token) await this.login(token);

    this.loadCommands();
    this.loadEvents();
  }
}

export default Core;
