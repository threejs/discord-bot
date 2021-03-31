import { Client } from 'discord.js';
import EventManager from '../events';
import CommandManager from '../commands';

class Bot extends Client {
  constructor(options) {
    super(options);

    this.events = new EventManager();
    this.commands = new CommandManager();
  }
}

export default Bot;
