const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE suppliers (
                    id SERIAL PRIMARY KEY,
                    supplier VARCHAR(256) NOT NULL
                );           
                CREATE TABLE users (
                  id SERIAL PRIMARY KEY,
                  email VARCHAR(256) NOT NULL,
                  hash VARCHAR(512) NOT NULL
              );          
                CREATE TABLE strains (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name_id VARCHAR(512) NOT NULL,
                    name VARCHAR(512) NOT NULL,
                    image VARCHAR(512) NOT NULL,
                    description VARCHAR(512) NOT NULL,
                    category VARCHAR(512) NOT NULL,
                    price INTEGER NOT NULL,
                    on_sale BOOLEAN NOT NULL,
                    supplier_id INTEGER NOT NULL REFERENCES suppliers(id)
            );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
