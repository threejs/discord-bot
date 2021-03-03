import Bot from '../bot';
import { sendMessage } from '../utils';
import config from '../config';

let client;

beforeAll(async () => {
  client = new Bot();

  await client.loadEvents();
  await client.loadCommands();
});

describe('commands/Docs', () => {
  it('has fallback on no result', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs ThisDoesNotExist`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('ThisDoesNotExist')).toBe(true);
  });

  it('fuzzy searches alternate docs', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs vector`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('vector')).toBe(true);
    expect(output.embed.description.length).not.toBe(0);
  });

  it('gets a specified class', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vector3`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('Vector3( x : Float, y : Float, z : Float )');
    expect(output.embed.url).toBe(`${config.docs.url}api/${config.locale}/math/Vector3`);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a specified class method', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vector3.set`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe(
      'Vector3.set ( x : Float, y : Float, z : Float ) : this'
    );
    expect(output.embed.url).toBe(
      `${config.docs.url}api/${config.locale}/math/Vector3.set`
    );
    expect(output.embed.description).toBeDefined();
  });

  it('gets a shorthand class method', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vector3.get`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('Vector3.getComponent ( index : Integer ) : Float');
    expect(output.embed.url).toBe(
      `${config.docs.url}api/${config.locale}/math/Vector3.getComponent`
    );
    expect(output.embed.description).toBeDefined();
  });

  it('gets a class property', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vector3.x`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('Vector3.x : Float');
    expect(output.embed.url).toBe(
      `${config.docs.url}api/${config.locale}/math/Vector3.x`
    );
    expect(output.embed.description).not.toBeDefined();
  });

  it('fuzzily gets a specified class', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vectr3`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('Vector3( x : Float, y : Float, z : Float )');
    expect(output.embed.url).toBe(`${config.docs.url}api/${config.locale}/math/Vector3`);
    expect(output.embed.description).toBeDefined();
  });

  it('fuzzily gets a specified class method', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vectr3.set`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe(
      'Vector3.set ( x : Float, y : Float, z : Float ) : this'
    );
    expect(output.embed.url).toBe(
      `${config.docs.url}api/${config.locale}/math/Vector3.set`
    );
    expect(output.embed.description).toBeDefined();
  });

  it('fuzzily gets a class property', async () => {
    const msg = await sendMessage(client, `${config.prefix}docs Vectr3.x`);

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('Vector3.x : Float');
    expect(output.embed.url).toBe(
      `${config.docs.url}api/${config.locale}/math/Vector3.x`
    );
    expect(output.embed.description).not.toBeDefined();
  });
});

describe('commands/Examples', () => {
  it('has fallback on no result', async () => {
    const msg = await sendMessage(client, `${config.prefix}examples ThisDoesNotExist`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('ThisDoesNotExist')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets multiple results', async () => {
    const msg = await sendMessage(client, `${config.prefix}examples webgl`);

    const [output] = msg.channel.messages;
    expect(output.embed.title.includes('webgl')).toBe(true);
    expect(output.embed.description).toBeDefined();
  });

  it('gets a result by key', async () => {
    const msg = await sendMessage(
      client,
      `${config.prefix}examples webgl_animation_cloth`
    );

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('webgl_animation_cloth');
    expect(output.embed.description.includes('Tags')).toBe(true);
  });

  it('fuzzily gets a result by key', async () => {
    const msg = await sendMessage(
      client,
      `${config.prefix}examples webgl animation cloth`
    );

    const [output] = msg.channel.messages;
    expect(output.embed.title).toBe('webgl_animation_cloth');
    expect(output.embed.description.includes('Tags')).toBe(true);
  });
});

describe('commands/Help', () => {
  it("displays this bot's commands", async () => {
    const msg = await sendMessage(client, `${config.prefix}help`);

    const [output] = msg.channel.messages;
    expect(output.embed.fields.length).toBe(Array.from(client.commands.keys()).length);
  });
});

describe('commands/Uptime', () => {
  it("displays this bot's uptime", async () => {
    const msg = await sendMessage(client, `${config.prefix}uptime`);

    const [output] = msg.channel.messages;
    expect(output).toBeDefined();
  });
});

afterAll(() => {
  client.destroy();
});
