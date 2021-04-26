import Bot from 'bot';

describe('bot', () => {
  it('loads events', () => {
    const events = Bot.prototype.loadEvents();
    expect(events.array()).toMatchSnapshot();
  });

  it('loads commands', () => {
    const commands = Bot.prototype.loadCommands();
    expect(commands.array()).toMatchSnapshot();
  });
});
