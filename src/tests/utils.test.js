import {
  sanitize,
  validateFlags,
  validateEmbed,
  validateMessage,
  transformMarkdown,
} from 'utils/discord';
import { crawl } from 'utils/puppeteer';
import { getDocs, getExamples } from 'utils/three';
import { INTERACTION_RESPONSE_FLAGS, MESSAGE_LIMITS } from 'constants';
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
        inline: 'yes',
      }),
    };

    const output = validateEmbed(embed);

    expect(output.title.length).toBe(MESSAGE_LIMITS.TITLE_LENGTH);
    expect(output.description.length).toBe(MESSAGE_LIMITS.DESC_LENGTH);
    expect(output.fields.length).toBe(MESSAGE_LIMITS.FIELD_LENGTH);
    expect(output.fields[0].name.length).toBe(MESSAGE_LIMITS.FIELD_NAME_LENGTH);
    expect(output.fields[0].value.length).toBe(MESSAGE_LIMITS.FIELD_VALUE_LENGTH);
    expect(output.fields[0].inline).toBe(true);
  });

  it('transforms HTML to markdown', () => {
    const output = transformMarkdown(
      '<a href="#">Link</a><h1>Header</h1><strong>Bold</strong><b>Bold</b><italic>Italic</italic><i>Italic</i>'
    );

    expect(output).toBe('[Link](#)**Header****Bold****Bold***Italic**Italic*');
  });

  it('transforms HTML meta to markdown meta', () => {
    const { title, description } = transformMarkdown(
      '<h1>Class</h1><p class="desc">Class description.</p><h2>Constructor</h2><h3>Class()</h3>',
      'class'
    );

    expect(title).toBe('Class()');
    expect(description).toBe('Class description.');
  });

  it('shows a trail if HTML meta is trimmed', () => {
    const { title, description } = transformMarkdown(
      '<h1>Class</h1><p class="desc">Class description.</p><p>More stuff.</p><h2>Constructor</h2><h3>Class()</h3>',
      'class'
    );

    expect(title).toBe('Class()');
    expect(description).toBe('Class description....');
  });
});

describe('utils/puppeteer', () => {
  it('crawls a webpage and callsback', async () => {
    const output = await crawl('about:blank');

    expect(output).toBe('');
  });
});

describe('utils/three', () => {
  it('gets three.js docs', async () => {
    const output = await getDocs();

    expect(output.length).not.toBe(0);
  });

  it('gets tagged three.js examples', async () => {
    const output = await getExamples();

    expect(output[0].tags.length).not.toBe(0);
    expect(output.length).not.toBe(0);
  });
});
