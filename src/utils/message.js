import chalk from 'chalk';

/**
 * Triggers a message event, returning message context
 * @param client Discord client context
 * @param {string} content Initial Discord message content
 */
export const sendMessage = async (client, content) => {
  try {
    const message = {
      content,
      author: {
        id: 'test',
        username: 'TestUser',
        discriminator: '1234',
      },
      channel: {
        id: 'testID',
        messages: [],
        send(content) {
          this.messages.push(content);

          return content;
        },
      },
      guild: {
        id: 'testID',
      },
    };

    await client.events.get('message')(client, message);

    return message;
  } catch (error) {
    console.error(chalk.red(`message/sendMessage >> ${error.stack}`));
  }
};
