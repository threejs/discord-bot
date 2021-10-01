import chalk from 'chalk';
import { fetch } from 'fetch-h2';
import { JSDOM } from 'jsdom';
import { Collection } from 'discord.js';
import { markdown } from 'utils/discord';
import { THREE } from 'constants';

/**
 * Fetches the current stable three.js revision.
 */
export const getRevision = async () => {
  const constants = await fetch(`${THREE.REPO_URL}/master/src/constants.js`, {
    headers: {
      'User-Agent': 'Three.js Discord Bot',
    },
  }).then(res => res.text());
  const [revision] = constants.match(/(?!REVISION[^\d]+)(\d+)/);

  return revision;
};

/**
 * Searches a three.js source for matching results.
 */
export const search = (source, query) => {
  // Early return with exact match if found
  const exactResult = source.find(({ name }) =>
    name.includes('_')
      ? name.toLowerCase() === query.replace(/\s/g, '_').toLowerCase()
      : name.toLowerCase() === query.toLowerCase()
  );
  if (exactResult) return [exactResult];

  // Fuzzy search for related matches
  const results = source.reduce((matches, match) => {
    const fuzzySearch = new RegExp(`.*${query.split('').join('.*')}.*`, 'i');
    const isMatch = fuzzySearch.test(match.name);
    if (isMatch) matches.push(match);

    return matches;
  }, []);

  // Return alphabetically sorted matches
  return results.sort((a, b) => a - b);
};

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
          .replace(/\[[^:]+:([^\s]+)\s([^\]]+)\s*\]/g, '$2: $1')
          // Remove method return type to end
          .replace(/^(\w+\.\w+|\w+\()(: \w+)(.*)/, '$1$3$2')
          // Cleanup type spacing
          .replace(/\s+:\s+/g, ': ')
      );
    case 'description':
      return (
        value
          // Transform custom links
          .replace(/\[link:([^\s]+)\s([^\]]+)\]/g, '<a href="$1">$2</a>')
          // Cleanup inline links
          .replace(/\[[^:]+:([^\s\]]+\s)?([^\]]+)\]/g, '$2')
      );
    case 'properties':
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
    const response = await fetch(`${THREE.DOCS_URL}${endpoint}`, {
      headers: {
        'User-Agent': 'Three.js Discord Bot',
      },
    });
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

    // Get element parents for fallback
    const metaText = document.body.innerHTML.slice(
      0,
      document.body.innerHTML.indexOf('<h1>')
    );
    const parentRegex = /(?:\[page:([^\]]+)\])/g;
    const parentLinks = metaText.match(parentRegex);
    const parents = parentLinks?.map(match => parentRegex.exec(match)[1]).reverse();

    // Get element properties
    const properties = Array.from(document.querySelectorAll('h3')).reduce(
      (matches, element) => {
        // Check if property, otherwise early return on no-op
        const isProperty = /^\[(property|method):[^\s]+\s[^\]]+\]/.test(
          element.textContent
        );
        if (!isProperty) return matches;

        // Get property meta
        const content = element.textContent.replace(/\n.*/g, '');
        const name = content.replace(/^\[[^:]+:[^\s]+\s([^\]]+)\].*/, '$1');
        const type = content.startsWith('[property') ? 'property' : 'method';
        const title = `${key}.${content}`;
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
      parents,
      properties,
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
    const list = await fetch(`${THREE.DOCS_URL}list.json`, {
      headers: {
        'User-Agent': 'Three.js Discord Bot',
      },
    }).then(res => res.json());

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

    const docs = new Collection();
    await Promise.all(
      Object.entries(endpoints).map(async endpoint => {
        const element = await getElement(endpoint);
        docs.set(element.name, element);

        return element;
      })
    );

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
    const files = await fetch(`${THREE.EXAMPLES_URL}files.json`, {
      headers: {
        'User-Agent': 'Three.js Discord Bot',
      },
    }).then(res => res.json());

    const examples = new Collection();
    Object.values(files)
      .flat()
      .forEach(name => {
        const example = {
          name,
          url: `${THREE.EXAMPLES_URL}#${name}`,
          title: name.replace(/_/g, ' '),
          thumbnail: {
            url: `${THREE.EXAMPLES_URL}screenshots/${name}.jpg`,
          },
        };

        examples.set(example.name, example);
      });

    return examples;
  } catch (error) {
    console.error(chalk.red(`three#loadExamples >> ${error.stack}`));
  }
};
