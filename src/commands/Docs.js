import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import { COMMAND_OPTION_TYPES } from 'utils/interactions';
import { embed as embedConfig } from 'utils/embed';
import { getDocs } from 'utils/three';
import { crawl } from 'utils/puppeteer';
import { transformMarkdown } from 'utils/discord';
import config from 'config';

// Extend embed headers
const embed = props =>
  embedConfig({
    author: {
      name: 'Three.js Docs',
      icon_url: config.icon,
      url: `${config.docs.url}manual/en/introduction/Creating-a-scene`,
    },
    ...props,
  });

const Docs = {
  name: 'docs',
  description: 'Searches https://threejs.org/docs for specified query or class.',
  options: [
    {
      name: 'query or class',
      description: 'A query or class to search related docs for',
      type: COMMAND_OPTION_TYPES.STRING,
      required: true,
    },
  ],
  async execute({ query }) {
    try {
      // Early return on empty query
      if (!query) {
        return embed({
          title: 'Invalid usage',
          description: `Usage: \`/docs <query or class>\``,
        });
      }

      // Separate methods and props from query
      const [object, ...props] = query.split(/[.#]+/);
      const properties = props.length ? `.${props.join('.')}` : '';

      // Get localized docs
      const docs = await getDocs(config.locale);

      // Get fuzzy results if no exact match is found
      const exactResult = docs.find(({ name }) => name === object);
      const results = exactResult
        ? [exactResult]
        : fuzzysort
            .go(
              object,
              docs.map(({ name }) => name)
            )
            .sort((a, b) => a - b)
            .map(({ target }) => docs.find(({ name }) => name === target))
            .filter(Boolean);

      switch (results.length) {
        case 0:
          // Handle no results
          return embed({
            title: `No documentation was found for "${query}"`,
            description: `Discover an issue? You can report it [here](${config.github}).`,
          });
        case 1: {
          // Handle single result
          const [{ name, ...result }] = results;

          // Query result
          const html = await crawl(result.url);
          const markdown = transformMarkdown(html, `${name}${properties}`);

          // Handle invalid query
          if (!markdown)
            return embed({
              title: `Documentation for "${query}" does not exist`,
              description: `Discover an issue? You can report it [here](${config.github}).`,
            });

          // Destructure markdown
          const { title, property, description } = markdown;

          // Correct url if property found
          const url =
            name !== property && title !== property
              ? result.url.replace(name, `${name}.${property}`)
              : result.url;

          // Return auto-generated url and props
          return embed({
            title,
            url,
            description,
          });
        }
        default:
          // Handle multiple results
          return embed({
            title: `Documentation for "${query}"`,
            description: results
              .filter((_, index) => index < 10)
              .map(({ name, url }) => `**[${name}](${url})**`)
              .join('\n'),
          });
      }
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
