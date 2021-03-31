import chalk from 'chalk';
import { normalize } from 'utils/discord';

/**
 * Valid interaction `type` values
 * @readonly
 * @enum {Number}
 */
const INTERACTION_TYPE = {
  PING: 1,
  COMMAND: 2,
};

/**
 * @typedef {1 | 2} InteractionType
 */

/**
 * @typedef InteractionOption
 * @property {String} name
 * @property {String} value
 */

/**
 * @typedef InteractionData
 * @property {String} id
 * @property {String} name
 * @property {InteractionOption[]} [options]
 */

/**
 *
 * @param {InteractionType} type Interaction type.
 * @param {InteractionData} data
 */
const handleInteraction = async (type, data) => {
  switch (type) {
    case INTERACTION_TYPE.PING: {
      return data;
    }
    case INTERACTION_TYPE.COMMAND: {
      return data;
    }
  }
};

const interactions = async (req, res) => {
  try {
    // Reject invalid requests
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not supported' });

    // Sanitize request
    const type = normalize(req.body.type);
    const data = normalize(req.body.data);

    // Handle interaction
    const interaction = await handleInteraction(type, data);
    if (!interaction) return res.status(404).json({ error: 'Interaction not found' });

    return res.sendStatus(204);
  } catch (error) {
    console.error(chalk.red(`interactions >> ${error.message}`));
  }
};

export default interactions;
