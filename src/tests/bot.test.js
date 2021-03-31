import Bot from '../bot';

const client = new Bot();

describe('Bot', () => {
  it('loads events', async () => {
    expect(client.events.keys().length).not.toBe(0);
  });

  it('loads commands', async () => {
    expect(client.commands.keys().length).not.toBe(0);
  });
});

afterAll(() => {
  client.destroy();
});
