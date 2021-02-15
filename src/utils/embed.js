import config from '../config';

/**
 * Generates an embed with default properties
 */
export const embed = props => ({
  embed: {
    color: config.color,
    author: {
      name: 'Three.js docs',
      icon_url: config.icon,
      url: `${config.apiEndpoint}manual/en/introduction/Creating-a-scene`,
    },
    timestamp: new Date(),
    ...props,
  },
});
