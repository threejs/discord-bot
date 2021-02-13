import chalk from 'chalk';
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
      const results = Object.keys(docs)
        .filter(entry => entry.toLowerCase().includes(query.toLowerCase()))
        .map(key => ({
          name: `${key}${properties}`,
          url: `${config.apiEndpoint}${docs[key]}${properties}`,
        }));

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
          const { url } = results[0];
          const { title, description } = await crawl(
            url,
            transformMarkdown,
            `${query}${properties}`
          );

          return msg.channel.send(embed({ title, url, description }));
        }
        default:
          // Handle multiple results
          return msg.channel.send(
            embed({
              title: `Results for "${args.join(' ')}"`,
              description: results
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
