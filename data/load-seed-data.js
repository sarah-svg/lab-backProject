const client = require('../lib/client');
// import our seed data:
const colors = require('./colors.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const levels = require('./levels.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    await Promise.all(
      levels.map(item => {
        return client.query(`
            INSERT INTO levels (level)
            VALUES ($1)
            RETURNING *;
          `,
        [item.level]);
      })
    );


    const user = users[0].rows[0];

    await Promise.all(
      colors.map(color => {
        return client.query(`
                    INSERT INTO colors (name, cool_factor_id, cool, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
        [color.name, color.cool_factor_id, color.cool, user.id]);
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
