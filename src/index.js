import chalk from 'chalk';
import express from 'express';
import { readdirSync } from 'fs';
import { join } from 'path';
import Bot from 'bot';
import { middleware } from 'utils/interactions';
import config from 'config';

// Init bot
const bot = new Bot();
bot.login(config.token);

// Init app
const app = express();
app.use(express.json());

// Init routes
const routes = readdirSync(join(__dirname, 'api'));
routes.forEach(route => {
  const endpoint = route.replace(/\..*/, '');
  const handler = require(join(__dirname, 'api', route)).default;

  app.use(`/${endpoint}`, middleware, handler);
});

// Start server
if (config.env !== 'test') {
  app.listen(config.port, () =>
    console.info(
      `${chalk.cyanBright('[Bot]')} listening on port ${chalk.whiteBright(config.port)}`
    )
  );
}

export default app;
