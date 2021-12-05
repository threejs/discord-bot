/**
 * Handles the bot's ready state.
 */
const ReadyEvent = {
  name: 'ready',
  execute(client) {
    console.info(`[Bot] connected as ${client.user.tag}`);
  },
};

export default ReadyEvent;
