import Bot from 'bot';

let bot;

beforeAll(() => {
  bot = new Bot();
});

describe('bot', () => {
  it('loads events', () => {
    bot.loadEvents();
    expect(bot.events.keys().length).not.toBe(0);
  });

  it('loads commands', () => {
    bot.loadCommands();
    expect(bot.commands.keys().length).not.toBe(0);
  });
});

afterAll(() => {
  bot.destroy();
});
