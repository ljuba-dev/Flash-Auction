import getConnection from "../server/services/db.js";
const db = await getConnection();
/**
 * Create Items Table
 * */
async function createItemsTable() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS auction.items(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        starting_bid DECIMAL(10, 2) NOT NULL,
        current_bid DECIMAL(10, 2) NOT NULL,
        end_time TIMESTAMP NOT NULL
                    )`);
    console.log("Table items created successfully");
  } catch (error) {
    console.log("Table items not created");
    return error;
  }
}
/**
 *  Create Bids Table
 * */
async function createBidsTable() {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS auction.bids (id SERIAL PRIMARY KEY, user_id INT NOT NULL, item_id INT NOT NULL, bid_amount DECIMAL(10, 2) NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
    );
    console.log("Table bids created successfully");
  } catch (error) {
    console.log("Table bids not created");
    return error;
  }
}

/**
 * Create Users Table
 * */
async function createUsersTable() {
  try {
    await db.query(
      "CREATE TABLE IF NOT EXISTS auction.users (id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
    );
    console.log("Table users created successfully");
  } catch (error) {
    console.log("Table users not created");
    return error;
  }
}
async function createTables() {
  try {
    await createItemsTable();
    await createBidsTable();
    await createUsersTable();
  } catch (error) {
    console.log("Tables not created successfully");
  } finally {
    await db.end();
  }
}

export { createTables };
