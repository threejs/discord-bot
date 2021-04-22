import {
  EMBED_DEFAULTS,
  MESSAGE_LIMITS,
  INTERACTION_RESPONSE_FLAGS,
  COMMAND_OPTION_TYPES,
} from 'constants';
import { APIMessage } from 'discord.js';

/**
 * Converts a vanilla or camelCase string to SNAKE_CASE.
 */
export const snakeCase = string =>
  string
    .replace(/[A-Z]/g, char => `_${char}`)
    .replace(/\s+|_+/g, '_')
    .toUpperCase();

/**
 * Validates embed fields.
 */
export const validateFields = fields =>
  fields?.reduce((fields, { name, value }, index) => {
    if (index < MESSAGE_LIMITS.FIELD_LENGTH)
      fields.push({
        name: name.slice(0, MESSAGE_LIMITS.FIELD_NAME_LENGTH),
        value: value.slice(0, MESSAGE_LIMITS.FIELD_VALUE_LENGTH),
      });

    return fields;
  }, []);

/**
 * Validates and generates an embed with default properties.
 */
export const validateEmbed = ({ url, title, description, fields }) => ({
  ...EMBED_DEFAULTS,
  url,
  title: title?.slice(0, MESSAGE_LIMITS.TITLE_LENGTH),
  description: description?.slice(0, MESSAGE_LIMITS.DESC_LENGTH),
  fields: validateFields(fields),
});

/**
 * Parses and validates an interaction flags object.
 */
export const validateFlags = flags =>
  Object.keys(flags).reduce(
    (previous, flag) => INTERACTION_RESPONSE_FLAGS[snakeCase(flag)] || previous,
    null
  );

/**
 * Validates a message object or response and its flags.
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
    embeds: message.content ? null : [message.embeds || message].map(validateEmbed),
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
 */
export const markdown = html =>
  typeof html !== 'string'
    ? html
    : html
        // Transform code blocks
        .replace(/<\/?code[^>]*?>/gi, '```')
        // Transform bold text
        .replace(/<\/?(h[0-9]|strong|b)>/gi, '**')
        // Transform italic text
        .replace(/<\/?(italic|i|em)>/gi, '*')
        // Transform anchors
        .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
        // Trim spaces
        .replace(/\s+/g, ' ')
        // Transform newlines
        .replace(/(\n+\s*|<br\/?>)/gi, '\n')
        // Remove excess markdown
        .replace(/<\/?li>/gi, '')
        // Cleanup result string
        .trim();

/**
 * Formats a list of embedded items into a Discord-safe string.
 */
export const formatList = (items, message = '') =>
  items.reduce((output, { title, url }) => {
    const line = `\n• **[${title}](${url})**`;
    if (output.length + line.length <= MESSAGE_LIMITS.CONTENT_LENGTH) output += line;

    return output;
  }, message);
