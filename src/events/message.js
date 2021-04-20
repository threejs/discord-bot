/**
 * Handles Discord message events.
 */
const MessageEvent = {
  name: 'message',
  execute(_, msg) {
    const command = msg.content.replace(/^!?(help|docs|examples)?.*/i, '$1');
    if (msg.author.bot || !command) return;

    return msg.channel.send(`Try running with \`/${command.toLowerCase()}\`.`);
  },
};

export default MessageEvent;
