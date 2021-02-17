import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import config from '../config';
import { embed as embedConfig, getDocs, crawl, transformMarkdown } from '../utils';

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

      // Separate methods and props from query
      const [query, ...props] = arg.split(/[.#]+/);
      const properties = props.length ? `.${props.join('.')}` : '';

      // Get localized docs
      const docs = await getDocs(config.locale);

      // Get localized results
      const results = fuzzysort
        .go(query, Object.keys(docs))
        .sort((a, b) => a - b)
        .map(({ target }) => ({
          name: target,
          url: `${config.docs.url}${docs[target]}`,
        }))
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
          const { title, property, description } = await crawl(
            result.url,
            transformMarkdown,
            `${name}${properties}`
          );

          // Correct url if property found
          const url =
            name !== property
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
