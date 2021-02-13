import chalk from 'chalk';
import config from '../config';
import { embed, getDocs, puppeteer, transformMarkdown } from '../utils';

const Docs = {
  name: 'docs',
  description: 'Searches https://threejs.org/docs for specified query or class.',
  args: ['query or class'],
  async execute({ args, msg }) {
    try {
      const [entry] = args;
      if (!entry) {
        return msg.channel.send(
          embed({
            title: 'Invalid usage.',
            description: `Usage: \`${config.prefix}docs <query or class>\``,
          })
        );
      }

      const [query, ...rest] = entry.split(/[.#]+/);
      const properties = rest ? `.${rest.join('.')}` : '';

      const docs = await getDocs('en');
      const entries = Object.keys(docs)
        .filter(entry => entry.toLowerCase().includes(query.toLowerCase()))
        .map(key => ({
          name: `${key}${properties}`,
          url: `${config.apiEndpoint}${docs[key]}${properties}`,
        }));

      switch (entries.length) {
        case 0:
          return msg.channel.send(
            embed({
              title: `No results were found for "${args.join(' ')}".`,
              description:
                'Discover an issue? You can report it [here](https://github.com/threejs/discord-bot).',
            })
          );
        case 1: {
          const { name: title, url } = entries[0];
          const description = await puppeteer(url, transformMarkdown);

          return msg.channel.send(embed({ title, url, description }));
        }
        default:
          return msg.channel.send(
            embed({
              title: `Results for "${args.join(' ')}":`,
              description: entries
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
