import chalk from 'chalk';
import { handleInteraction } from 'utils';

const interactions = async (req, res) => {
  try {
    // Handle interaction
    const { type, data } = req.body;
    const interaction = await handleInteraction(type, data);
    if (!interaction) return res.status(404).json({ error: 'Interaction not found' });

    return res.sendStatus(204);
  } catch (error) {
    console.error(chalk.red(`interactions >> ${error.message}`));
  }
};

export default interactions;
