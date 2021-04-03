import chalk from 'chalk';
import fetch from 'node-fetch';
// eslint-disable-next-line no-unused-vars
import { MessageEmbed } from 'discord.js';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { DISCORD_URL, EMBED_DEFAULTS } from 'constants';
import config from 'config';

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
 * Authenticates and makes a request to Discord's API. Useful for anything external like registering commands.
 *
 * @param {String} path Discord endpoint to target with request.
 * @param {'GET' | 'POST' | 'PATCH' | 'DELETE'} method HTTP method to use in request.
 * @param {Object} body Request payload.
 */
export const makeAPIRequest = async (path, method, body) =>
  new Promise((resolve, reject) => {
    fetch(`${DISCORD_URL}${path}`, {
      method,
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bot ${config.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(resolve)
      .catch(reject);
  });

const MAX_TITLE_LENGTH = 256;
const MAX_DESC_LENGTH = 2048;

const MAX_FIELD_LENGTH = 25;
const MAX_FIELD_NAME_LENGTH = 256;
const MAX_FIELD_VALUE_LENGTH = 1024;

/**
 * Generates an embed with default properties.
 *
 * @param {MessageEmbed} props Overloaded embed properties.
 * @returns {MessageEmbed}
 */
export const validateEmbed = props => {
  const { title, description, fields, ...rest } = props;

  return {
    ...EMBED_DEFAULTS,
    title: title?.slice(0, MAX_TITLE_LENGTH),
    description: description?.slice(0, MAX_DESC_LENGTH),
    fields: fields?.reduce((fields, field, index) => {
      if (index <= MAX_FIELD_LENGTH) {
        const { name, value } = field;

        fields.push({
          name: name.slice(0, MAX_FIELD_NAME_LENGTH),
          value: value.slice(0, MAX_FIELD_VALUE_LENGTH),
        });
      }

      return fields;
    }, []),
    ...rest,
  };
};

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
