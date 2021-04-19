import {
  validateFlags,
  validateEmbed,
  validateMessage,
  sanitizeHTML,
} from 'utils/discord';
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
    const output = sanitizeHTML(
      '<a href="#">Link</a><h1>Header</h1><strong>Bold</strong><b>Bold</b><italic>Italic</italic><i>Italic</i>'
    );

    expect(output).toBe('[Link](#)**Header****Bold****Bold***Italic**Italic*');
  });
});
