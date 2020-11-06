const client = require('../lib/client');
// import our seed data:
const strains = require('./strains.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const companies = require('./suppliers.js');
run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    ///////////
    await Promise.all(
      companies.map(supplier => {
        return client.query(`
                  INSERT INTO suppliers (supplier)
                  VALUES ($1)
                  RETURNING *;
              `,
        [supplier.supplier]);
      })
    );


 
    ////////
  
    await Promise.all(
      strains.map(strains => {
        return client.query(`
                    INSERT INTO strains (name_id, name, image, description, category, price, on_sale, supplier_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
                `,
        [strains.name_id, strains.name, strains.image, strains.description, strains.category, strains.price, strains.on_sale, strains.supplier_id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
