import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import {
  EMBED_DEFAULTS,
  MESSAGE_LIMITS,
  MESSAGE_COMPONENT_TYPES,
  MESSAGE_COMPONENT_STYLES,
  INTERACTION_RESPONSE_FLAGS,
  COMMAND_OPTION_TYPES,
} from 'constants';
import { APIMessage } from 'discord.js';

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
 * Converts a vanilla or camelCase string to SNAKE_CASE.
 */
export const snakeCase = string =>
  string
    .replace(/[A-Z]/g, char => `_${char}`)
    .replace(/\s+|_+/g, '_')
    .toUpperCase();

/**
 * Parses and validates keys against a types enum.
 */
export const validateKeys = (keys, types) =>
  Object.keys(keys).reduce((previous, key) => types[snakeCase(key)] || previous, null);

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
export const validateEmbed = ({ title, description, fields, ...rest }) => ({
  ...EMBED_DEFAULTS,
  title: title?.slice(0, MESSAGE_LIMITS.TITLE_LENGTH),
  description: description?.slice(0, MESSAGE_LIMITS.DESC_LENGTH),
  fields: validateFields(fields),
  ...rest,
});

/**
 * Parses and validates message button components.
 */
export const validateButtons = buttons => [
  {
    type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
    components: buttons.map(({ label, style, url, ...rest }, index) => ({
      type: MESSAGE_COMPONENT_TYPES.BUTTON,
      custom_id: `button-${index + 1}`,
      label: label?.slice(0, MESSAGE_LIMITS.BUTTON_LABEL_LENGTH),
      style:
        style ||
        validateKeys(rest, MESSAGE_COMPONENT_STYLES) ||
        MESSAGE_COMPONENT_STYLES.SECONDARY,
      url,
      ...rest,
    })),
  },
];

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
    files: message.files,
    tts: Boolean(message.tts),
    flags: validateKeys(message.flags || message, INTERACTION_RESPONSE_FLAGS),
    components: message.buttons?.length ? validateButtons(message.buttons) : null,
    content: message.content?.slice(0, MESSAGE_LIMITS.CONTENT_LENGTH) || '',
    embed: message.content ? null : validateEmbed(message.embed || message),
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
        .replace(/<a.*?href=["']([^"']*)["'][^>]*>\s*([^<]*)\s*<\/a>/gim, '[$2]($1)')
        // Trim spaces
        .replace(/\s+/g, ' ')
        // Transform newlines
        .replace(/(\n|<br\/?>)+/gi, '\n')
        // Insert em dashes
        .replace(/-{2,}/g, '—')
        // Remove excess markdown
        .replace(/<\/?li>/gi, '')
        // Cleanup result string
        .trim();

/**
 * Formats a list of items into an embed with navigable pages.
 */
export const formatPages = (items, message, page = 0) => {
  const pages = items.reduce((output, item, index) => {
    const pageIndex = Math.trunc(index / 10);
    const line = `\n• ${item}`;

    if (output[pageIndex]) {
      output[pageIndex] += line;
    } else {
      output[pageIndex] = message?.description ? `${message.description}${line}` : line;
    }

    return output;
  }, []);

  return {
    ...message,
    description: pages[page],
    footer: { text: `Page ${page + 1} of ${pages.length}` },
    buttons: pages.length > 1 && [
      {
        label: '<<',
        onClick: () => {
          page = 0;

          return {
            ...message,
            description: pages[page],
            footer: { text: `Page ${page + 1} of ${pages.length}` },
          };
        },
      },
      {
        label: '← Back',
        onClick: () => {
          if (page > 0) page--;

          return {
            ...message,
            description: pages[page],
            footer: { text: `Page ${page + 1} of ${pages.length}` },
          };
        },
      },
      {
        label: 'Next →',
        onClick: () => {
          if (page < pages.length - 1) page++;

          return {
            ...message,
            description: pages[page],
            footer: { text: `Page ${page + 1} of ${pages.length}` },
          };
        },
      },
      {
        label: '>>',
        onClick: () => {
          page = pages.length - 1;

          return {
            ...message,
            description: pages[page],
            footer: { text: `Page ${page + 1} of ${pages.length}` },
          };
        },
      },
    ],
  };
};

/**
 * Registers component event handlers.
 */
export const registerComponents = (client, parentId, components) => {
  components[0].components.forEach(button => {
    const listenerId = `${parentId}-${button.custom_id}`;
    client.listeners.set(listenerId, button.onClick);
  });
};
