import chalk from 'chalk';
import { search } from 'utils/three';
import { formatList } from 'utils/discord';
import { THREE } from 'constants';

const Examples = {
  name: 'examples',
  description: `Searches ${THREE.EXAMPLES_URL} for examples matching query.`,
  options: [
    {
      name: 'query',
      description: 'Query to search matching examples for',
      type: 'string',
      required: true,
    },
  ],
  async execute({ options, examples }) {
    const [query] = options;

    try {
      // Fuzzy search for matching examples
      const results = search(examples, query);

      // Handle no matches
      if (!results.length) {
        return {
          content: `No examples were found for \`${query}\`.`,
          ephemeral: true,
        };
      }

      // Handle single match
      if (results.length === 1) return results[0];
      return {
        content: formatList(
          results.map(({ title, url }) => `**[${title}](${url})**`),
          `No examples were found for \`${query}\`.\n\nRelated examples:`
        ),
        ephemeral: true,
      };
    } catch (error) {
      console.error(chalk.red(`/examples ${query} >> ${error.stack}`));
    }
  },
};

export default Examples;
