/**
 * Triggers a message event, returning message context
 */
export const message = async (client, content) => {
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
};
