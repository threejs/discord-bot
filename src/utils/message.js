/**
 * Emulates a message context
 */
export const message = content => ({
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
      return this.messages.push(content);
    },
  },
  guild: {
    id: 'testID',
  },
});
