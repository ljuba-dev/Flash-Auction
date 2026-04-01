import getConnection from "./db.js";
/**
 * Get all items
 * @returns {object[]} items
 * */
async function getItems() {
  try {
    const db = await getConnection();
    const items = await db.query(`select * from auction.items`);
    return items.rows;
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Get item by id
 * @param id {number} item id
 * @return {object} item
 * */
async function getItemById(id) {
  try {
    const db = await getConnection();
    const item = await db.query(`select * from auction.items where id = ${id}`);
    if (item.rows.length === 0) {
      throw new Error("Item not found");
    } else {
      return item.rows[0];
    }
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Create item
 * @param item {object} item
 * @returns {object} item*/
async function createItem(item) {
  try {
    const db = await getConnection();
    const checkIfItemExists = await db.query(
      `select * from auction.items where name = '${item.name}'`,
    );
    if (checkIfItemExists.rows.length > 0) {
      throw new Error("Item already exists");
    } else {
      const insertItem = await db.query(
        `INSERT INTO auction.items (name, description, starting_bid, current_bid, end_time) VALUES ('${item.name}', '${item.description}', '${item.starting_bid}', '${item.current_bid}', '${item.end_time}') RETURNING id;`,
      );
      return insertItem.rows[0].id;
    }
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
    };
  }
}
/**
 * Update item
 * @param id {number} item id
 * @param item {object} item
 * @returns {object} item
 * */
async function updateItem(id, item) {
  try {
    const db = await getConnection();
    const checkIfItemExists = await db.query(
      `select id from auction.items where id = ${id}`,
    );
    if (checkIfItemExists.rows.length === 0) {
      throw new Error("Item not found");
    } else {
      let query = "update auction.items set ";
      query += Object.keys(item)
        .map((key) => `${key} = '${item[key]}'`)
        .join(", ");
      query += ` where id = ${id}`;
      return await db.query(query);
    }
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: "Error updating item",
      statusCode: 400,
    };
  }
}
/**
 * Delete item
 * @param id {number} item id
 * @returns {Promise}
 * */
async function deleteItem(id) {
  try {
    if (!id) throw new Error("Item id is required");
    if (typeof id !== "number") throw new Error("Item id must be a number");
    const db = await getConnection();
    const deleteItem = await db.query(
      `delete from auction.items where id = ${id}`,
    );
    return !!deleteItem;
  } catch (e) {
    console.log("\x1b[31m" + e.message + "\x1b[0m");
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
export { getItems, getItemById, createItem, updateItem, deleteItem };
