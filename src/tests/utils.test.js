import {
  validateFlags,
  validateEmbed,
  validateMessage,
  markdown,
  formatList,
} from 'utils/discord';
import { search, loadDocs, loadExamples } from 'utils/three';
import { INTERACTION_RESPONSE_FLAGS, MESSAGE_LIMITS } from 'constants';

describe('utils/discord', () => {
  it('validates message flags', () => {
    const output = validateFlags({ ephemeral: true });

    expect(output).toBe(INTERACTION_RESPONSE_FLAGS.EPHEMERAL);
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

  it('formats a Discord-safe list', () => {
    const listItem = { title: 'title', url: 'url' };
    const listItemLength = formatList([listItem]).length;

    const message = ' '.repeat(MESSAGE_LIMITS.CONTENT_LENGTH - listItemLength);
    const output = formatList([listItem, listItem], message);

    expect(output.length).toBe(MESSAGE_LIMITS.CONTENT_LENGTH);
  });
});

describe('utils/three', () => {
  let docs, examples;

  beforeAll(async () => {
    docs = await loadDocs();
    examples = await loadExamples();
  });

  it('loads three.js docs', async () => {
    expect(docs).toMatchSnapshot();
  });

  it('loads three.js examples', async () => {
    expect(examples).toMatchSnapshot();
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
