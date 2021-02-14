import chalk from 'chalk';
import fuzzysort from 'fuzzysort';
import config from '../config';
import { embed, getDocs, crawl, transformMarkdown } from '../utils';

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
      const docs = await getDocs('en');

      // Get localized results
      const results = fuzzysort
        .go(query, Object.keys(docs))
        ?.sort((a, b) => a - b)
        .map(({ target }) => ({
          name: target,
          url: `${config.apiEndpoint}${docs[target]}`,
        }))
        .filter(Boolean);

      switch (results?.length) {
        case 0:
          // Offer alternative results
          return msg.channel.send(
            embed({
              title: `No results were found for "${args.join(' ')}"`,
              description:
                'Discover an issue? You can report it [here](https://github.com/threejs/discord-bot).',
            })
          );
        case 1: {
          // Handle single result
          const { url, name } = results[0];
          const { title, description } = await crawl(
            url,
            transformMarkdown,
            `${name}${properties}`
          );

          return msg.channel.send(embed({ title, url, description }));
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
      console.error(chalk.red(`${config.prefix}docs >> ${error.stack}`));
    }
  },
};

export default Docs;
