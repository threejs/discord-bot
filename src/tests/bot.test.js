import Bot from 'bot';

describe('bot', () => {
  it('loads events', () => {
    const events = Bot.prototype.loadEvents();
    expect(events.array().length).not.toBe(0);
  });

  it('loads commands', () => {
    const commands = Bot.prototype.loadCommands();
    expect(commands.array().length).not.toBe(0);
  });
});
