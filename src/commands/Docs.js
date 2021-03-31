import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import config from 'config';
import { CommandOptionTypes } from '.';
import { embed as embedConfig, getDocs, crawl, transformMarkdown } from 'utils';

// Extend embed headers
const embed = props =>
  embedConfig({
    author: {
      name: 'Three.js Docs',
      icon_url: config.icon,
      url: `${config.docs.url}manual/en/introduction/Creating-a-scene`,
    },
    ...props,
  });

const Docs = {
  name: 'docs',
  description: 'Searches https://threejs.org/docs for specified query or class.',
  options: [
    {
      name: 'query or class',
      description: 'A query or class to search related docs for',
      type: CommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute({ args, msg }) {
    try {
      const [arg] = args;

      // Early return on empty query
      if (!arg) {
        return msg.channel.send(
          embed({
            title: 'Invalid usage',
            description: `Usage: \`${config.prefix}docs <query or class>\``,
          })
        );
      }

      // Separate methods and props from query
      const [query, ...props] = arg.split(/[.#]+/);
      const properties = props.length ? `.${props.join('.')}` : '';

      // Get localized docs
      const docs = await getDocs(config.locale);

      // Get fuzzy results if no exact match is found
      const exactResult = docs.find(({ name }) => name === query);
      const results = exactResult
        ? [exactResult]
        : fuzzysort
            .go(
              query,
              docs.map(({ name }) => name)
            )
            .sort((a, b) => a - b)
            .map(({ target }) => docs.find(({ name }) => name === target))
            .filter(Boolean);

      switch (results.length) {
        case 0:
          // Handle no results
          return msg.channel.send(
            embed({
              title: `No documentation was found for "${args.join(' ')}"`,
              description: `Discover an issue? You can report it [here](${config.github}).`,
            })
          );
        case 1: {
          // Handle single result
          const [{ name, ...result }] = results;

          // Query result
          const html = await crawl(result.url);
          const markdown = transformMarkdown(html, `${name}${properties}`);

          // Handle invalid query
          if (!markdown)
            return msg.channel.send(
              embed({
                title: `Documentation for "${args.join(' ')}" does not exist`,
                description: `Discover an issue? You can report it [here](${config.github}).`,
              })
            );

          // Destructure markdown
          const { title, property, description } = markdown;

          // Correct url if property found
          const url =
            name !== property && title !== property
              ? result.url.replace(name, `${name}.${property}`)
              : result.url;

          // Return auto-generated url and props
          return msg.channel.send(
            embed({
              title,
              url,
              description,
            })
          );
        }
        default:
          // Handle multiple results
          return msg.channel.send(
            embed({
              title: `Documentation for "${args.join(' ')}"`,
              description: results
                .filter((_, index) => index < 10)
                .map(({ name, url }) => `**[${name}](${url})**`)
                .join('\n'),
            })
          );
      }
    } catch (error) {
      console.error(
        chalk.red(`${config.prefix}docs ${args.join(' ')} >> ${error.stack}`)
      );
    }
  },
};

export default Docs;
