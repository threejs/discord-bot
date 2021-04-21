import chalk from 'chalk';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { markdown } from 'utils/discord';
import { THREE } from 'constants';

/**
 * Sanitizes a three meta item.
 */
export const sanitizeMetaItem = (key, value) => {
  if (!value) return;

  switch (key) {
    case 'title':
    case 'name':
      return (
        value
          // Remove labels from bracket syntax
          .replace(/\[\w+:(\w+)\s(\w+)\]/g, '$2: $1')
          // Remove method return type to end
          .replace(/^(\w+\.\w+|\w+\()(: \w+)(.*)/, '$1$3$2')
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
    case 'keywords':
      return value.map(sanitizeMeta);
    default:
      return value;
  }
};

/**
 * Sanitizes a three meta object containing HTML to markdown.
 */
export const sanitizeMeta = meta =>
  Object.assign(
    {},
    ...Object.entries(meta).map(([key, value]) => ({
      [key]: markdown(sanitizeMetaItem(key, value)),
    }))
  );

/**
 * Gets a three.js element's meta in Discord markdown.
 */
export const getElement = async ([key, endpoint]) => {
  try {
    // Assemble URL from endpoint
    const url = `${THREE.DOCS_URL}#${endpoint}`;

    // Fetch source document
    const response = await fetch(`${THREE.DOCS_URL}${endpoint}`);
    if (response.status !== 200) throw new Error(response.statusText);

    // Cleanup self-references
    const html = await response
      .text()
      .then(content => content.replace(/(:)this|\[name\]/g, `$1${key}`));

    // Create context, get page elements
    const { document } = new JSDOM(html).window;
    const pageElements = Array.from(document.body.children);

    // Element meta
    const constructor = pageElements.find(node => node.outerHTML.includes('Constructor'));
    const title = (constructor?.nextElementSibling || document.querySelector('h1'))
      .textContent;
    const description = (
      document.querySelector('.desc') || pageElements.find(elem => elem.tagName === 'P')
    )?.innerHTML;

    // Get element keywords
    const keywords = Array.from(document.querySelectorAll('h3')).reduce(
      (matches, element) => {
        // Check if property, otherwise early return on no-op
        const isProperty = /^\[(property|method):[^\s]+\s[^\]]+\]/.test(
          element.textContent
        );
        if (!isProperty) return matches;

        // Get property meta
        const name = element.textContent.replace(/^\[[^:]+:[^\s]+\s([^\]]+)\].*/, '$1');
        const type = element.textContent.startsWith('[property') ? 'property' : 'method';
        const title = `${key}.${element.textContent}`;
        const description =
          element.nextElementSibling?.tagName === 'P'
            ? element.nextElementSibling.innerHTML
            : null;
        const propertyURL = `${url}.${name}`;

        matches.push({
          name,
          type,
          title,
          description,
          url: propertyURL,
        });

        return matches;
      },
      []
    );

    // Sanitize combined meta
    return sanitizeMeta({
      name: key,
      url,
      title,
      description,
      keywords,
    });
  } catch (error) {
    console.error(chalk.red(`three#getElement >> ${error.stack}`));
  }
};

/**
 * Fetches and loads three.js documentation.
 */
export const loadDocs = async () => {
  try {
    const list = await fetch(`${THREE.DOCS_URL}list.json`).then(res => res.json());

    const endpoints = Object.assign(
      {},
      ...(function _flatten(root) {
        return [].concat(
          ...Object.keys(root).map(key =>
            typeof root[key] === 'object' ? _flatten(root[key]) : { [key]: root[key] }
          )
        );
      })(list[THREE.LOCALE])
    );
    const docs = await Promise.all(Object.entries(endpoints).map(getElement));

    return docs;
  } catch (error) {
    console.error(chalk.red(`three#loadDocs >> ${error.stack}`));
  }
};

/**
 * Fetches and loads three.js examples.
 */
export const loadExamples = async () => {
  try {
    const files = await fetch(`${THREE.EXAMPLES_URL}files.json`).then(res => res.json());
    const tags = await fetch(`${THREE.EXAMPLES_URL}tags.json`).then(res => res.json());

    const examples = Object.values(files).reduce((results, file) => {
      const items = file.map(name => {
        const keywords = tags[name]
          ? Array.from(new Set([...name.split('_'), ...tags[name]]))
          : name.split('_');

        const url = `${THREE.EXAMPLES_URL}#${name}`;
        const title = name.replace(/_/g, ' ');
        const tagList = keywords.map(
          word => `[${word}](${THREE.EXAMPLES_URL}?q=${word})`
        );
        const description = `Keywords: ${tagList.join(', ')}`;

        return {
          name: name,
          keywords,
          url,
          title,
          description,
          thumbnail: {
            url: `${THREE.EXAMPLES_URL}screenshots/${name}.jpg`,
          },
        };
      });

      results.push(...items);

      return results;
    }, []);

    return examples;
  } catch (error) {
    console.error(chalk.red(`three#loadExamples >> ${error.stack}`));
  }
};
