import Bot from '../bot';
import { resolve } from 'path';
import { message } from '../utils';
import config from '../config';

let client;

beforeAll(async () => {
  client = new Bot();

  await client.loadEvents(resolve(__dirname, '..'));
  await client.loadCommands(resolve(__dirname, '..'));
});

describe('commands/Docs', () => {
  it('has fallback on no result', async () => {
    const msg = await message(client, `${config.prefix}docs ThisDoesNotExist`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('No results')).toBe(true);
    expect(output.embed.title.includes('ThisDoesNotExist')).toBe(true);
  });

  it('fuzzy searches alternate docs', async () => {
    const msg = await message(client, `${config.prefix}docs create`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('Results for')).toBe(true);
    expect(output.embed.title.includes('create')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a specified class', async () => {
    const msg = await message(client, `${config.prefix}docs Vector3`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3')).toBe(true);
    expect(output.embed.url.endsWith('Vector3')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a specified class method', async () => {
    const msg = await message(client, `${config.prefix}docs Vector3.set`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.set')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.set')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a shorthand class method', async () => {
    const msg = await message(client, `${config.prefix}docs Vector3.get`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.getComponent')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.getComponent')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a class property', async () => {
    const msg = await message(client, `${config.prefix}docs Vector3.x`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.x')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.x')).toBe(true);
  });

  it('fuzzily gets a specified class', async () => {
    const msg = await message(client, `${config.prefix}docs Vectr3`);

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });

  it('fuzzily gets a specified class method', async () => {
    const msg = await message(client, `${config.prefix}docs Vectr3.set`);

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });

  it('fuzzily gets a class property', async () => {
    const msg = await message(client, `${config.prefix}docs Vectr3.x`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.startsWith('Vector3.x')).toBe(true);
    expect(output.embed.url.endsWith('Vector3.x')).toBe(true);
  });
});

describe('commands/Help', () => {
  it("displays this bot's commands", async () => {
    const msg = await message(client, `${config.prefix}help`);

    const [output] = msg.channel.messages;
    expect(output.embed.fields.length).toBe(Array.from(client.commands.keys()).length);
  });
});

describe('commands/Uptime', () => {
  it("displays this bot's uptime", async () => {
    const msg = await message(client, `${config.prefix}uptime`);

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });
});

afterAll(() => {
  client.destroy();
});
