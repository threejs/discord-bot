import Bot from 'bot';
import { THREE } from 'constants';

let client;
let test;

beforeAll(async () => {
  client = new Bot();
  await client.start();

  test = async (name, ...options) =>
    client.commands.get(name).execute({ ...client, options });
});

describe('/help', () => {
  it("displays this bot's commands", async () => {
    const output = await test('help');

    expect(output).toBeDefined();
    expect(output.ephemeral).toBe(true);
  });
});

describe('/docs', () => {
  it('has fallback on no result', async () => {
    const output = await test('docs', 'ThisDoesNotExist');

    expect(output.description.includes('ThisDoesNotExist')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('has fallback for unknown properties', async () => {
    const output = await test('docs', 'vector3.thisDoesNotExist');

    expect(output.description.includes('thisDoesNotExist')).toBe(true);
    expect(output.description.includes('Vector3')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('searches alternate docs', async () => {
    const output = await test('docs', 'vector');

    expect(output.description.includes('Vector3')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('gets a specified class', async () => {
    const output = await test('docs', 'Vector3');

    expect(output.title).toBe('Vector3( x: Float, y: Float, z: Float )');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3`);
    expect(output.description).toBeDefined();
  });

  it('strict gets a specified class', async () => {
    const output = await test('docs', 'Renderer');

    expect(output.title).toBe('WebGLRenderer Constants');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/constants/Renderer`);
    expect(output.description).toBeDefined();
  });

  it('gets a specified class method', async () => {
    const output = await test('docs', 'Vector3.set');

    expect(output.title).toBe('Vector3.set( x: Float, y: Float, z: Float ): Vector3');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3.set`);
    expect(output.description).toBeDefined();
  });

  it('searches alternate methods and properties', async () => {
    const output = await test('docs', 'Vector3.get');

    expect(output.description.includes('getComponent')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('gets a class property', async () => {
    const output = await test('docs', 'Vector3.x');

    expect(output.title).toBe('Vector3.x: Float');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3.x`);
    expect(output.description).not.toBeDefined();
  });

  it('fuzzily gets a specified class', async () => {
    const output = await test('docs', 'Vectr3');

    expect(output.title).toBe('Vector3( x: Float, y: Float, z: Float )');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3`);
    expect(output.description).toBeDefined();
  });

  it('fuzzily gets a specified class method', async () => {
    const output = await test('docs', 'Vectr3.set');

    expect(output.title).toBe('Vector3.set( x: Float, y: Float, z: Float ): Vector3');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3.set`);
    expect(output.description).toBeDefined();
  });

  it('fuzzily gets a class property', async () => {
    const output = await test('docs', 'Vectr3.x');

    expect(output.title).toBe('Vector3.x: Float');
    expect(output.url).toBe(`${THREE.DOCS_URL}#api/${THREE.LOCALE}/math/Vector3.x`);
    expect(output.description).not.toBeDefined();
  });
});

describe('/examples', () => {
  it('has fallback on no result', async () => {
    const output = await test('examples', 'ThisDoesNotExist');

    expect(output.description.includes('ThisDoesNotExist')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('gets multiple results', async () => {
    const output = await test('examples', 'webgl');

    expect(output.description.includes('webgl')).toBe(true);
    expect(output.ephemeral).toBe(true);
  });

  it('gets a result by key', async () => {
    const output = await test('examples', 'webgl_animation_cloth');

    expect(output.title).toBe('webgl animation cloth');
  });

  it('fuzzily gets a result by key', async () => {
    const output = await test('examples', 'webgl animation cloth');

    expect(output.title).toBe('webgl animation cloth');
  });
});

afterAll(() => {
  client.destroy();
});
