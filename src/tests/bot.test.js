import Bot from '../bot';

describe('bot', () => {
  it('loads events', () => {
    const events = Bot.prototype.loadEvents();
    expect([...events.keys()].length).not.toBe(0);
  });

  it('loads commands', () => {
    const commands = Bot.prototype.loadCommands();
    expect([...commands.keys()].length).not.toBe(0);
  });
});
