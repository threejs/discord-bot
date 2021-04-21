import chalk from 'chalk';
import { THREE, MESSAGE_LIMITS } from 'constants';

const Docs = {
  name: 'docs',
  description: `Searches ${THREE.DOCS_URL} for docs matching query.`,
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
      const exactResult = docs.find(
        ({ name }) => name.toLowerCase() === object.toLowerCase()
      );

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
        // Early return if no properties specified
        const result = exactResult || results?.[0];
        if (!property) return result;

        // Fuzzily search keywords for property
        const targetProperty =
          result.keywords.find(
            ({ name }) => name.toLowerCase() === property.toLowerCase()
          ) ||
          result.keywords.find(({ name }) =>
            name.toLowerCase().includes(property.toLowerCase())
          );

        // Handle unknown property
        if (!targetProperty)
          return {
            content: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).`,
            ephemeral: true,
          };

        return targetProperty;
      }

      // Handle multiple matches
      return {
        content: results
          .sort((a, b) => a - b)
          .reduce((message, { name, url }) => {
            const result = `\n• **[${name}](${url})**`;
            if (message.length + result.length <= MESSAGE_LIMITS.CONTENT_LENGTH)
              message += result;

            return message;
          }, `No documentation was found for \`${query}\`.\n\nRelated docs:`),
        ephemeral: true,
      };
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
