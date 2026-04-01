import getConnection from "./db.js";

/**
 * Check if item exists
 * @param {number} id
 * @returns {Promise}
 * */
async function _checkItem(id) {
  const db = await getConnection();
  const getItem = await db.query(
    `SELECT * FROM auction.items WHERE id = '${id}';`,
  );
  if (getItem.rows.length === 0) {
    return {
      error: true,
      message: "Item not found",
      statusCode: 404,
    };
  }
  return getItem.rows[0];
}
/**
 * Check if a user is allowed to bid on an item
 * @param {object} item
 * @returns {boolean}
 * */

function _checkIfAllowToBid(item) {
  const currentTime = new Date();
  const endTime = new Date(item.end_time);
  return currentTime < endTime;
}
/**
 * Bid on an item
 * @param {number} user_id
 * @param {number} item_id
 * @param {number} bid_amount
 * @returns {Promise}
 * */
async function bid(user_id, item_id, bid_amount) {
  try {
    // Check if item exits
    const item = await _checkItem(item_id);
    if (item.error) {
      return item;
    }
    // Check if user is allowed to bid on the item
    if (!_checkIfAllowToBid(item)) {
      throw new Error("Item bidding is not active");
    }
    const db = await getConnection();
    // Update item current bid
    const updateItem = await db.query(
      `UPDATE auction.items SET current_bid = '${bid_amount}' WHERE id = '${item_id}';`,
    );

    if (updateItem.rowCount === 0) {
      throw new Error("Item not updated");
    }
    // Create bid
    const bidCreate = await db.query(
      `INSERT INTO auction.bids (user_id, item_id, bid_amount) VALUES ('${user_id}', '${item_id}', '${bid_amount}') RETURNING id;`,
    );
    if (bidCreate.rowCount === 0) {
      throw new Error("Bid not created");
    }
    return bidCreate.rows[0].id;
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
export { bid };
