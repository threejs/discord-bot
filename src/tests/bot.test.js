import Bot from 'bot';

let bot;

beforeAll(() => {
  bot = new Bot();

  bot.loadEvents();
  bot.loadCommands();
});

describe('Bot', () => {
  it('loads events', () => {
    expect(bot.events.keys().length).not.toBe(0);
  });

  it('loads commands', () => {
    expect(bot.commands.keys().length).not.toBe(0);
  });
});

afterAll(() => {
  bot.destroy();
});
