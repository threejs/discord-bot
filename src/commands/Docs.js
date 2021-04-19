import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import { getElement } from 'utils/three';

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
  async execute({ options, docs }) {
    const query = options.join(' ');

    try {
      // Separate property/method from base class
      const [object, property] = query.split(/\.|#/);

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
            content: `No documentation was found for \`${query}\`.`,
            ephemeral: true,
          };
        case 1: {
          // Handle single result
          const [result] = results;
          const element = await getElement(result, property);

          // Handle unknown props
          if (!element)
            return {
              content: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).`,
              ephemeral: true,
            };

          return element;
        }
        default: {
          // Handle multiple results
          const searchItems = results.reduce((message, { name, url }, index) => {
            if (index < 10) message += `\n• **[${name}](${url})**`;

            return message;
          }, '');

          return {
            content: `No documentation was found for \`${query}\`. Related: ${searchItems}`,
            ephemeral: true,
          };
        }
      }
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
