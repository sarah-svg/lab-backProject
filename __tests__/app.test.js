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
    //////////////////passing
    test('returns strains', async () => {

      const expectation = [
        {
          id: 1,
          name_id: 'granddadypurple',
          name: 'granddaddy purple',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTi3ToDdjfGA3AROLbpPJdhZwf66B7bA2terg&usqp=CAU',
          description: 'great body high and very relaxing',
          category: 'indica',
          price: 50,
          on_sale: false,
          grower: 'indoor canna company',
        },
        {
          id: 2,
          name_id: 'girl scout cookies',
          name: 'gsc',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQiRG0_1-tlcooQymsdFdsPjsz1VyOvR3jyuw&usqp=CAU',
          description: 'wave of euphoria',
          category: 'indica',
          price: 65,
          on_sale: true,
          grower: 'indoor canna company',
        },
        {
          id: 3,
          name_id: 'geleto',
          name: 'Gelato',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT4ZQMPi1lFFbmZBv5DLNrRXfqMb43G168TDw&usqp=CAU',
          description: 'effect is a sense of altered perception',
          category: 'hybrid',
          price: 46,
          on_sale: true,
          grower: 'indoor canna company',
        },
        {
          id: 4,
          name_id: 'blue dream',
          name: 'Blue Dream',
          image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
          description: 'uplifting',
          category: 'hybrid',
          price: 75,
          on_sale: true,
          grower: 'indoor canna company',
        },
      
      ];

      const data = await fakeRequest(app)
        .get('/strains')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    //////////////passing
    test('returns a single strain', async() => {

      const expectation = {
        id: 4,
        name_id: 'blue dream',
        name: 'Blue Dream',
        image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
        description: 'uplifting',
        category: 'hybrid',
        price: 75,
        on_sale: true,
        grower: 'indoor canna company',
      };

      const data = await fakeRequest(app)
        .get('/strains/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    /////////// passing
    test('adds a new strain', async() => {
      const expectation = {
        id: 5,
        name_id: 'blue diesil',
        name: 'Blue Diesel',
        image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
        description: 'uplifting',
        category: 'hybrid',
        price: 55,
        on_sale: true,
        grower_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/strains')
        .send({
          name_id: 'blue diesil',
          name: 'Blue Diesel',
          image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
          description: 'uplifting',
          category: 'hybrid',
          price: 55,
          on_sale: true,
          grower: 'indoor canna company',
          grower_id: 1,
        });
      const allStrains = await fakeRequest(app)
        .get('/strains')

        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allStrains.body.length).toEqual(5);

    });
    ////////////not pass
    test(' updates existing strain', async() => {
      const expectation = {
        id: 1,
        name_id: 'blue dragon',
        name: 'Blue Dragon',
        image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
        description: 'uplifting',
        category: 'hybrid',
        price: 55,
        on_sale: true,
        grower_id: 1,

        // UPDATE STRAINS
        // SET
        // name_id = $1, 
        // name = $2, 
        // image = $3, 
        // description = $4, 
        // category = $5, 
        // price = $6, 
        // on_sale = $7, 
        // grower_id = $8
        // WHERE STRAINS.ID = $9
        // RETURNING *
      };
      const data = await fakeRequest(app)
        .put('/strains/1')
        .send({
          name_id: 'blue dragon',
          name: 'Blue Dragon',
          image: 'https://uploads.medicaljane.com/wp-content/uploads/2012/12/bluedreamHD.jpg',
          description: 'uplifting',
          category: 'hybrid',
          price: 55,
          on_sale: true,
          grower_id: 1,


        })
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedColor = await fakeRequest(app)
        .get('/strains/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(updatedColor.body);


    });
    ////////////////////////pass
    test('deletes one from the strain data', async () => {
      const expectation = {"category": "indica", "description": "wave of euphoria", "grower_id": 1, "id": 2, "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQiRG0_1-tlcooQymsdFdsPjsz1VyOvR3jyuw&usqp=CAU", "name": "gsc", "name_id": "girl scout cookies", "on_sale": true, "price": 65};
      const data = await fakeRequest(app)
        .delete('/strains/2')
        .send({
          id: 2
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const deletedColor = await fakeRequest(app)
        .get('/strains/2')
        .expect('Content-type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(deletedColor.body);
    });



  });

});

