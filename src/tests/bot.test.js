import Bot from '../bot';
import { resolve } from 'path';

describe('Bot', () => {
  it('runs without crashing', async () => {
    const client = new Bot();

    await client.loadEvents(resolve(__dirname, '..'));
    await client.loadCommands(resolve(__dirname, '..'));

    client.destroy();
  });
});
