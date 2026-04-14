import { DB as db } from './db.js';
import { luaScriptCheckBids, setKey, getKey } from './redis.js';
import { dbWorkerQueue } from './workers/db_worker.js';
import { auctionManager } from './auctionState.js';
import { broadcast } from './ws.js';
import { wsTypes } from '../variables/ws.types.js';
import { getChannel } from './mq.connect.js';

let channel;
/**
 * Check if item exists
 * @param {number} id
 * @returns {Promise}
 * */
async function _checkItem(id) {
  const key = `item_${id}`;
  const cache = await getKey(key);
  if (cache === null || cache === undefined) {
    const getItem = await db.query(`SELECT * FROM auction.items WHERE id = '${id}';`);

    if (getItem.rows.length === 0) {
      return {
        error: true,
        message: 'Item not found',
        statusCode: 404,
      };
    }
    await setKey(key, JSON.stringify(getItem.rows[0]));
    return getItem.rows[0];
  } else {
    return JSON.parse(cache);
  }
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
 * Create bid with PostgreSQL
 * @param {object} item
 * @param {number} user_id
 * @param {number} bid_amount
 * @returns {Promise}
 * */
async function _normalBuild({ item, user_id, bid_amount }) {
  try {
    const item_id = item.id;
    const getItem = await db.query(`SELECT * FROM auction.items WHERE id = '${item_id}';`);
    if (getItem.rows.length === 0) {
      throw new Error('Item not found');
    }
    const _item = getItem.rows[0];
    const currentTime = new Date();
    const endTime = new Date(_item.end_time);

    if (currentTime < endTime) {
      if (bid_amount > _item.current_bid) {
        const updateItem = await db.query(
          `UPDATE auction.items SET current_bid = '${bid_amount}' WHERE id = '${_item.id}';`,
        );
        if (updateItem.rowCount === 0) {
          throw new Error('Item not updated');
        }
        const bidCreate = await db.query(
          `INSERT INTO auction.bids (user_id, item_id, bid_amount) VALUES ('${user_id}', '${item_id}', '${bid_amount}') RETURNING id;`,
        );
        if (bidCreate.rowCount === 0) {
          throw new Error('Bid not created');
        }
        return bidCreate.rows[0].id;
      } else {
        throw new Error('Bid amount is lower than current high bid');
      }
    } else {
      throw new Error('Item is not active');
    }
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return {
      error: true,
      message: e.message,
      statusCode: 202,
    };
  }
}
/**
 * Create bid with Redis
 * @param {object} item
 * @param {number} user_id
 * @param {number} bid_amount
 * @returns {Promise}
 **/
async function _redisBuild({ item, user_id, bid_amount }) {
  try {
    const item_id = item.id;
    const key = `current_high_bid_${item_id}`;
    const bid = await luaScriptCheckBids(key, bid_amount, item);
    if (bid === 'OK') {
      // call normal
      return await _normalBuild({ item, user_id, bid_amount });
    } else if (bid === 'BID_LOW') {
      return {
        error: true,
        message: 'Bid amount is lower than current high bid',
        statusCode: 200,
      };
    } else if (bid === 'BID_EXPIRED') {
      return {
        error: true,
        message: 'Bid expired',
        statusCode: 200,
      };
    } else {
      throw new Error('Bid amount is lower than current high bid');
    }
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Create bid with RabbitMQ
 * @param {object} item
 * @param {number} user_id
 * @param {number} bid_amount
 * @returns {Promise}
 * */
async function _mqBuild({ item, user_id, bid_amount }) {
  try {
    if (!item || !user_id || bid_amount === undefined) {
      throw new Error('Invalid parameters for MQ build');
    }
    const item_id = item.id;
    const key = `current_high_bid_${item_id}`;
    const bid = await luaScriptCheckBids(key, bid_amount, item);
    if (bid === 'OK') {
      channel = getChannel();
      channel.sendToQueue(dbWorkerQueue, Buffer.from(JSON.stringify({ item, user_id, bid_amount })));
      return {
        error: false,
        message: 'Bid placed successfully',
        statusCode: 200,
      };
    } else if (bid === 'BID_LOW') {
      return {
        error: true,
        message: 'Bid amount is lower than current high bid',
        statusCode: 202,
      };
    } else if (bid === 'BID_EXPIRED') {
      return {
        error: true,
        message: 'Bid expired',
        statusCode: 202,
      };
    } else {
      throw new Error('Bid amount is lower than current high bid');
    }
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('SERVICES/BIDS.JS @ 122');
    }
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Update top 10 bids and broadcast to all connected clients
 * @param {object} bidData
 * @param {object} user
 * @return void
 * */
function updateTop10Bids(bidData, user) {
  const bid = {
    id: bidData.id,
    username: user.username,
    timestamp: bidData.date,
    bid_amount: parseInt(bidData.bid_amount),
  };
  auctionManager.updateBids(bid);

  broadcast(wsTypes.TOP_BIDS_UPDATED, {
    payload: auctionManager.getTop10Bids(),
    timestamp: new Date().getTime(),
  });
}
/**
 * Broadcast new bid to all connected clients
 * @param {object} bidData
 * @return void
 * */
function addBid(bidData) {
  const user_id = bidData.user_id;
  const item_id = bidData.item_id;
  const bid_amount = parseInt(bidData.bid_amount);
  // Send WS request
  broadcast(wsTypes.NEW_BID, {
    payload: {
      user_id,
      item_id,
      bid_amount,
    },
    timestamp: new Date(),
  });
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
      throw new Error('Item bidding is not active');
    }
    // Based on .env build type, we call specific function
    if (process.env.BUILD === 'normal') {
      return await _normalBuild({ item, user_id, bid_amount });
    }
    if (process.env.BUILD === 'redis') {
      return await _redisBuild({ item, user_id, bid_amount });
    }
    if (process.env.BUILD === 'mq') {
      return await _mqBuild({ item, user_id, bid_amount });
    }
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    return {
      error: true,
      message: e.message,
      statusCode: 400,
    };
  }
}
/**
 * Get top 10 bids
 * @returns {Promise}
 * */
async function top10Bids() {
  const top10Bids = await db.query(
    `SELECT b.id, b.bid_amount, b.timestamp, u.username FROM auction.bids as b INNER JOIN auction.users as u ON b.user_id = u.id ORDER BY bid_amount DESC LIMIT 10;`,
  );
  return top10Bids.rows || [];
}
export { bid, updateTop10Bids, top10Bids, addBid };
