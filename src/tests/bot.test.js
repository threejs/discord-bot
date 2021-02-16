import Bot from '../bot';

let client;

beforeAll(() => {
  client = new Bot();
});

describe('Bot', () => {
  it('loads events', async () => {
    await client.loadEvents();

    expect(client.events.keys().length).not.toBe(0);
  });

  it('loads commands', async () => {
    await client.loadCommands();

    expect(client.commands.keys().length).not.toBe(0);
  });
});

afterAll(() => {
  client.destroy();
});
