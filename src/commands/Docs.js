import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import { getDocs } from 'utils/three';
import { crawl } from 'utils/puppeteer';
import { transformMarkdown } from 'utils/discord';
import { THREE } from 'constants';

const Docs = {
  name: 'docs',
  description: 'Searches https://threejs.org/docs for docs matching query.',
  options: [
    {
      name: 'query',
      description: 'A query or class to search related docs for',
      type: 'string',
      required: true,
    },
  ],
  async execute({ options }) {
    const query = options.join(' ');

    try {
      // Separate methods and props from query
      const [object, ...props] = query.split(/\.|#/);
      const properties = props.length ? `.${props.join('.')}` : '';

      // Get localized docs
      const docs = await getDocs();

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
          return {
            title: `No documentation was found for "${query}"`,
            description: `Discover an issue? You can report it [here](${THREE.REPO}).`,
          };
        case 1: {
          // Handle single result
          const [{ name, ...result }] = results;

          // Query result
          const html = await crawl(result.url);
          const markdown = transformMarkdown(html, `${name}${properties}`);

          // Handle invalid query
          if (!markdown)
            return {
              title: `Documentation for "${query}" does not exist`,
              description: `Discover an issue? You can report it [here](${THREE.REPO}).`,
            };

          // Destructure markdown
          const { title, property, description } = markdown;

          // Correct url if property found
          const url =
            name !== property && title !== property
              ? result.url.replace(name, `${name}.${property}`)
              : result.url;

          // Return auto-generated url and props
          return {
            title,
            url,
            description,
          };
        }
        default:
          // Handle multiple results
          return {
            title: `Documentation for "${query}"`,
            description: results.reduce((message, { name, url }, index) => {
              if (index < 10) message += `**[${name}](${url})**\n`;

              return message;
            }, ''),
          };
      }
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
