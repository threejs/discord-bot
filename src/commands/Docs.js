import chalk from 'chalk';
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
    const [query] = options;

    try {
      // Separate property/method from base class
      const [object, property] = query.split(/\.|#/);

      // Get fuzzy results if no exact match is found
      const exactResult = docs.find(({ name }) => name === object);
      const results = docs.reduce((matches, match) => {
        if (exactResult) return [exactResult];

        const fuzzySearch = new RegExp(`.*${object.split('').join('.*')}.*`, 'i');
        const isMatch = fuzzySearch.test(match.name);
        if (isMatch) matches.push(match);

        return matches;
      }, []);

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
          const relatedDocs = results
            .sort((a, b) => a - b)
            .reduce((message, { name, url }) => {
              message += `\n• **[${name}](${url})**`;

              return message;
            }, '');

          return {
            content: `No documentation was found for \`${query}\`.\n\nRelated docs: ${relatedDocs}`,
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
