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
app.get('/strains', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT
    strains.id as id,
    name_id,
    name,
    image,
    description,
    category,
    price,
    on_sale,
    growers.grower as grower
    from strains left join growers on strains.grower_id=growers.id
    ORDER BY id
    `);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
////////////////////////////////get cool_factor
app.get('/growers', async (req, res) => {
  try {
    const data = await client.query('select * from growers');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


////////////////////////////git colors by id
app.get('/strains/:id', async (req, res) => {
  try {
    const strainsID = req.params.id;

    const data = await client.query(`
    SELECT
    strains.id as id,
    name_id,
    name,
    image,
    description,
    category,
    price,
    on_sale,
    growers.grower as grower
    from strains left join growers on strains.grower_id=growers.id 
    WHERE strains.id=$1
      `, [strainsID]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
//////////post colors
app.post('/strains/', async (req, res) => {
  try {

    const newNameID = req.body.name_id;
    const newName = req.body.name;
    const newImage = req.body.image;
    const newDescription = req.body.description;
    const newCategory = req.body.category;
    const newPrice = req.body.price;
    const newOnSale = req.body.on_sale;
    const newGrowerId = req.body.grower_id;

    const data = await client.query(`
      INSERT INTO strains (name_id, name, image, description, category, price, on_sale, grower_id)
      VALUES($1, $2, $3, $4, $5, $6,$7, $8)
      RETURNING *
      `,
      [newNameID, newName, newImage, newDescription, newCategory, newPrice, newOnSale, newGrowerId]);
    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
/////////////////////////////put colors
app.put('/strains/:id', async (req, res) => {
  try {
    const strainID = req.params.id;
    const newNameID = req.body.name_id;
    const newName = req.body.name;
    const newImage = req.body.image;
    const newDescription = req.body.description;
    const newCategory = req.body.category;
    const newPrice = req.body.price;
    const newOnSale = req.body.on_sale;
    const newGrowerId = req.body.grower_id;

    const data = await client.query(`
      UPDATE STRAINS
      SET
      name_id = $1, 
      name = $2, 
      image = $3, 
      description = $4, 
      category = $5, 
      price = $6, 
      on_sale = $7, 
      grower_id = $8
      WHERE STRAINS.ID = $9
      RETURNING *
      `,
      [newNameID, newName, newImage, newDescription, newCategory, newPrice, newOnSale, newGrowerId, strainID]);
    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
///////////////delete colors
app.delete('/strains/:id', async (req, res) => {
  try {
    const strainsID = req.params.id;

    const data = await client.query(`
      DELETE FROM strains
      WHERE STRAINS.ID = $1
      RETURNING *
      `,
      [strainsID]);
    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
