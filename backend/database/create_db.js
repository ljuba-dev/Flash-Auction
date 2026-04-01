import { Pool } from "pg";

async function createDb() {
  const adminConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PG_USER || "postgres",
        host: process.env.PG_HOST || "localhost",
        database: "postgres", // Connecting to the default database
        password: process.env.PG_PASSWORD || "mysecretpassword",
        port: process.env.PG_PORT || 5432,
      };
  const client = new Pool(adminConfig);

  console.log("Connected to the database");
  try {
    const checkIfDbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${process.env.PG_DB}'`,
    );
    if (checkIfDbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${process.env.PG_DB}`);
      console.log(`Database ${process.env.PG_DB} created`);
    } else {
      console.log(`Database ${process.env.PG_DB} already exists`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    await client.end();
  }
}
async function createSchema() {
  const adminConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PG_USER || "postgres",
        host: process.env.PG_HOST || "localhost",
        database: process.env.PG_DB || "auction",
        password: process.env.PG_PASSWORD || "mysecretpassword",
        port: process.env.PG_PORT || 5432,
      };
  const client = new Pool(adminConfig);
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS auction`);
    console.log("Schema auction created");
  } catch (error) {
    console.error("Error creating schema:", error);
  } finally {
    await client.end();
  }
}
async function createDatabaseAndSchema() {
  await createDb();
  await createSchema();
}

export { createDatabaseAndSchema };
