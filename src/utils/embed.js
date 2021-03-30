// eslint-disable-next-line no-unused-vars
import { MessageEmbed } from 'discord.js';
import config from '../config';

const MAX_TITLE_LENGTH = 256;
const MAX_DESC_LENGTH = 2048;

const MAX_FIELD_LENGTH = 25;
const MAX_FIELD_NAME_LENGTH = 256;
const MAX_FIELD_VALUE_LENGTH = 1024;

/**
 * Generates an embed with default properties
 * @param {MessageEmbed} props Overloaded embed properties
 * @returns {MessageEmbed}
 */
const validateProps = props => {
  const { title, description, fields, ...rest } = props;

  return {
    title: title?.slice(0, MAX_TITLE_LENGTH),
    description: description?.slice(0, MAX_DESC_LENGTH),
    fields: fields?.reduce((fields, field, index) => {
      if (index <= MAX_FIELD_LENGTH) {
        const { name, value } = field;

        fields.push({
          name: name.slice(0, MAX_FIELD_NAME_LENGTH),
          value: value.slice(0, MAX_FIELD_VALUE_LENGTH),
        });
      }

      return fields;
    }, []),
    ...rest,
  };
};

/**
 * Generates an embed with default properties
 * @param {MessageEmbed} props Overloaded embed properties
 */
export const embed = props => ({
  embed: {
    color: config.color,
    ...validateProps(props),
  },
});
