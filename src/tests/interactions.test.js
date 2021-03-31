import request from 'supertest';
import app from '../';

describe('Interactions', () => {
  it('GETs available interactions', () => {
    const output = request(app).get('/interactions');

    expect(output.status).toBe(200);
  });
});
