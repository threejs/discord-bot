import chalk from 'chalk';
import { JSDOM } from 'jsdom';
import { crawl } from 'utils/scraper';
import { sanitizeHTML } from 'utils/discord';

/**
 * Sanitizes a three meta item.
 *
 * @param {String} key Meta item key.
 * @param {String} value Meta item value.
 */
export const sanitizeMetaItem = (key, value) => {
  if (!value) return;

  switch (key) {
    case 'url':
      return (
        value
          // Cleanup line ending
          .replace(/(\/\w+\.)\[\w+:\w+\s([^\]]+).*/, '$1$2')
      );
    case 'title':
      return (
        value
          // Remove labels from bracket syntax
          .replace(/\[\w+:(\w+)\s(\w+)\]/g, '$2: $1')
          // Remove method return type to end
          .replace(/^(\w+\.\w+)(: \w+)(.*)/, '$1$3$2')
      );
    case 'description':
      return (
        value
          // Transform custom links
          .replace(/\[link:([^\s]+)\s([^\]]+)\]/g, '[$2]($1)')
          // Cleanup inline links
          .replace(/\[[^:]+:[^\s]+\s(\w+)\]/g, '$1')
          .replace(/\[[^:]+:([^\s]+)\]/g, '$1')
      );
    default:
      return value;
  }
};

/**
 * Sanitizes a three meta object containing HTML to markdown.
 *
 * @param {Object} meta HTML meta object to sanitize.
 */
export const sanitizeMeta = meta =>
  Object.assign(
    {},
    ...Object.entries(meta).map(([key, value]) => ({
      [key]: sanitizeHTML(sanitizeMetaItem(key, value)),
    }))
  );

/**
 * Gets a three.js element's meta in Discord markdown.
 *
 * @param {{ url: String, name: String }} element Target element.
 * @param {String} [property] Optional element property.
 */
export const getElement = async (element, property) => {
  try {
    // Fetch page and cleanup self-references
    const response = await crawl(element.url);
    const html = response.replace(/(:)this|\[name\]/g, `$1${element.name}`);

    // Create context, get page elements
    const { document } = new JSDOM(html).window;
    const pageElements = Array.from(document.body.children);

    // Constructor meta
    const constructorElement = pageElements.find(node =>
      node.outerHTML.includes('Constructor')
    );
    const constructorTitle = (
      constructorElement?.nextElementSibling || document.querySelector('h1')
    ).textContent;
    const constructorDesc = document.querySelector('.desc')?.innerHTML;

    // Early return with constructor meta if no property specified
    if (!property)
      return sanitizeMeta({
        title: constructorTitle,
        description: constructorDesc,
        url: element.url,
      });

    // Target property or method element
    const propertyElement = Array.from(document.querySelectorAll('h3')).reduce(
      (match, element) => {
        const target = property?.toLowerCase();
        if (!target) return match;

        // Check property name for exact match, else get partial
        const content = element.textContent.replace(/^\[\w+:\w+\s|\].*/g, '');
        if (
          (!match && content.includes(target)) ||
          (match !== target && content === target)
        )
          match = element;

        return match;
      },
      null
    );

    // Early return with no-op if no property found
    if (!propertyElement) return;

    // Property meta
    const propertyTitle = `${element.name}.${propertyElement.textContent}`;
    const propertyDesc =
      propertyElement.nextElementSibling?.tagName === 'P' &&
      propertyElement.nextElementSibling.innerHTML;

    // Add property to url
    const propertyURL = element.url.replace(element.name, propertyTitle);

    return sanitizeMeta({
      title: propertyTitle,
      description: propertyDesc,
      url: propertyURL,
    });
  } catch (error) {
    console.error(chalk.red(`three#getElement >> ${error.stack}`));
  }
};
