import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import { getElement } from 'utils/three';
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
  async execute({ options, client }) {
    const query = options.join(' ');

    try {
      // Separate property/method from base class
      const [object, property] = query.split(/\.|#/);

      // Get fuzzy results if no exact match is found
      const exactResult = client.docs.find(({ name }) => name === object);
      const results = exactResult
        ? [exactResult]
        : fuzzysort
            .go(
              object,
              client.docs.map(({ name }) => name)
            )
            .sort((a, b) => a - b)
            .map(({ target }) => client.docs.find(({ name }) => name === target))
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
          const [result] = results;
          const element = await getElement(result, property);

          // Handle unknown props
          if (!element)
            return {
              title: `Documentation for "${query}" does not exist`,
              description: `Discover an issue? You can report it [here](${THREE.REPO}).`,
            };

          return element;
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
