import chalk from 'chalk';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { THREE } from 'constants';
import { crawl } from 'utils/scraper';
import { sanitizeHTMLMeta } from 'utils/discord';

/**
 * Flattens a deeply nested object to root-level.
 *
 * @param {Object} object Deep-nested object to flatten.
 */
export const flatten = object =>
  Object.assign(
    {},
    ...(function _flatten(root) {
      return [].concat(
        ...Object.keys(root).map(key =>
          typeof root[key] === 'object' ? _flatten(root[key]) : { [key]: root[key] }
        )
      );
    })(object)
  );

/**
 * Returns a list of three.js docs in an optional locale.
 */
export const getDocs = async () => {
  try {
    const json = await fetch(THREE.DOCS_LIST).then(res => res.json());

    const endpoints = flatten(json[THREE.LOCALE]);
    const docs = Object.keys(endpoints).map(key => ({
      name: key,
      url: `${THREE.DOCS_URL}${endpoints[key]}`,
    }));

    return docs;
  } catch (error) {
    console.error(chalk.red(`three/getDocs >> ${error.stack}`));
  }
};

/**
 * Returns a list of three.js examples.
 */
export const getExamples = async () => {
  try {
    const json = await fetch(THREE.EXAMPLES_LIST).then(res => res.json());
    const tags = await fetch(THREE.EXAMPLES_TAGS).then(res => res.json());

    const examples = Object.keys(json).reduce((results, group) => {
      const items = json[group].map(key => ({
        name: key,
        url: `${THREE.EXAMPLES_URL}#${key}`,
        tags: tags[key]
          ? Array.from(new Set([...key.split('_'), ...tags[key]]))
          : key.split('_'),
        thumbnail: {
          url: `${THREE.EXAMPLES_URL}screenshots/${key}.jpg`,
        },
      }));

      results.push(...items);

      return results;
    }, []);

    return examples;
  } catch (error) {
    console.error(chalk.red(`three/getExamples >> ${error.stack}`));
  }
};

/**
 * Gets a three.js element's meta in Discord markdown.
 *
 * @param {{ url: String, name: String }} element Target element.
 * @param {String} [property] Optional element property.
 */
export const getElement = async (element, property) => {
  try {
    // Fetch and evaluate url
    const html = await crawl(element.url);

    // Create context, get page elements
    const { document } = new JSDOM(html.replace(/\[name\]/g, element.name)).window;
    const pageElements = Array.from(document.body.children);

    // Constructor meta
    const constructorElement = pageElements.find(node =>
      node.outerHTML.includes('Constructor')
    );
    const constructorTitle = (
      constructorElement?.nextElementSibling || document.querySelector('h1')
    ).innerHTML.replace(/\[\w+:(\w+)\s(\w+)\]/g, '$2: $1');
    const constructorDesc = document.querySelector('.desc')?.innerHTML;

    // Early return with constructor meta if no property specified
    if (!property)
      return sanitizeHTMLMeta({
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
        const content = element.innerHTML.replace(/^\[(property|method):\w+\s|\].*/g, '');
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
    const propertyTitle = `${element.name}.${propertyElement.innerHTML
      // Remove labels from bracket syntax
      .replace(/\[\w+:(\w+)\s(\w+)\]/g, '$2: $1')
      // Remove method return type to end
      .replace(/(: \w+)(.*)/g, '$2$1')
      // Fix self-references
      .replace(': this', `: ${element.name}`)}`;
    const propertyDesc =
      propertyElement.nextElementSibling?.tagName === 'P'
        ? propertyElement.nextElementSibling.innerHTML
        : undefined;

    // Add property to url
    const propertyURL = element.url.replace(
      element.name,
      propertyTitle.replace(/(\w+\.\w+)(.*)/, '$1')
    );

    return sanitizeHTMLMeta({
      title: propertyTitle,
      description: propertyDesc,
      url: propertyURL,
    });
  } catch (error) {
    console.error(chalk.red(`three/getElement >> ${error.stack}`));
  }
};
