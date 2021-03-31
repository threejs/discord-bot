import chalk from 'chalk';
import { COMMAND_OPTION_TYPES } from 'commands';
import { embed as embedConfig, getExamples } from 'utils';
import config from 'config';

// Extend embed headers
const embed = props =>
  embedConfig({
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
  options: [
    {
      name: 'tags',
      description: 'Tags to search related examples for',
      type: COMMAND_OPTION_TYPES.STRING,
      required: true,
    },
  ],
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

      // Get tagged examples
      const examples = await getExamples();

      // Check for an example if key was specified
      const targetKey = args.join('_').toLowerCase();
      const target = examples.find(
        ({ name }) =>
          name === targetKey || args.every(arg => name.includes(arg.toLowerCase()))
      );

      // Fuzzy search examples
      const results =
        (target && [target]) ||
        examples
          .filter(({ tags }) => args.some(arg => tags.includes(arg.toLowerCase())))
          .sort((a, b) => a - b)
          .filter(Boolean);

      switch (results.length) {
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
          const [{ tags, name: title, ...rest }] = results;

          // List tags in result
          const description = `Tags: ${tags
            .map(tag => `[${tag}](${config.examples.url}?q=${tag})`)
            .join(', ')}`;

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
