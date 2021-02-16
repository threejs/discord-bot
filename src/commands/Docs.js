import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import config from '../config';
import { embed as makeEmbed, getDocs, crawl, transformMarkdown } from '../utils';

// Extend embed headers
const embed = props =>
  makeEmbed({
    author: {
      name: 'Three.js Docs',
      icon_url: config.icon,
      url: `${config.apiEndpoint}manual/en/introduction/Creating-a-scene`,
    },
    ...props,
  });

const Docs = {
  name: 'docs',
  description: 'Searches https://threejs.org/docs for specified query or class.',
  args: ['query or class'],
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

      // Separate base class and props from query
      const [query, ...rest] = arg.split(/[.#]+/);
      const properties = rest.length > 0 ? `.${rest.join('.')}` : '';

      // Get localized docs
      const docs = await getDocs(config.locale);

      // Get localized results
      const results = fuzzysort
        .go(query, Object.keys(docs))
        .sort((a, b) => a - b)
        .map(({ target }) => ({
          name: target,
          url: `${config.apiEndpoint}${docs[target]}`,
        }))
        .filter(Boolean);

      switch (results.length) {
        case 0:
          // Handle no results
          return msg.channel.send(
            embed({
              title: `No results were found for "${args.join(' ')}"`,
              description:
                'Discover an issue? You can report it [here](https://github.com/threejs/discord-bot).',
            })
          );
        case 1: {
          // Handle single result
          const [{ name, ...result }] = results;
          const { title, property, description } = await crawl(
            result.url,
            transformMarkdown,
            `${name}${properties}`
          );

          // Correct url if property found
          const url = property
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
              title: `Results for "${args.join(' ')}"`,
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
