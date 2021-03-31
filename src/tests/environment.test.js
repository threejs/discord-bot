import app from '../';
import config from 'config';

describe('Environment', () => {
  it('runs without crashing', () => {
    const instance = app.listen(config.port, () => instance.close());
  });
});
