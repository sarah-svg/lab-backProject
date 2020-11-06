const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
///const { Client } = require('pg');


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
////////////////////////////get

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});


/////////////////////////////get colors
app.get('/colors', async(req, res) => {
  try {
    const data = await client.query(`select colors.id,
      colors.cool,
      colors.name,
      cool_factor_id  as coolLevel
      from colors join levels
      on levels.id = colors.cool_factor_id
      order by levels.id desc`);

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }

});
////////////////////////////////get cool_factor
app.get('/levels', async(req, res) => {
  try {
    const data = await client.query('select * from levels');

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});


////////////////////////////git colors by id
app.get('/colors/:id', async(req, res) => {
  try {
    const colorId = req.params.id;
    const data = await client.query(`
    select
    colors.id,
    colors.name,
    colors.cool,
    levels.id as levels
      from colors
      join levels
    on levels.id =  colors.cool_factor_id 
    where colors.id=$1
  `, [colorId]);
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
//////////post colors
app.post('/colors/', async(req, res) => {
  try {

    const newName = req.body.name;
    const newCoolFactor = req.body.levels.id;
    const newOwnerId = req.body.owner_id;
    const newCool = req.body.cool;


    const data = await client.query(`
      INSERT INTO colors (name, levels.id, cool, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,

    [newName, newCoolFactor, newCool, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
/////////////////////////////put colors
app.put('/colors/:id', async(req, res) => {
  try {

    const newName = req.body.name;
    const newCoolFactor = req.body.cool_factor_id;
    const newCool = req.body.cool;
    const newOwnerId = req.body.owner_id;



    const data = await client.query(`
      UPDATE colors
      SET name = $1, 
      cool = $2,
      cool_factor_id = $3,
      owner_id = $4
      WHERE colors.id = $5

      RETURNING *;
    `,

    [newName, newCool, newCoolFactor, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
///////////////delete colors
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
