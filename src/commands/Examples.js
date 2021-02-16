import chalk from 'chalk';
import config from '../config';
import { embed as makeEmbed, getExamples } from '../utils';

// Extend embed headers
const embed = props =>
  makeEmbed({
    author: {
      name: 'Three.js Examples',
      icon_url: config.icon,
      url: config.examples.url,
    },
    ...props,
  });

const Examples = {
  name: 'examples',
  description: 'Searches https://threejs.org/examples for examples matching tags.',
  args: ['tags'],
  async execute({ args, msg }) {
    try {
      // Early return on empty query
      if (!args.length) {
        return msg.channel.send(
          embed({
            title: 'Invalid usage',
            description: `Usage: \`${config.prefix}examples <tags>\``,
          })
        );
      }

      // Get localized docs
      const examples = await getExamples();

      // Fuzzy search examples
      const results = examples
        .filter(({ name, tags }) =>
          args.some(
            arg => name.includes(arg.toLowerCase()) || tags?.includes(arg.toLowerCase())
          )
        )
        .sort((a, b) => a - b)
        .filter(Boolean);

      // See if a specific example was specified
      const result = results.find(res => res.name === args.join('_').toLowerCase());

      switch ((result && 1) || results.length) {
        case 0:
          // Handle no results
          return msg.channel.send(
            embed({
              title: `No examples were found for "${args.join(' ')}"`,
              description: `Discover an issue? You can report it [here](${config.github}).`,
            })
          );
        case 1: {
          // Handle single result
          const { tags, name: title, ...rest } = result;

          // List tags in result
          const description = `Tags: ${tags.length ? tags.join(', ') : 'none'}`;

          return msg.channel.send(
            embed({
              title,
              description,
              ...rest,
            })
          );
        }
        default:
          // Handle multiple results
          return msg.channel.send(
            embed({
              title: `Examples for "${args.join(' ')}"`,
              description: results
                .filter((_, index) => index < 10)
                .map(({ name, url }) => `**[${name}](${url})**`)
                .join('\n'),
            })
          );
      }
    } catch (error) {
      console.error(
        chalk.red(`${config.prefix}examples ${args.join(' ')} >> ${error.stack}`)
      );
    }
  },
};

export default Examples;
