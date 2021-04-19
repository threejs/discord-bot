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
    const [query] = options;

    try {
      // Check for an example if key was specified
      const targetKey = query.replace(/\s/g, '_').toLowerCase();
      const target = examples.find(
        ({ name }) =>
          name === targetKey || name.split('_').every(frag => targetKey.includes(frag))
      );

      // Fuzzy search examples
      const results = examples.reduce((matches, match) => {
        if (target) return [target];

        const isMatch = query
          .split(/\s|_/)
          .some(frag => match?.tags.includes(frag.toLowerCase()));
        if (isMatch) matches.push(match);

        return matches;
      }, []);

      switch (results.length) {
        case 0:
          // Handle no results
          return {
            content: `No examples were found for \`${query}\`.`,
            ephemeral: true,
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
        default: {
          // Handle multiple results
          const relatedExamples = results
            .sort((a, b) => a - b)
            .reduce((message, { name, url }) => {
              message += `\n• **[${name}](${url})**`;

              return message;
            }, '');

          return {
            content: `No examples were found for \`${query}\`.\n\nRelated examples: ${relatedExamples}`,
            ephemeral: true,
          };
        }
      }
    } catch (error) {
      console.error(chalk.red(`/examples ${query} >> ${error.stack}`));
    }
  },
};

export default Examples;
