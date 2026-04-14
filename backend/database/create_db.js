import { Pool } from 'pg';

/**
 * Create a database
 * */
async function createDb() {
  const adminConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: 'postgres', // Connecting to the default database
        password: process.env.PG_PASSWORD || 'mysecretpassword',
        port: process.env.PG_PORT || 5432,
      };
  const client = new Pool(adminConfig);

  try {
    const checkIfDbExists = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.PG_DB}'`);
    if (checkIfDbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.PG_DB}`);
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log(`\x1b[32m\t-  Database ${process.env.PG_DB} created.\x1b[0m`);
      }
      return 1;
    } else {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log(`\x1b[33m\t-  Database ${process.env.PG_DB} already exists.\x1b[0m`);
      }
      return 0;
    }
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m\tError creating database:', error.toString() + '\x1b[0m');
    }
  } finally {
    await client.end();
  }
}
/**
 * Create a schema
 **/
async function createSchema() {
  const adminConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DB || 'auction',
        password: process.env.PG_PASSWORD || 'mysecretpassword',
        port: process.env.PG_PORT || 5432,
      };
  const client = new Pool(adminConfig);
  try {
    const checkIfSchemaExists = await client.query(`SELECT 1 FROM pg_namespace WHERE nspname = 'auction';`);
    if (checkIfSchemaExists.rows.length > 0) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[33m\t-  Schema auction already exists.\x1b[0m');
      }
      return 1;
    } else {
      await client.query(`CREATE SCHEMA IF NOT EXISTS auction`);
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[32m\t-  Schema auction created.\x1b[0m');
      }
      return 0;
    }
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m\tError creating schema:', error.toString() + '\x1b[0m');
    }
  } finally {
    await client.end();
  }
}

/**
 * Create database and schema
 * */
async function createDatabaseAndSchema() {
  return {
    db: await createDb(),
    schema: await createSchema(),
  };
}

export { createDatabaseAndSchema };
