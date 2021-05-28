import chalk from 'chalk';
import { search } from 'utils/three';
import { formatPages } from 'utils/discord';
import { THREE } from 'constants';

const Docs = {
  name: 'docs',
  description: `Searches ${THREE.DOCS_URL} for docs matching query.`,
  options: [
    {
      name: 'query',
      description: 'A query or class to search matching docs for',
      type: 'string',
      required: true,
    },
  ],
  execute({ options, docs }) {
    const [query] = options;

    try {
      // Separate property/method from base class
      const [object, property] = query.split(/\.|#/);

      // Fuzzy search for matching docs
      const results = search(docs, object);

      // Handle no matches
      if (!results.length) {
        return {
          title: `Docs for "${query}"`,
          description: `No documentation was found for \`${query}\`.`,
        };
      }

      // Handle single match
      if (results.length === 1) {
        // Early return if no properties specified
        const result = results[0];
        if (!property) return result;

        // Fuzzily search result for property
        const properties = search(result.properties, property);

        // Handle unknown property
        if (!properties.length)
          return {
            title: `Docs for "${query}"`,
            description: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).`,
          };

        // Handle matching property
        if (properties.length === 1) return properties[0];

        // Handle multiple matching properties
        return formatPages(
          properties.map(({ title, url }) => `**[${title}](${url})**`),
          {
            title: `Docs for "${query}"`,
            description: `\`${property}\` is not a known method or property of [${result.name}](${result.url}).\n\nDid you mean:`,
          }
        );
      }

      // Handle multiple matches
      return formatPages(
        results.map(({ name, url }) => `**[${name}](${url})**`),
        {
          title: `Docs for "${query}"`,
          description: `No documentation was found for \`${query}\`.\n\nRelated docs:`,
        }
      );
    } catch (error) {
      console.error(chalk.red(`/docs ${query} >> ${error.stack}`));
    }
  },
};

export default Docs;
