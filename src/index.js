import Bot from 'bot';
import config from 'config';

const bot = new Bot();
bot.start(config.token);
