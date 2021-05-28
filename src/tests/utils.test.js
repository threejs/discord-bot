import {
  sanitize,
  validateMessage,
  validateEmbed,
  markdown,
  formatPages,
} from 'utils/discord';
import { search, loadDocs, loadExamples } from 'utils/three';
import { MESSAGE_LIMITS } from 'constants';
import config from 'config';

describe('utils/discord', () => {
  it('sanitizes Discord mentions', () => {
    const output = sanitize(`${config.prefix}command args <@!1234>`);

    expect(output).toBe(`${config.prefix}command args`);
  });

  it('sanitizes Discord emotes', () => {
    const output = sanitize(`${config.prefix}command args :emote:`);

    expect(output).toBe(`${config.prefix}command args emote`);
  });

  it('sanitizes whitespace', () => {
    const output = sanitize(`${config.prefix}command args  arg2\narg3`);

    expect(output).toBe(`${config.prefix}command args arg2 arg3`);
  });

  it('sanitizes Discord markdown', () => {
    const output = sanitize(`
      ${config.prefix}command args
      *Italics*
      **Bold**
      \`Code\`
      \`\`\`Codeblock\`\`\`
    `);

    expect(output).toBe(`${config.prefix}command args Italics Bold Code Codeblock`);
  });

  it('validates message strings', () => {
    const content = ' '.repeat(MESSAGE_LIMITS.CONTENT_LENGTH + 1);

    const inline = validateMessage(content);
    const explicit = validateMessage({ content });

    expect(inline.content).toBe(explicit.content);
    expect(inline.content.length).toBe(MESSAGE_LIMITS.CONTENT_LENGTH);
    expect(explicit.content.length).toBe(MESSAGE_LIMITS.CONTENT_LENGTH);
  });

  it('validates message embeds', () => {
    const embed = {
      title: ' '.repeat(MESSAGE_LIMITS.TITLE_LENGTH + 1),
      description: ' '.repeat(MESSAGE_LIMITS.DESC_LENGTH + 1),
      fields: new Array(MESSAGE_LIMITS.FIELD_LENGTH + 1).fill({
        name: ' '.repeat(MESSAGE_LIMITS.FIELD_NAME_LENGTH + 1),
        value: ' '.repeat(MESSAGE_LIMITS.FIELD_VALUE_LENGTH + 1),
      }),
    };

    const output = validateEmbed(embed);

    expect(output.title.length).toBe(MESSAGE_LIMITS.TITLE_LENGTH);
    expect(output.description.length).toBe(MESSAGE_LIMITS.DESC_LENGTH);
    expect(output.fields.length).toBe(MESSAGE_LIMITS.FIELD_LENGTH);
    expect(output.fields[0].name.length).toBe(MESSAGE_LIMITS.FIELD_NAME_LENGTH);
    expect(output.fields[0].value.length).toBe(MESSAGE_LIMITS.FIELD_VALUE_LENGTH);
  });

  it('transforms HTML to markdown', () => {
    const output = markdown(
      '<a href="#">Link</a><h1>Header</h1><strong>Bold</strong><b>Bold</b><italic>Italic</italic><i>Italic</i>'
    );

    expect(output).toBe('[Link](#)**Header****Bold****Bold***Italic**Italic*');
  });

  it('formats items into pages', () => {
    const output = formatPages(new Array(20).fill('item'), {
      title: 'Message Title',
      description: 'Items:',
    });

    expect(output.title).toBe('Message Title');
    expect(output.description).not.toBe('Items:');
    expect(output.buttons).toBeDefined();
  });
});

describe('utils/three', () => {
  let docs, examples;

  beforeAll(async () => {
    docs = await loadDocs();
    examples = await loadExamples();
  });

  it('loads three.js docs', async () => {
    expect(docs.array().length).not.toBe(0);
  });

  it('loads three.js examples', async () => {
    expect(examples.array()).not.toBe(0);
  });

  it('searches docs for classes', () => {
    const [output] = search(docs, 'Vector3');

    expect(output.title.includes('Vector3')).toBe(true);
  });

  it('searches docs for related classes', () => {
    const output = search(docs, 'Vector');

    expect(output.length).not.toBe(0);
    expect(output.length).not.toBe(1);
  });

  it('searches class for properties', () => {
    const [baseClass] = search(docs, 'Vector3');
    const [output] = search(baseClass.properties, 'set');

    expect(output.title.includes('set')).toBe(true);
  });

  it('handles duplicated methods in Object3D', () => {
    const [baseClass] = search(docs, 'Object3D');
    const [output] = search(baseClass.properties, 'lookat');

    expect(output.title.includes('lookAt')).toBe(true);
  });

  it('searches class for related properties', () => {
    const [baseClass] = search(docs, 'Vector3');
    const output = search(baseClass.properties, 'get');

    expect(output.length).not.toBe(0);
    expect(output.length).not.toBe(1);
  });

  it('searches examples for matching examples', () => {
    const [output] = search(examples, 'webgl');

    expect(output.length).not.toBe(0);
  });

  it('searches examples for an example', () => {
    const [output] = search(examples, 'webgl animation cloth');

    expect(output.title.includes('webgl animation cloth')).toBe(true);
  });
});
