import Bot from 'bot';
import config from 'config';

const bot = new Bot();

bot.login(config.token);
