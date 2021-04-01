import chalk from 'chalk';
import { INTERACTION_TYPE, handleInteraction } from 'utils/interactions';

const interactions = async (req, res) => {
  try {
    // Validate interaction
    const { type, data } = req.body;
    if (!type) {
      return res.status(400).json({ error: 'Please specify an interaction type' });
    } else if (!data && type !== INTERACTION_TYPE.PING) {
      return res.status(400).json({ error: 'Invalid interaction body' });
    }

    // Handle interaction
    const interaction = await handleInteraction(type, data);
    if (!interaction) return res.status(404).json({ error: 'Interaction not found' });

    return res.status(200).json(interaction);
  } catch (error) {
    console.error(chalk.red(`interactions >> ${error.message}`));
  }
};

export default interactions;
