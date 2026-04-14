import { DB as db } from '../server/services/db.js';
/**
 * Create Items Table
 * */
async function createItemsTable() {
  try {
    const checkIfTbableExists = await db.query(`SELECT 1 FROM pg_tables WHERE tablename = 'items'`);
    if (checkIfTbableExists.rows.length > 0) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[33m\t-  Table items already exists.\x1b[0m');
      }
      return 0;
    }
    await db.query(`CREATE TABLE IF NOT EXISTS auction.items(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        starting_bid DECIMAL(10, 2) NOT NULL,
        current_bid DECIMAL(10, 2) NOT NULL,
        end_time TIMESTAMP NOT NULL
                    )`);

    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[32m\t-  Table items created successfully\x1b[0m');
    }
    return 1;
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m\t-  Table items not created.\x1b[0m');
    }
    return error;
  }
}
/**
 *  Create Bids Table
 * */
async function createBidsTable() {
  try {
    const checkIfTbableExists = await db.query(`SELECT 1 FROM pg_tables WHERE tablename = 'bids'`);
    if (checkIfTbableExists.rows.length > 0) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[33m\t-  Table bids already exists.\x1b[0m');
      }
      return 0;
    }
    await db.query(
      'CREATE TABLE IF NOT EXISTS auction.bids (id SERIAL PRIMARY KEY, user_id INT NOT NULL, item_id INT NOT NULL, bid_amount DECIMAL(10, 2) NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);',
    );
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[32m\t-  Table bids created successfully\x1b[0m');
    }
    return 1;
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m\t-  Table bids not created.\x1b[0m');
    }
    return error;
  }
}

/**
 * Create Users Table
 * */
async function createUsersTable() {
  try {
    const checkIfTbableExists = await db.query(`SELECT 1 FROM pg_tables WHERE tablename = 'users'`);
    if (checkIfTbableExists.rows.length > 0) {
      if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
        console.log('\x1b[33m\t-  Table users already exists.\x1b[0m');
      }
      return 0;
    }
    await db.query(
      'CREATE TABLE IF NOT EXISTS auction.users (id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);',
    );
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[32m\t-  Table users created successfully.\x1b[0m');
    }
    return 1;
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m\t-  Table users not created.\x1b[0m');
    }
    return error;
  }
}
/**
 * Drop all tables
 **/
async function dropAllTables() {
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('Dropping all tables...');
  }
  // Drop all tables so we can create them again
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('\x1b[31m\t-  Deleting tables starting...\x1b[0m');
  }
  await db.query('DROP TABLE IF EXISTS auction.users CASCADE');
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('\x1b[31m\t\t*  Table users deleted successfully.\x1b[0m');
  }
  await db.query('DROP TABLE IF EXISTS auction.items CASCADE');
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('\x1b[31m\t\t*  Table items deleted successfully.\x1b[0m');
  }
  await db.query('DROP TABLE IF EXISTS auction.bids CASCADE');
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('\x1b[31m\t\t*  Table bids deleted successfully.\x1b[0m');
  }
  if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
    console.log('\x1b[31m\t-  Tables deleted successfully.\x1b[0m');
  }
}
/**
 * Create all tables
 * */
async function createTables() {
  try {
    if (process.env.CLEAR_DATA) {
      await dropAllTables();
    }
    return {
      items: await createItemsTable(),
      table: await createBidsTable(),
      users: await createUsersTable(),
    };
  } catch (error) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('Tables not created successfully');
    }
  }
}

export { createTables };
