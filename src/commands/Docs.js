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

      // Check for an exact match
      const exactResult = docs.find(({ name }) => name === object);

      // Fuzzy search for related docs
      const results = docs.reduce((matches, match) => {
        const fuzzySearch = new RegExp(`.*${object.split('').join('.*')}.*`, 'i');
        const isMatch = fuzzySearch.test(match.name);
        if (isMatch) matches.push(match);

        return matches;
      }, []);

      // Handle no matches
      if (!exactResult && !results.length) {
        return {
          content: `No documentation was found for \`${query}\`.`,
          ephemeral: true,
        };
      }

      // Handle single match
      if (exactResult || results.length === 1) {
        const result = exactResult || results?.[0];
        const element = await getElement(result, property);

        // Handle unknown props
        if (!element)
          return {
            content: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).`,
            ephemeral: true,
          };

        return element;
      }

      // Handle multiple matches
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
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
