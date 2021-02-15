import config from '../config';

/**
 * Generates an embed with default properties
 */
export const embed = props => ({
  embed: {
    color: config.color,
    ...props,
  },
});
