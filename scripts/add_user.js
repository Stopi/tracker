const fs = require('fs');
const { parseEnv } = require('util');
const path = require('path');
const { prompt, askPassword, generateRandomPassword } = require(path.join(__dirname, './lib'));

const envPath = path.join(__dirname, '../server/.env');

async function main() {

  if (!fs.existsSync(envPath)) { // app not installed yet
    console.error('Database URL not found!');
    return 0;
  }
  const envString = fs.readFileSync(envPath, 'utf8');
  const envObject = parseEnv(envString);
  const DATABASE_URL = envObject.DATABASE_URL;

  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  const username = await prompt('Enter username: ');
  const pwd = generateRandomPassword(20);
  const pass = await askPassword(`Enter password [${pwd}]: `);
  const password = pass === '' ? pwd : pass;
  const hashedPassword = await Bun.password.hash(password, { algorithm: 'bcrypt' });

  try {
    const res = await client.query("INSERT INTO u(username, password, roles)VALUES ($1,$2,'root')", [username, hashedPassword]);
  } catch (err) {
    console.error(err);
  }

  client.release();
  await pool.end();
}
main();