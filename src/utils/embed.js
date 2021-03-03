import config from '../config';

/**
 * Generates an embed with default properties
 * @param {object} props Overloaded embed properties
 */
export const embed = props => ({
  embed: {
    color: config.color,
    ...props,
  },
});
