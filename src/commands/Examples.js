import chalk from 'chalk';
import { THREE } from 'constants';

const Examples = {
  name: 'examples',
  description: 'Searches https://threejs.org/examples for examples matching query.',
  options: [
    {
      name: 'query',
      description: 'Query to search related examples for',
      type: 'string',
      required: true,
    },
  ],
  async execute({ options, examples }) {
    const query = options.join(' ');

    try {
      // Check for an example if key was specified
      const targetKey = options.join('_').toLowerCase();
      const target = examples.find(
        ({ name }) =>
          name === targetKey || name.split('_').every(frag => targetKey.includes(frag))
      );

      // Fuzzy search examples
      const results =
        (target && [target]) ||
        examples
          .filter(({ tags }) => options.some(tag => tags.includes(tag.toLowerCase())))
          .sort((a, b) => a - b)
          .filter(Boolean);

      switch (results.length) {
        case 0:
          // Handle no results
          return {
            title: `No examples were found for "${query}"`,
            description: `Discover an issue? You can report it [here](${THREE.REPO}).`,
          };
        case 1: {
          // Handle single result
          const [{ tags, name: title, ...rest }] = results;

          // List tags in result
          const description = `Tags: ${tags
            .map(tag => `[${tag}](${THREE.EXAMPLES_URL}?q=${tag})`)
            .join(', ')}`;

          return {
            title,
            description,
            ...rest,
          };
        }
        default:
          // Handle multiple results
          return {
            title: `Examples for "${query}"`,
            description: results.reduce((message, { name, url }, index) => {
              if (index < 10) message += `**[${name}](${url})**\n`;

              return message;
            }, ''),
          };
      }
    } catch (error) {
      console.error(chalk.red(`/examples ${query} >> ${error.stack}`));
    }
  },
};

export default Examples;
