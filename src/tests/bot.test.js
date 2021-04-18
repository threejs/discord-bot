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

  it('loads three.js docs', async () => {
    const output = await bot.loadDocs();

    expect(output.length).not.toBe(0);
  });

  it('loads tagged three.js examples', async () => {
    const output = await bot.loadExamples();

    expect(output[0].tags.length).not.toBe(0);
    expect(output.length).not.toBe(0);
  });
});

afterAll(() => {
  bot.destroy();
});
