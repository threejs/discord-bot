import Bot from '../bot';
import { resolve } from 'path';
import { message } from '../utils';

let client;

beforeAll(async () => {
  client = new Bot();
  await client.loadCommands(resolve(__dirname, '..'));
});

describe('commands/Docs', () => {
  it('has fallback on no result', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['ThisDoesNotExist'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('No results')).toBe(true);
    expect(output.embed.title.includes(...args)).toBe(true);
  });

  it('fuzzy searches alternate docs', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['create'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('Results for')).toBe(true);
    expect(output.embed.title.includes(...args)).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a specified class', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vector3'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith(...args)).toBe(true);
    expect(output.embed.url.endsWith(...args)).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a specified class method', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vector3.set'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith(...args)).toBe(true);
    expect(output.embed.url.endsWith(...args)).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a shorthand class method', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vector3.get'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.getComponent')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.getComponent')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a class property', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vector3.length'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.length')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.length')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('fuzzily gets a specified class', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vectr3'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });

  it('fuzzily gets a specified class method', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vectr3.set'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });

  it('fizzily gets a class property', async () => {
    const command = client.commands.get('docs');
    const msg = message('!docs');
    const args = ['Vectr3.length'];

    await command.execute({ client, msg, args });

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.length')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.length')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });
});

describe('commands/Help', () => {
  it("displays this bot's commands", () => {
    const command = client.commands.get('help');
    const msg = message('!help');

    command.execute({ client, msg });

    const [output] = msg.channel.messages;
    expect(output.embed.fields.length).toBe(Array.from(client.commands.keys()).length);
  });
});

describe('commands/Uptime', () => {
  it("displays this bot's uptime", () => {
    const command = client.commands.get('uptime');
    const msg = message('!uptime');

    command.execute({ client, msg });

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });
});

afterAll(() => {
  client.destroy();
});
