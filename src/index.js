import chalk from 'chalk';
import express from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';
import Bot from 'bot';
import { middleware } from 'utils/interactions';
import config from 'config';

// Init app
const app = express();
app.use(express.json());

// Init routes
const routes = readdirSync(join(__dirname, 'api'));
routes.forEach(route => {
  const endpoint = route.replace(/\..*/, '');
  const handler = require(join(__dirname, 'api', route)).default;

  if (config.env === 'test') {
    app.use(`/${endpoint}`, handler);
  } else {
    app.use(`/${endpoint}`, middleware, handler);
  }
});

// Init server & bot
if (config.env !== 'test') {
  app.listen(config.port, () =>
    console.info(
      `${chalk.cyanBright('[Bot]')} listening on port ${chalk.whiteBright(config.port)}`
    )
  );

  const bot = new Bot();
  bot.login(config.token);
}

export default app;
