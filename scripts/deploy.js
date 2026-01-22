const fs = require('fs');
const { parseEnv } = require('util');
const path = require('path');
const { prompt, askPassword, generateRandomPassword } = require(path.join(__dirname, './lib'));

const envPath = path.join(__dirname, '../server/.env');
const db_path = path.join(__dirname, '../db');

let DATABASE_URL;

async function genDotEnv() {
  console.log('We need to access a PostgreSQL database.');
  const db_host = await prompt('Enter db_host [localhost]: ', 'localhost');
  const db_port = await prompt('Enter db_port [5432]: ', '5432');
  const db_name = await prompt('Enter db_name [tracker]: ', 'tracker');
  const db_user = await prompt('Enter db_user [tracker_role]: ', 'tracker_role');
  const pwd = generateRandomPassword(20);
  const db_password = await askPassword(`Enter db_password [${pwd}]: `);
  DATABASE_URL = `postgresql://${db_user}:${db_password === '' ? pwd : db_password}@${db_host}:${db_port}/${db_name}`;

  const auth_secret = generateRandomPassword(64); // 32 should be the minimum here

  console.log('Then we need to access the TMDB.');
  const tmdb_api_key = await prompt('Enter your TMDB API Key: ');

  const content = `DATABASE_URL=${DATABASE_URL}
AUTH_SECRET=${auth_secret}
TMDB_API_KEY=${tmdb_api_key}`;
  fs.writeFileSync(envPath, content, 'utf8');
}

async function main() {

  if (fs.existsSync(envPath)) { // app not installed yet
    const envString = fs.readFileSync(envPath, 'utf8');
    const envObject = parseEnv(envString);
    DATABASE_URL = envObject.DATABASE_URL;
  } else {
    genDotEnv(); // this initializes DATABASE_URL too
  }

  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  let db_migration_version, res;
  try {
    res = await client.query("SELECT value FROM info WHERE key = 'db_migration_version'");
    db_migration_version = res.rows[0].value;
  } catch (err) {
    // DATABASE IS EMPTY
    const sqlFile = fs.readFileSync(path.join(db_path, './init.sql'), 'utf8');
    res = await client.query(sqlFile)
    db_migration_version++;
  }

  if (db_migration_version > 1) {
    console.log(db_migration_version);
    // TODO: db migration (if changes in the future, nothing for now)
  }

  client.release();
  await pool.end();
}
main();