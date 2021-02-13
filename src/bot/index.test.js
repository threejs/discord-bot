import Bot from '.';

it('runs without crashing', () => {
  const client = new Bot();
  client.destroy();
});
