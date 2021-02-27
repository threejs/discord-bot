import chalk from 'chalk';
import { JSDOM } from 'jsdom';

// Delimiter used to separate stringified meta HTML
const META_DELIMITER = 'META';

/**
 * Queries for an element and its properties
 */
const getQueryElement = (document, query) => {
  try {
    // Early return if we're not querying
    const elements = Array.from(document.body.children);
    const element = elements.find(
      node =>
        ['H1', 'H3'].includes(node.tagName) &&
        node.outerHTML.toLowerCase().includes(query?.toLowerCase())
    );
    if (!element) return;

    // Property meta
    const propertyTitle = `${document.querySelector('h1').innerHTML}${element.innerHTML}`;
    const propertyDesc =
      element.nextElementSibling.tagName === 'H3' ? element : element.nextElementSibling;
    const isProperty = !!element.querySelector('a.permalink');

    // Constructor meta
    const constructor = elements.find(node => node.outerHTML.includes('Constructor'));
    const constructorTitle = constructor?.nextElementSibling.innerHTML;
    const constructorDesc = document.querySelector('.desc');

    // Class meta
    const title = `${isProperty ? propertyTitle : constructorTitle}`;
    const description = `${(isProperty ? propertyDesc : constructorDesc).innerHTML}`;
    const trim =
      isProperty || !['P', 'UL'].includes(constructorDesc.nextElementSibling.tagName);

    return `${title}${META_DELIMITER}${description}${trim ? '' : '...'}`;
  } catch (error) {
    console.error(chalk.red(`discord/getQueryElement >> ${error.stack}`));
  }
};

/**
 * Parses HTML into Discord markdown
 */
export const transformMarkdown = (html, query) => {
  try {
    const { document } = new JSDOM(html).window;

    // Find element by query if specified
    const target = getQueryElement(document, query) || document.body.innerHTML;

    // Convert HTML to markdown
    const markdown = target
      .replace(/<\/?code>/gi, '```')
      .replace(/<\/?(h[0-9]|strong|b)>/gi, '**')
      .replace(/<\/?(italic|i)>/gi, '*')
      .replace(/<span.*?>([^<]*)<\/span>/gim, '$1')
      .replace(/<a.*?class="permalink">#<\/a>/gim, '')
      .replace(/<a.*?onclick=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '$2')
      .replace(/<a.*?href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gim, '[$2]($1)')
      .replace(/\s+/g, ' ')
      .replace(/(\s\.)+/, '.')
      .replace(/(\n\s?\n|<br\/?>)/gi, '\n')
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
