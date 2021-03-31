import request from 'supertest';
import app from '../';
import { INTERACTION_TYPE, INTERACTION_RESPONSE_TYPE } from 'utils/interactions';

describe('Interactions', () => {
  it('Responds to a ping interaction', () => {
    const output = request(app)
      .post('/interactions')
      .send({ type: INTERACTION_TYPE.PING });

    expect(output.status).toBe(200);
    expect(output.body).toBe({ type: INTERACTION_RESPONSE_TYPE.PONG });
  });

  it('Responds to a command interaction', () => {
    const output = request(app)
      .post('/interactions')
      .send({
        type: INTERACTION_TYPE.APPLICATION_COMMAND,
        data: {
          name: 'help',
        },
      });

    expect(output.status).toBe(200);
    expect(output.body).toBe({
      type: INTERACTION_RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
    });
  });

  it('Rejects an unknown command interaction', () => {
    const output = request(app)
      .post('/interactions')
      .send({
        type: INTERACTION_TYPE.APPLICATION_COMMAND,
        data: {
          name: 'unknown',
        },
      });

    expect(output.status).toBe(404);
  });
});
