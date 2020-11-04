const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { Client } = require('pg');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/colors', async(req, res) => {
  try {
    const data = await client.query('SELECT * from colors');

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }

});
app.get('/colors/:id', async(req, res) => {
  try {
    const colorId = req.params.id;
    const data = await client.query(`
    SELECT * FROM colors
    WHERE colors.id=$1
  `, [colorId]);
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
//////////post
app.post('/colors/', async(req, res) => {
  try {

    const newName = req.body.name;
    const newCoolFactor = req.body.cool_factor;
    const newOwnerId = req.body.owner_id;
    const newCool = req.body.cool;


    const data = await client.query(`
      INSERT INTO colors (name, cool_factor, cool, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,

    [newName, newCoolFactor, newCool, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
/////////////////////////////put
app.put('/colors/:id', async(req, res) => {
  try {
    
    const newName = req.body.name;
    const newCoolFactor = req.body.cool_factor;
    const newCool = req.body.cool;
    const newOwnerId = req.body.owner_id;
 
  

    const data = await client.query(`
      UPDATE colors
      SET name = $1, 
      cool = $2,
      cool_factor = $3,
      
      owner_id = $4

     
      WHERE colors.id = $5

      RETURNING *;
    `, 

    [newName, newCool, newCoolFactor,  newOwnerId, req.params.id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
///////////////delete
app.delete('/colors/:id', async(req, res) => {
  try {
    const colorId = req.params.id;

    const data = await client.query(`
      DELETE from colors
      WHERE colors.id=$1
      
      `,
      
    [colorId]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
      
});




/////////////
app.use(require('./middleware/error'));

module.exports = app;
