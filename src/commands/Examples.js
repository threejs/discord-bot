import chalk from 'chalk';
import { COMMAND_OPTION_TYPES } from 'utils/interactions';
import { embed as embedConfig } from 'utils/embed';
import { getExamples } from 'utils/three';
import config from 'config';

// Extend embed headers
const embed = props =>
  embedConfig({
    author: {
      name: 'Three.js Examples',
      icon_url: config.icon,
      url: config.examples.url,
    },
    ...props,
  });

const Examples = {
  name: 'examples',
  description: 'Searches https://threejs.org/examples for examples matching query.',
  options: [
    {
      name: 'query',
      description: 'Query to search related examples for',
      type: COMMAND_OPTION_TYPES.STRING,
      required: true,
    },
  ],
  async execute({ query }) {
    try {
      // Get tagged examples
      const examples = await getExamples();

      // Check for an example if key was specified
      const targetKey = query.replace(/\s+/g, '_').toLowerCase();
      const target = examples.find(
        ({ name }) =>
          name === targetKey ||
          query.split(' ').every(tag => name.includes(tag.toLowerCase()))
      );

      // Fuzzy search examples
      const results =
        (target && [target]) ||
        examples
          .filter(({ tags }) =>
            query.split(' ').some(tag => tags.includes(tag.toLowerCase()))
          )
          .sort((a, b) => a - b)
          .filter(Boolean);

      switch (results.length) {
        case 0:
          // Handle no results
          return embed({
            title: `No examples were found for "${query}"`,
            description: `Discover an issue? You can report it [here](${config.github}).`,
          });
        case 1: {
          // Handle single result
          const [{ tags, name: title, ...rest }] = results;

          // List tags in result
          const description = `Tags: ${tags
            .map(tag => `[${tag}](${config.examples.url}?q=${tag})`)
            .join(', ')}`;

          return embed({
            title,
            description,
            ...rest,
          });
        }
        default:
          // Handle multiple results
          return embed({
            title: `Examples for "${query}"`,
            description: results
              .filter((_, index) => index < 10)
              .map(({ name, url }) => `**[${name}](${url})**`)
              .join('\n'),
          });
      }
    } catch (error) {
      console.error(chalk.red(`/examples ${query} >> ${error.stack}`));
    }
  },
};

export default Examples;
