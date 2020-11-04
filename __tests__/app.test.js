require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    //let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      //const signInData = await fakeRequest(app)
      ////.post('/auth/signup')
      //.send({
      // email: 'jon@user.com',
      //  password: '1234'
      /// });
      
      //token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns colors', async() => {

      const expectation = [
        {
          id: 1,
          name: 'teal',
          cool_factor: 3,  
          owner_id: 1,
          cool: true
       
        },
        {
          id: 2,  
          name: 'green',
          cool_factor: 4, 
          owner_id: 1,
          cool: true
        },
        {
          id: 3, 
          name: 'blue',
          cool_factor: 10,
          owner_id: 1,
          cool: true
        },
        {
          id: 4,
          name: 'red',
          cool_factor: 0,
          cool: false,
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/colors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  

    test('returns a single color', async() => {

      const expectation = {
        id: 1,
        name: 'teal',
        cool_factor: 3,
        cool: true,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/colors/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });

});

