import chalk from 'chalk';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import {
  EMBED_DEFAULTS,
  MESSAGE_LIMITS,
  INTERACTION_RESPONSE_FLAGS,
  COMMAND_OPTION_TYPES,
} from 'constants';
import { APIMessage } from 'discord.js';

/**
 * Converts a vanilla or camelCase string to SNAKE_CASE.
 *
 * @param {String} string Target string to convert.
 */
export const snakeCase = string =>
  string
    .replace(/[A-Z]/g, char => `_${char}`)
    .replace(/\s+|_+/g, '_')
    .toUpperCase();

// Shared sanitation context
const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

/**
 * Normalizes and cleans up unsafe strings, eval.
 *
 * @param {String} string Target string to normalize.
 */
export const normalize = string => DOMPurify.sanitize(string);

/**
 * Sanitizes Discord syntax from command arguments.
 *
 * @param {String} message Discord message string to sanitize.
 */
export const sanitize = message => {
  if (!message) return;

  return normalize(
    message
      // Remove newline characters
      .replace(/\n/gm, ' ')
      // Remove mentions
      .replace(/<@!\d*>/g, '')
      // Remove formatting
      .replace(/(\*|`|:)*/g, '')
      // Trim inline spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
};

/**
 * Generates an embed with default properties.
 *
 * @param embed Inline embed properties.
 */
export const validateEmbed = embed => {
  const { title, description, fields, ...rest } = embed;

  return {
    ...EMBED_DEFAULTS,
    title: title?.slice(0, MESSAGE_LIMITS.TITLE_LENGTH),
    description: description?.slice(0, MESSAGE_LIMITS.DESC_LENGTH),
    fields: fields?.reduce((fields, field, index) => {
      if (index < MESSAGE_LIMITS.FIELD_LENGTH) {
        const { name, value, inline } = field;

        fields.push({
          name: name.slice(0, MESSAGE_LIMITS.FIELD_NAME_LENGTH),
          value: value.slice(0, MESSAGE_LIMITS.FIELD_VALUE_LENGTH),
          inline: Boolean(inline),
        });
      }

      return fields;
    }, []),
    ...rest,
  };
};

/**
 * Parses and validates an interaction flags object.
 *
 * @param flags An object with interaction flags, denoted as keys.
 */
export const validateFlags = flags =>
  Object.keys(flags).reduce(
    (previous, flag) => INTERACTION_RESPONSE_FLAGS[snakeCase(flag)] || previous,
    null
  );

/**
 * Validates a message object or response and its flags.
 *
 * @param {APIMessage} message Discord message response.
 */
export const validateMessage = message => {
  // No-op on empty or pre-processed message
  if (!message || message instanceof APIMessage) return message;

  // Early return if evaluating message string
  if (typeof message === 'string')
    return { content: message.slice(0, MESSAGE_LIMITS.CONTENT_LENGTH) };

  // Handle message object and inline specifiers
  return {
    tts: Boolean(message.tts),
    flags: validateFlags(message.flags || message),
    content: message.content?.slice(0, MESSAGE_LIMITS.CONTENT_LENGTH) || '',
    embeds: message.embeds?.map(validateEmbed) || [validateEmbed(message)],
  };
};

/**
 * Validates human-readable command meta into a Discord-ready object.
 */
export const validateCommand = ({ name, description, options }) => ({
  name,
  description,
  options: options?.map(({ type, ...rest }) => ({
    type: COMMAND_OPTION_TYPES[snakeCase(type)],
    ...rest,
  })),
});

/**
 * Parses HTML into Discord markdown.
 *
 * @param {String} html HTML markup string.
 */
export const sanitizeHTML = html => {
  if (!html) return;

  try {
    return (
      html
        // Transform code blocks
        .replace(/<\/?code.*?>/gi, '```')
        // Transform bold text
        .replace(/<\/?(h[0-9]|strong|b)>/gi, '**')
        // Transform italic text
        .replace(/<\/?(italic|i|em)>/gi, '*')
        // Transform anchors
        .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
        // Transform bracket syntax
        .replace(/\[[^:]+:[^\s]+\s(\w+)\]/g, '$1')
        .replace(/\[[^:]+:([^\s]+)\]/g, '$1')
        // Trim spaces
        .replace(/\s+/g, ' ')
        // Transform newlines
        .replace(/(\n+\s*|<br\/?>)/gi, '\n')
        // Remove excess markdown
        .replace(/<\/?li>/gi, '')
        // Cleanup result string
        .trim()
    );
  } catch (error) {
    console.error(chalk.red(`discord/sanitizeHTML >> ${error.stack}`));
  }
};

/**
 * Sanitizes a meta object containing HTML to markdown.
 *
 * @param {Object} meta HTML meta object to sanitize.
 */
export const sanitizeHTMLMeta = meta =>
  Object.assign(
    {},
    ...Object.entries(meta).map(([key, html]) => ({ [key]: sanitizeHTML(html) }))
  );
