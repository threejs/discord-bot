import Bot from '../bot';

let client;

beforeAll(() => {
  client = new Bot();
});

describe('Bot', () => {
  it('loads events', async () => {
    const events = await client.loadEvents();

    expect(events.keys().length).not.toBe(0);
  });

  it('loads commands', async () => {
    const commands = await client.loadCommands();

    expect(commands.keys().length).not.toBe(0);
  });
});

afterAll(() => {
  client.destroy();
});
