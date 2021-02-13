import Bot from '../bot';

describe('Bot', () => {
  it('runs without crashing', () => {
    const client = new Bot();
    client.destroy();
  });
});
