import Core from 'core';

let client;

beforeAll(async () => {
  client = new Core();

  client.loadEvents();
  await client.loadCommands();
});

describe('Core', () => {
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
