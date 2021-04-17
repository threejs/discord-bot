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
 * @param {String} string Target string.
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
 * @param {String} string Target string.
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
 * @param {APIMessage} embed Overloaded embed properties.
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
 * @param {INTERACTION_RESPONSE_FLAGS} flags
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
    embed: validateEmbed(message),
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

// Delimiter used to separate stringified meta HTML
const META_DELIMITER = 'META';

/**
 * Queries for an element and its properties.
 *
 * @param {HTMLDocument} document HTML document context to query.
 * @param {String} query Query selector to query with.
 */
export const getQueryElement = (document, query) => {
  try {
    // Normalize query
    const target = query?.toLowerCase();

    // Early return if we're not querying
    const elements = Array.from(document.body.children);
    const element = elements.find(
      node =>
        ['H1', 'H3'].includes(node.tagName) &&
        node.outerHTML.toLowerCase().includes(target)
    );
    if (!element) return;

    // Property meta
    const titleElement = document.querySelector('h1');
    const propertyTitle =
      titleElement === element
        ? titleElement.innerHTML
        : titleElement.innerHTML + element.innerHTML;
    const propertyDesc =
      element.nextElementSibling.tagName === 'H3' ? element : element.nextElementSibling;
    const isProperty = !!element.querySelector('a.permalink');

    // Constructor meta
    const constructor = elements.find(node => node.outerHTML.includes('Constructor'));
    const constructorTitle = constructor?.nextElementSibling.innerHTML;
    const constructorDesc = document.querySelector('.desc');

    // Class meta
    const title = `${isProperty || !constructorTitle ? propertyTitle : constructorTitle}`;
    const description = (isProperty ? propertyDesc : constructorDesc)?.innerHTML;

    if (!description) return title;

    const trim =
      isProperty || !['P', 'UL'].includes(constructorDesc.nextElementSibling.tagName);

    return `${title}${META_DELIMITER}${description}${trim ? '' : '...'}`;
  } catch (error) {
    console.error(chalk.red(`discord/getQueryElement >> ${error.stack}`));
  }
};

/**
 * Parses HTML into Discord markdown.
 *
 * @param {String} html HTML markup string.
 * @param {String} [query] Optional query string to select from parsed HTML.
 */
export const transformMarkdown = (html, query) => {
  try {
    const { document } = new JSDOM(html).window;

    // Find element by query if specified
    const target = query ? getQueryElement(document, query) : document.body.innerHTML;
    if (!target) return;

    // Convert HTML to markdown
    const markdown = target
      // Transform code blocks
      .replace(/<\/?code.*?>/gi, '```')
      // Transform bold text
      .replace(/<\/?(h[0-9]|strong|b)>/gi, '**')
      // Transform italic text
      .replace(/<\/?(italic|i|em)>/gi, '*')
      //
      .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
      // Remove hidden anchors
      .replace(/<a.*?class="permalink">#<\/a>/gim, '')
      .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
      // Transform anchors
      .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
      // Trim spaces
      .replace(/\s+/g, ' ')
      .replace(/(\s\.)+/, '.')
      // Transform newlines
      .replace(/(\n\s?\n|<br\/?>)/gi, '\n')
      // Remove excess markdown
      .replace(/<\/?(br|li|div)>/gi, '')
      .trim();

    // Return meta object on query
    if (query) {
      const [title, description] = markdown.split(META_DELIMITER) || [markdown];

      // Split properties from title
      const property = title.replace(/.*\.|(\s*?(\(|:).*)/g, '');

      return { title, property, description };
    }

    return markdown;
  } catch (error) {
    console.error(chalk.red(`discord/transformMarkdown >> ${error.stack}`));
  }
};
