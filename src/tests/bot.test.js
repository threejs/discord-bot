import Bot from '../bot';

describe('Bot', () => {
  it('runs without crashing', async () => {
    const client = new Bot();

    await client.loadEvents();
    await client.loadCommands();

    client.destroy();
  });
});
