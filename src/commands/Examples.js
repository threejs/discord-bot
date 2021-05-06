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
          title: `Examples for "${query}"`,
          description: `No examples were found for \`${query}\`.`,
        };
      }

      // Handle single match
      if (results.length === 1) return results[0];

      // Handle multiple matches
      return {
        title: `Examples for "${query}"`,
        description: formatList(
          results.map(({ title, url }) => `**[${title}](${url})**`),
          `No examples were found for \`${query}\`.\n\nRelated examples:`
        ),
      };
    } catch (error) {
      console.error(chalk.red(`/examples ${query} >> ${error.stack}`));
    }
  },
};

export default Examples;
