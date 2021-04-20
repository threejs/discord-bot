import Bot from 'bot';

describe('bot', () => {
  it('loads events', async () => {
    const events = await Bot.prototype.loadEvents();
    expect(events.keys().length).not.toBe(0);
  });

  it('loads commands', async () => {
    const commands = await Bot.prototype.loadCommands();
    expect(commands.keys().length).not.toBe(0);
  });
});
